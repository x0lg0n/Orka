import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPostMeta } from "@/lib/blogs/types";

export default function RelatedPosts({ posts }: { posts: BlogPostMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="display text-2xl uppercase text-night sm:text-3xl">
        You might also like
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group block overflow-hidden rounded-[18px] border-2 border-night bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)]"
          >
            <div
              className={`aspect-[16/10] bg-gradient-to-br ${post.coverGradient} p-5 transition-transform duration-500 group-hover:scale-[1.03]`}
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9474ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
            </div>
            <div className="p-5">
              <span className="mb-2 inline-block rounded-full bg-violet/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-violet">
                {post.category}
              </span>
              <h3 className="display text-lg uppercase leading-tight text-night">
                {post.title}
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-violet/10 text-[9px] font-black text-violet">
                  {post.author.initials}
                </span>
                <p className="text-[11px] font-bold text-night/40">
                  {post.readingTime}
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-black text-violet">
                Read Article{" "}
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
