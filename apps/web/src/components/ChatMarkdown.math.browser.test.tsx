import { act, type ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { setMarkdownTaskChecked } from "./files/filePreviewMode";

const settingsOverrides = vi.hoisted(() => ({ mathRenderingEnabled: false }));
vi.mock(import("../hooks/useSettings"), async (original) => {
  const actual = await original();
  return {
    ...actual,
    useClientSettings: ((
      select?: (value: ReturnType<typeof actual.getClientSettings>) => unknown,
    ) => {
      const value = { ...actual.getClientSettings(), ...settingsOverrides };
      return select ? select(value) : value;
    }) as never,
  };
});
// Atoms derived from the server config run in the real registry over a missing config.
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

const roots: Root[] = [];

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
});

afterEach(async () => {
  for (const root of roots.splice(0)) await act(async () => root.unmount());
  document.body.replaceChildren();
  settingsOverrides.mathRenderingEnabled = false;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function render(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  roots.push(root);
  await act(async () => root.render(element));
  return container;
}

function formulas(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>("span[data-markdown-math]")].map(
    (formula) => formula.dataset.markdownCopy,
  );
}

const text = "Area $\\pi r^2$ costs $5 and $10.\n\n\\[\nE = mc^2\n\\]\n\n- [ ] check \\(x\\)";

describe("ChatMarkdown math", () => {
  it("leaves math as text while the setting is off", async () => {
    expect(formulas(await render(<ChatMarkdown cwd="/tmp/project" text={text} />))).toEqual([]);
    // Raw HTML carrying the math classes stays code while the setting is off.
    const raw = await render(
      <ChatMarkdown cwd="/tmp/project" text={'<code class="language-math math-inline">x</code>'} />,
    );
    expect(raw.querySelectorAll("[data-markdown-math]")).toHaveLength(0);
  });

  it("typesets formulas, keeping prices and task offsets intact", async () => {
    settingsOverrides.mathRenderingEnabled = true;
    // Both the sanitized raw-HTML pipeline and the literal one keep the math classes.
    for (const parseRawHtml of [true, false]) {
      let edited: string | undefined;
      const container = await render(
        <ChatMarkdown
          cwd="/tmp/project"
          text={text}
          parseRawHtml={parseRawHtml}
          onTaskListChange={({ markerOffset, checked }) => {
            edited = setMarkdownTaskChecked(text, markerOffset, checked);
          }}
        />,
      );
      expect(formulas(container)).toEqual(["$\\pi r^2$", "$$\nE = mc^2\n$$\n\n", "$x$"]);
      expect(container.textContent).toContain("costs $5 and $10.");
      await vi.waitFor(() => expect(container.querySelectorAll(".katex")).toHaveLength(3));

      await act(async () =>
        container.querySelector<HTMLInputElement>("input[type=checkbox]")!.click(),
      );
      expect(edited).toBe(text.replace("- [ ]", "- [x]"));
    }
  });

  it("typesets blocks that list indentation recovery parses again", async () => {
    settingsOverrides.mathRenderingEnabled = true;
    const container = await render(
      <ChatMarkdown
        cwd="/tmp/project"
        text={"-       intro\n\n        $$\n        x^2\n        $$"}
      />,
    );
    expect(formulas(container)).toEqual(["$$\nx^2\n$$\n\n"]);
  });
});
