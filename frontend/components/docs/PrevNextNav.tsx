import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getAdjacentDocs } from "@/lib/docs/config";

interface PrevNextNavProps {
  slug: string;
}

export default function PrevNextNav({ slug }: PrevNextNavProps) {
  const { prev, next } = getAdjacentDocs(slug);

  return (
    <div className="mt-16 grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/docs/${prev.slug}`}
          className="group flex items-center gap-3 rounded-xl border-2 border-night/10 p-4 transition-all hover:-translate-y-0.5 hover:border-violet hover:shadow-[0_0_30px_rgba(148,116,255,0.1)]"
        >
          <ArrowLeft
            size={16}
            className="shrink-0 text-night/30 transition-transform group-hover:-translate-x-1"
          />
          <div>
            <p className="text-[11px] font-bold uppercase text-night/40">
              Previous
            </p>
            <p className="text-sm font-black text-night">{prev.title}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/docs/${next.slug}`}
          className="group flex items-center justify-end gap-3 rounded-xl border-2 border-night/10 p-4 text-right transition-all hover:-translate-y-0.5 hover:border-violet hover:shadow-[0_0_30px_rgba(148,116,255,0.1)]"
        >
          <div>
            <p className="text-[11px] font-bold uppercase text-night/40">
              Next
            </p>
            <p className="text-sm font-black text-night">{next.title}</p>
          </div>
          <ArrowRight
            size={16}
            className="shrink-0 text-night/30 transition-transform group-hover:translate-x-1"
          />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
