import type { SectionContent, ContentBlock } from "@/lib/blogs/types";
import Callout from "./Callout";
import QuoteBlock from "./QuoteBlock";

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case "paragraph":
      return <p key={index}>{block.text}</p>;
    case "list":
      return (
        <ul key={index}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "ordered-list":
      return (
        <ol key={index}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <Callout key={index} variant={block.variant}>
          {block.text}
        </Callout>
      );
    case "quote":
      return <QuoteBlock key={index}>{block.text}</QuoteBlock>;
    default:
      return null;
  }
}

function renderSectionContent(item: SectionContent, index: number) {
  if ("id" in item && "heading" in item && "blocks" in item) {
    const HeadingTag = item.level === 2 ? "h2" : "h3";
    return (
      <section key={index}>
        <HeadingTag id={item.id}>{item.heading}</HeadingTag>
        {item.blocks.map((block, i) => renderBlock(block, i))}
      </section>
    );
  }

  return renderBlock(item as ContentBlock, index);
}

export default function ArticleContent({
  sections,
}: {
  sections: SectionContent[];
}) {
  return (
    <article className="prose-orka">
      {sections.map((item, i) => renderSectionContent(item, i))}
    </article>
  );
}
