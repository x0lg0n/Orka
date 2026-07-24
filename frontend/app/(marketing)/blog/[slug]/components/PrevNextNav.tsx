import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blogs/types";

export default function PrevNextNav({
  prev,
  next,
}: {
  prev: BlogPostMeta | null;
  next: BlogPostMeta | null;
}) {
  if (!prev && !next) return null;

  return (
    <nav className="mt-16 grid gap-4 border-t border-night/10 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group rounded-2xl border border-night/10 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span className="text-2xs font-black uppercase tracking-wider text-night/40">
            ← Previous
          </span>
          <p className="mt-2 text-sm font-bold text-night group-hover:text-violet transition-colors">
            {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          className="group rounded-2xl border border-night/10 bg-white p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span className="text-2xs font-black uppercase tracking-wider text-night/40">
            Next →
          </span>
          <p className="mt-2 text-sm font-bold text-night group-hover:text-violet transition-colors">
            {next.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
