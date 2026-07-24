import Link from "next/link";
import { FileText } from "lucide-react";
import type { BlogArticle } from "@/lib/blogs/types";
import ShareButtons from "./ShareButtons";

export default function ArticleHeader({ post }: { post: BlogArticle }) {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm font-bold text-night/40">
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
      <span className="inline-block rounded-full border border-night/10 bg-night/5 px-3 py-1 text-2xs font-black uppercase tracking-wider text-night/60">
        {post.category}
      </span>

      {/* Title */}
      <h1 className="display mt-4 text-3xl uppercase leading-[1.1] text-night sm:text-4xl md:text-[2.8rem]">
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="mt-4 max-w-2xl text-md font-bold leading-6 text-night/60">
        {post.excerpt}
      </p>

      {/* Author + metadata */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-night/10 text-xs font-black text-night/60">
            {post.author.initials}
          </span>
          <div>
            <p className="text-base font-bold text-night">{post.author.name}</p>
            <p className="text-xs font-bold text-night/40">
              {post.publishedAt} · {post.readingTime}
            </p>
          </div>
        </div>
        <ShareButtons />
      </div>

      {/* Cover image */}
      <div
        className={`mt-8 aspect-[16/9] w-full rounded-2xl bg-gradient-to-br ${post.coverGradient} p-8 relative overflow-hidden`}
      >
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-xl bg-white/80 shadow-sm">
            <FileText size={28} className="text-violet" />
          </div>
        )}
      </div>
    </>
  );
}
