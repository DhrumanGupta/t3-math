import { describe, expect, it, vi } from "vite-plus/test";

import { act, render } from "../../test/render";
import { setMarkdownTaskChecked } from "./files/filePreviewMode";

const settingsOverrides = vi.hoisted(() => ({ mathRenderingEnabled: false }));
vi.mock(import("../hooks/useSettings"), async (original) => {
  const actual = await original();
  type Settings = ReturnType<typeof actual.getClientSettings>;
  function useClientSettings<T = Settings>(select?: (settings: Settings) => T): T {
    const settings = { ...actual.getClientSettings(), ...settingsOverrides };
    return select ? select(settings) : (settings as T);
  }
  return { ...actual, useClientSettings };
});
// ChatMarkdown reads config-derived atoms even without a connected environment.
vi.mock(import("../state/server"), async (original) => {
  const actual = await original();
  const { Atom } = await import("effect/reactivity");
  const noConfig = Atom.make(null);
  return {
    ...actual,
    serverEnvironment: { ...actual.serverEnvironment, configValueAtom: (() => noConfig) as never },
  };
});
vi.mock(import("../remoteOpen"), async (original) => ({
  ...(await original()),
  useRemoteOpenResolution: () => ({ state: { mode: "local-exec" }, isResolved: true }) as never,
}));

import ChatMarkdown from "./ChatMarkdown";

function setup(enabled = false) {
  settingsOverrides.mathRenderingEnabled = enabled;
}

function formulas(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>("span[data-markdown-math]")].map(
    (formula) => formula.dataset.markdownCopy,
  );
}

const text = "Area $\\pi r^2$ costs $5 and $10.\n\n\\[\nE = mc^2\n\\]\n\n- [ ] check \\(x\\)";

describe("ChatMarkdown math", () => {
  it("leaves math and authored math classes as text while the setting is off", async () => {
    setup();
    await using screen = await render(<ChatMarkdown cwd="/tmp/project" text={text} />);
    expect(formulas(screen.container)).toEqual([]);
    await screen.rerender(
      <ChatMarkdown cwd="/tmp/project" text={'<code class="language-math math-inline">x</code>'} />,
    );
    expect(formulas(screen.container)).toEqual([]);
  });

  it.each([true, false])(
    "typesets formulas and preserves prices and task offsets with raw HTML %s",
    async (parseRawHtml) => {
      setup(true);
      let edited: string | undefined;
      await using screen = await render(
        <ChatMarkdown
          cwd="/tmp/project"
          text={text}
          parseRawHtml={parseRawHtml}
          onTaskListChange={({ markerOffset, checked }) => {
            edited = setMarkdownTaskChecked(text, markerOffset, checked);
          }}
        />,
      );
      expect(formulas(screen.container)).toEqual([
        "\\(\\pi r^2\\)",
        "\\[\nE = mc^2\n\\]\n\n",
        "\\(x\\)",
      ]);
      expect(screen.container.textContent).toContain("costs $5 and $10.");
      await vi.waitFor(() => expect(screen.container.querySelectorAll(".katex")).toHaveLength(3));
      await act(() =>
        screen.container.querySelector<HTMLInputElement>("input[type=checkbox]")!.click(),
      );
      expect(edited).toBe(text.replace("- [ ]", "- [x]"));
      settingsOverrides.mathRenderingEnabled = false;
      await screen.rerender(
        <ChatMarkdown cwd="/tmp/project" text={text} parseRawHtml={parseRawHtml} />,
      );
      expect(formulas(screen.container)).toEqual([]);
    },
  );

  it("typesets blocks that list indentation recovery parses again", async () => {
    setup(true);
    await using screen = await render(
      <ChatMarkdown
        cwd="/tmp/project"
        text={"-       intro\n\n        $$\n        x^2\n        $$"}
      />,
    );
    expect(formulas(screen.container)).toEqual(["\\[\nx^2\n\\]\n\n"]);
  });
});
