import fs from "fs";
import path from "path";
import { renderBlogContent } from "@/lib/blog-renderer";

export default async function ArticleContent({ slug }: { slug: string }) {
  const filePath = path.join(process.cwd(), "content/blog", `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return (
      <div className="rounded-2xl border border-night/10 bg-white p-12 text-center">
        <p className="text-base font-bold text-night/50">
          This article is coming soon.
        </p>
      </div>
    );
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const trimmed = raw.trim();

  const isPlaceholder =
    !trimmed.startsWith("#") &&
    trimmed.length < 200;

  if (isPlaceholder) {
    return (
      <div className="rounded-2xl border border-night/10 bg-white p-12 text-center">
        <p className="text-base font-bold text-night/50">{trimmed}</p>
      </div>
    );
  }

  const content = await renderBlogContent(raw);

  return <article className="prose-orka">{content}</article>;
}
