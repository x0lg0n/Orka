// frontend/lib/proposalBlocks.test.ts
import { describe, it, expect } from "vitest";
import { blocksToMarkdown, isEmptyBlocks } from "./proposalBlocks";

describe("proposalBlocks", () => {
  it("renders a heading + paragraph block to markdown", () => {
    const blocks = [
      { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Scope", styles: {} }] },
      { type: "paragraph", content: [{ type: "text", text: "Build the thing.", styles: {} }] },
    ];
    const md = blocksToMarkdown(blocks);
    expect(md).toContain("# Scope");
    expect(md).toContain("Build the thing.");
  });

  it("isEmptyBlocks true for null/empty/default placeholder", () => {
    expect(isEmptyBlocks(null)).toBe(true);
    expect(isEmptyBlocks([])).toBe(true);
    expect(
      isEmptyBlocks([{ type: "paragraph", content: [] }])
    ).toBe(true);
    expect(
      isEmptyBlocks([{ type: "paragraph", content: [{ type: "text", text: "hi" }] }])
    ).toBe(false);
  });
});
