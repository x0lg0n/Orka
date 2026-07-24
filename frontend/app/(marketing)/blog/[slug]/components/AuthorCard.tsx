import type { BlogAuthor } from "@/lib/blogs/types";

export default function AuthorCard({ author }: { author: BlogAuthor }) {
  return (
    <div className="rounded-2xl border border-night/10 bg-white p-5">
      <p className="text-2xs font-black uppercase tracking-wider text-night/40">
        Written By
      </p>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-night/10 text-base font-black text-night/60">
          {author.initials}
        </span>
        <div>
          <p className="text-base font-bold text-night">{author.name}</p>
          <p className="text-sm font-bold text-night/50">{author.role}</p>
        </div>
      </div>
    </div>
  );
}
