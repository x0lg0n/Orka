// frontend/lib/proposalBlocks.ts
type BlockText = { type?: string; text?: string };
type Block = {
  type?: string;
  props?: { level?: number };
  content?: BlockText[] | string;
};

function blockText(content: Block["content"]): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((c) => (typeof c?.text === "string" ? c.text : ""))
    .join("");
}

export function blocksToMarkdown(blocks: unknown[]): string {
  const arr = Array.isArray(blocks) ? (blocks as Block[]) : [];
  return arr
    .map((b) => {
      const text = blockText(b.content);
      switch (b.type) {
        case "heading": {
          const level = Math.min(Math.max(b.props?.level ?? 1, 1), 3);
          return `${"#".repeat(level)} ${text}`;
        }
        case "bulletListItem":
          return `- ${text}`;
        case "numberedListItem":
          return `1. ${text}`;
        case "quote":
          return `> ${text}`;
        case "codeBlock":
          return "```\n" + text + "\n```";
        default:
          return text;
      }
    })
    .filter((line) => line.length > 0)
    .join("\n\n");
}

export function isEmptyBlocks(blocks: unknown[] | null | undefined): boolean {
  if (!Array.isArray(blocks) || blocks.length === 0) return true;
  const arr = blocks as Block[];
  if (arr.length > 1) return false;
  const only = arr[0];
  if (only?.type && only.type !== "paragraph") return false;
  return blockText(only?.content).trim().length === 0;
}
