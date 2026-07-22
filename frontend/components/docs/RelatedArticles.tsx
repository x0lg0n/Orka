import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { docsNavigation } from "@/lib/docs/config";

interface RelatedArticlesProps {
  slug: string;
}

export default function RelatedArticles({ slug }: RelatedArticlesProps) {
  const allItems = docsNavigation.flatMap((s) => s.items);
  const current = allItems.findIndex((i) => i.slug === slug);

  const related = [];
  for (let i = 1; i <= 3; i++) {
    const idx = (current + i) % allItems.length;
    related.push(allItems[idx]);
  }

  return (
    <div className="mt-12">
      <h3 className="display text-2xl uppercase text-night">
        Continue Reading
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {related.map((item) => (
          <Link
            key={item.slug}
            href={`/docs/${item.slug}`}
            className="group flex items-center gap-3 rounded-xl border-2 border-night/10 p-4 transition-all hover:-translate-y-0.5 hover:border-violet hover:shadow-[0_0_30px_rgba(148,116,255,0.1)]"
          >
            <div className="flex-1">
              <p className="text-sm font-black text-night">{item.title}</p>
            </div>
            <ArrowRight
              size={14}
              className="shrink-0 text-night/20 transition-transform group-hover:translate-x-1"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
