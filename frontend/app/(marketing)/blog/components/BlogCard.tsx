import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "./types";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-[18px] border-2 border-night bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)]"
    >
      <div
        className={`aspect-[16/10] bg-gradient-to-br ${post.coverGradient} p-5 transition-transform duration-500 group-hover:scale-[1.03] relative overflow-hidden`}
      >
        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-5">
        <span className="mb-2 inline-block rounded-full bg-night/5 px-3 py-1 text-2xs font-black uppercase tracking-wider text-night/60">
          {post.category}
        </span>
        <h3 className="display text-lg uppercase leading-tight text-night">
          {post.title}
        </h3>
        <p className="mt-2 text-base font-bold leading-5 text-night/55 line-clamp-2">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-full bg-night/10 text-2xs font-black text-night/60">
            {post.author.initials}
          </span>
          <div>
            <p className="text-sm font-bold text-night">{post.author.name}</p>
            <p className="text-2xs font-bold text-night/40">
              {post.publishedAt} · {post.readingTime}
            </p>
          </div>
        </div>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-night/60 group-hover:text-violet">
          Read Article{" "}
          <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
