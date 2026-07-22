import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllDocSlugs, getDocBySlug, getParentSlug } from "@/lib/docs/config";
import { renderMDX } from "@/lib/docs/mdx";
import DocsBreadcrumbs from "@/components/docs/DocsBreadcrumbs";
import DocsRightSidebar from "@/components/docs/DocsRightSidebar";
import PrevNextNav from "@/components/docs/PrevNextNav";
import Feedback from "@/components/docs/Feedback";
import RelatedArticles from "@/components/docs/RelatedArticles";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug: slug.split("/") }));
}

function extractHeadings(source: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(source)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    headings.push({ id, text, level });
  }
  return headings;
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const slugPath = Array.isArray(slug) ? slug.join("/") : slug;
  const doc = getDocBySlug(slugPath);

  if (!doc) {
    notFound();
  }

  const docsDir = path.join(process.cwd(), "content/docs");
  
  let filePath = path.join(docsDir, `${slugPath}.mdx`);
  
  const parentSlug = getParentSlug(slugPath);
  if (!fs.existsSync(filePath) && parentSlug) {
    filePath = path.join(docsDir, `${slugPath}/overview.mdx`);
  }
  
  if (!fs.existsSync(filePath)) {
    filePath = path.join(docsDir, `${parentSlug || slugPath}.mdx`);
  }

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);
  const headings = extractHeadings(content);
  const mdxContent = await renderMDX(content);

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 md:px-8 lg:px-12">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="min-w-0">
          <DocsBreadcrumbs slug={slugPath} />

          <h1 className="display text-4xl uppercase sm:text-5xl text-night">
            {data.title || doc.title}
          </h1>

          {data.description && (
            <p className="mt-3 text-base font-normal leading-7 text-night/60 sm:text-[18px]">
              {data.description}
            </p>
          )}

          <div className="mt-8">{mdxContent}</div>

          <PrevNextNav slug={slugPath} />
          <Feedback slug={slugPath} />
          <RelatedArticles slug={slugPath} />
        </article>

        <DocsRightSidebar headings={headings} />
      </div>
    </div>
  );
}
