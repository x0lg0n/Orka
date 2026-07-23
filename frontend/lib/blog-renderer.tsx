import React from "react";
import Callout from "@/app/(marketing)/blog/[slug]/components/Callout";
import QuoteBlock from "@/app/(marketing)/blog/[slug]/components/QuoteBlock";

type InlineToken = { type: "text"; value: string } | { type: "bold"; value: string } | { type: "code"; value: string } | { type: "link"; text: string; href: string };

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/^`(.+?)`/);
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/);

    const matches: { idx: number; length: number; token: InlineToken }[] = [];
    if (boldMatch) matches.push({ idx: 0, length: boldMatch[0].length, token: { type: "bold", value: boldMatch[1] } });
    if (codeMatch) matches.push({ idx: remaining.indexOf(codeMatch[0]), length: codeMatch[0].length, token: { type: "code", value: codeMatch[1] } });
    if (linkMatch) matches.push({ idx: remaining.indexOf(linkMatch[0]), length: linkMatch[0].length, token: { type: "link", text: linkMatch[1], href: linkMatch[2] } });

    const atStart = matches.find(m => m.idx === 0);
    if (atStart) {
      tokens.push(atStart.token);
      remaining = remaining.slice(atStart.length);
    } else {
      const nextIdx = Math.min(...matches.map(m => m.idx), remaining.length);
      if (nextIdx > 0) {
        tokens.push({ type: "text", value: remaining.slice(0, nextIdx) });
        remaining = remaining.slice(nextIdx);
      } else {
        tokens.push({ type: "text", value: remaining });
        break;
      }
    }
  }

  return tokens;
}

function renderInline(tokens: InlineToken[]): React.ReactNode {
  const elements = tokens.map((t, i) => {
    switch (t.type) {
      case "bold": return <strong key={i}>{t.value}</strong>;
      case "code": return <code key={i}>{t.value}</code>;
      case "link": return <a key={i} href={t.href}>{t.text}</a>;
      case "text": return t.value;
    }
  });
  return elements.length === 1 ? elements[0] : React.createElement(React.Fragment, null, ...elements);
}

function renderInlineString(text: string): React.ReactNode {
  return renderInline(tokenizeInline(text));
}

interface Block {
  type: "h2" | "h3" | "p" | "ul" | "ol" | "callout" | "quote" | "code" | "blockquote" | "empty";
  lines: string[];
  meta?: string;
}

function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimEnd();

    if (trimmed === "") {
      blocks.push({ type: "empty", lines: [] });
      i++;
      continue;
    }

    if (/^## /.test(trimmed)) {
      blocks.push({ type: "h2", lines: [trimmed.replace(/^## /, "")] });
      i++;
      continue;
    }

    if (/^### /.test(trimmed)) {
      blocks.push({ type: "h3", lines: [trimmed.replace(/^### /, "")] });
      i++;
      continue;
    }

    const calloutMatch = trimmed.match(/^<Callout\s+variant="(\w+)">\s*$/);
    if (calloutMatch) {
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("</Callout>")) {
        const cl = lines[i].trim();
        if (cl) contentLines.push(cl);
        i++;
      }
      i++;
      blocks.push({ type: "callout", lines: contentLines, meta: calloutMatch[1] });
      continue;
    }

    if (/^<QuoteBlock>\s*$/.test(trimmed)) {
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("</QuoteBlock>")) {
        const cl = lines[i].trim();
        if (cl) contentLines.push(cl);
        i++;
      }
      i++;
      blocks.push({ type: "quote", lines: contentLines });
      continue;
    }

    if (/^```/.test(trimmed)) {
      const contentLines: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        contentLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "code", lines: contentLines });
      continue;
    }

    if (/^> /.test(trimmed)) {
      const contentLines: string[] = [trimmed.replace(/^> /, "")];
      i++;
      while (i < lines.length && /^> /.test(lines[i].trimStart())) {
        contentLines.push(lines[i].trim().replace(/^> /, ""));
        i++;
      }
      blocks.push({ type: "blockquote", lines: contentLines });
      continue;
    }

    if (/^[-*]\s/.test(trimmed)) {
      const items: string[] = [trimmed.replace(/^[-*]\s+/, "")];
      i++;
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", lines: items });
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [trimmed.replace(/^\d+\.\s+/, "")];
      i++;
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", lines: items });
      continue;
    }

    const paraLines: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trimEnd() !== "" &&
      !/^## /.test(lines[i]) &&
      !/^### /.test(lines[i]) &&
      !/^[-*]\s/.test(lines[i].trim()) &&
      !/^\d+\.\s/.test(lines[i].trim()) &&
      !/^<\//.test(lines[i].trim()) &&
      !/^<(Callout|QuoteBlock)/.test(lines[i].trim()) &&
      !/^```/.test(lines[i].trim()) &&
      !/^> /.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "p", lines: paraLines });
  }

  return blocks;
}

export function renderBlogContent(mdxSource: string): React.ReactNode {
  const lines = mdxSource.split("\n");
  const blocks = parseBlocks(lines);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    switch (block.type) {
      case "h2": {
        const text = block.lines[0];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        elements.push(<h2 key={i} id={id}>{renderInlineString(text)}</h2>);
        break;
      }
      case "h3": {
        const text = block.lines[0];
        const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        elements.push(<h3 key={i} id={id}>{renderInlineString(text)}</h3>);
        break;
      }
      case "p":
        elements.push(<p key={i}>{renderInlineString(block.lines.join(" "))}</p>);
        break;
      case "ul":
        elements.push(
          <ul key={i}>
            {block.lines.map((item, j) => (
              <li key={j}>{renderInlineString(item)}</li>
            ))}
          </ul>
        );
        break;
      case "ol":
        elements.push(
          <ol key={i}>
            {block.lines.map((item, j) => (
              <li key={j}>{renderInlineString(item)}</li>
            ))}
          </ol>
        );
        break;
      case "callout":
        elements.push(
          <Callout key={i} variant={block.meta as any}>
            {block.lines.join(" ")}
          </Callout>
        );
        break;
      case "quote":
        elements.push(
          <QuoteBlock key={i}>
            {block.lines.join(" ")}
          </QuoteBlock>
        );
        break;
      case "code":
        elements.push(
          <pre key={i}>
            <code>{block.lines.join("\n")}</code>
          </pre>
        );
        break;
      case "blockquote":
        elements.push(
          <blockquote key={i}>
            {block.lines.map((l, j) => (
              <p key={j}>{renderInlineString(l)}</p>
            ))}
          </blockquote>
        );
        break;
    }
  }

  return React.createElement(React.Fragment, null, ...elements);
}
