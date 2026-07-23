import Link from "next/link";
import { FileText } from "lucide-react";
import type { BlogPostDetail } from "@/lib/blog-data";
import ShareButtons from "./ShareButtons";

export default function ArticleHeader({ post }: { post: BlogPostDetail }) {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-[12px] font-bold text-night/40">
        <Link href="/" className="transition-colors hover:text-night/70">
          Home
        </Link>
        <span>/</span>
        <Link href="/blog" className="transition-colors hover:text-night/70">
          Blog
        </Link>
        <span>/</span>
        <span className="text-night/60">{post.category}</span>
        <span>/</span>
        <span className="line-clamp-1 text-night/70">{post.title}</span>
      </nav>

      {/* Category badge */}
      <span className="inline-block rounded-full border border-violet/30 bg-violet/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-violet">
        {post.category}
      </span>

      {/* Title */}
      <h1 className="display mt-4 text-3xl uppercase leading-[1.1] text-night sm:text-4xl md:text-[2.8rem]">
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="mt-4 max-w-2xl text-[15px] font-bold leading-6 text-night/60">
        {post.excerpt}
      </p>

      {/* Author + metadata */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-violet/10 text-[11px] font-black text-violet">
            {post.author.initials}
          </span>
          <div>
            <p className="text-[13px] font-bold text-night">{post.author.name}</p>
            <p className="text-[11px] font-bold text-night/40">
              {post.publishedAt} · {post.readingTime}
            </p>
          </div>
        </div>
        <ShareButtons />
      </div>

      {/* Cover image */}
      <div
        className={`mt-8 aspect-[16/9] w-full rounded-2xl bg-gradient-to-br ${post.coverGradient} p-8`}
      >
        <div className="flex size-14 items-center justify-center rounded-xl bg-white/80 shadow-sm">
          <FileText size={28} className="text-violet" />
        </div>
      </div>
    </>
  );
}
