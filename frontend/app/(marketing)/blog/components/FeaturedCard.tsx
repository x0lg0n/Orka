import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "./types";

export default function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-[20px] border-2 border-night bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)]"
    >
      <div className="grid gap-0 md:grid-cols-[1.2fr_1fr]">
        {/* Image */}
        <div
          className={`aspect-[16/10] bg-gradient-to-br ${post.coverGradient} p-8 transition-transform duration-500 group-hover:scale-[1.02] md:aspect-auto`}
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/80 shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-6 md:p-8">
          <span className="mb-3 inline-block w-fit rounded-full bg-night/5 px-3 py-1 text-xs font-black uppercase tracking-wider text-night/60">
            {post.category}
          </span>
          <h2 className="display text-2xl uppercase text-night sm:text-3xl">
            {post.title}
          </h2>
          <p className="mt-3 text-md font-bold leading-6 text-night/60">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-night/10 text-xs font-black text-night/60">
              {post.author.initials}
            </span>
            <div>
              <p className="text-base font-bold text-night">
                {post.author.name}
              </p>
              <p className="text-xs font-bold text-night/40">
                {post.publishedAt} · {post.readingTime}
              </p>
            </div>
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 text-base font-black text-night/60 group-hover:text-violet">
            Read Article{" "}
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
