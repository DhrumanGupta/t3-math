import { describe, expect, it } from "vite-plus/test";

import { chatMarkdownClipboardPayload } from "./markdown-clipboard";

function select(start: Node, startOffset: number, end: Node, endOffset: number) {
  const range = document.createRange();
  range.setStart(start, startOffset);
  range.setEnd(end, endOffset);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  return selection;
}

describe("copying rendered math", () => {
  it("copies a formula's TeX whether the selection spans it or starts inside it", () => {
    const container = document.body.appendChild(document.createElement("div"));
    using _cleanup = {
      [Symbol.dispose]() {
        window.getSelection()?.removeAllRanges();
        container.remove();
      },
    };
    container.innerHTML = `<div class="chat-markdown"><p>Area <span data-markdown-math="inline" data-markdown-copy="$\\pi r^2$"><span class="katex"><span class="katex-mathml">πr2</span><span class="katex-html" aria-hidden="true">πr2</span></span></span> grows.</p></div>`;
    const paragraph = container.querySelector("p")!;
    const glyphs = container.querySelector(".katex-mathml")!.firstChild!;

    expect(
      chatMarkdownClipboardPayload(select(paragraph.firstChild!, 0, paragraph.lastChild!, 7))?.text,
    ).toBe("Area $\\pi r^2$ grows.");
    expect(chatMarkdownClipboardPayload(select(glyphs, 0, glyphs, 1))?.text).toBe("$\\pi r^2$");
  });
});
