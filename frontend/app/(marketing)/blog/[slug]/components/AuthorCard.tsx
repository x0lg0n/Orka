import Link from "next/link";
import type { BlogAuthor } from "../../components/types";

export default function AuthorCard({ author }: { author: BlogAuthor }) {
  return (
    <div className="rounded-2xl border border-night/10 bg-white p-5">
      <p className="text-[10px] font-black uppercase tracking-wider text-night/40">
        Written By
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-violet/10 text-[13px] font-black text-violet">
          {author.initials}
        </span>
        <div>
          <p className="text-[14px] font-bold text-night">{author.name}</p>
          <p className="text-[12px] font-bold text-night/50">{author.role}</p>
        </div>
      </div>
      <Link
        href="/blog"
        className="mt-4 block text-center text-[12px] font-black text-violet hover:underline"
      >
        View all posts →
      </Link>
    </div>
  );
}
