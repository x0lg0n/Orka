import Link from "next/link";
import { FileText, ArrowRight, BookOpen } from "lucide-react";
import NewsletterWidget from "./NewsletterWidget";
import CategoryFilter from "./CategoryFilter";
import BlogSearch from "./BlogSearch";

const freeResources = [
  "Proposal Template",
  "Contract Template",
  "Invoice Template",
  "Agency Onboarding Checklist",
  "Client Discovery Questions",
  "Project Kickoff Checklist",
];

const popularGuides = [
  { title: "Proposal vs Contract vs Invoice", readingTime: "4 min read" },
  { title: "How Agencies Lose 40% Revenue", readingTime: "8 min read" },
  { title: "Managing Multiple Projects", readingTime: "8 min read" },
  { title: "Why Escrow is the Future", readingTime: "7 min read" },
];

interface BlogSidebarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
}

export default function BlogSidebar({ activeCategory, onCategoryChange, searchQuery, onSearchChange }: BlogSidebarProps) {
  return (
    <aside className="hidden w-full shrink-0 lg:block lg:w-[280px]">
      <div className="sticky top-24 space-y-6">
        {/* Section 1: Search */}
        <BlogSearch value={searchQuery} onChange={onSearchChange} />

        {/* Section 2: Categories */}
        <div>
          <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-night/50">
            Categories
          </h3>
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>

        {/* Section 3: Stay in the Loop */}
        <NewsletterWidget />

        {/* Section 4: Popular Guides */}
        <div className="rounded-2xl border border-night/10 bg-white p-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-night/50">
            Popular Guides
          </h3>
          <div className="mt-3 space-y-0">
            {popularGuides.map((guide, i) => (
              <div key={guide.title}>
                <Link
                  href="/blog"
                  className="group flex items-start gap-3 rounded py-2.5 text-sm font-bold text-night/70 transition-colors hover:text-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50"
                >
                  <BookOpen size={14} className="mt-0.5 shrink-0 text-violet/50" />
                  <div>
                    {guide.title}
                    <span className="mt-0.5 block text-2xs font-bold text-night/35">
                      {guide.readingTime}
                    </span>
                  </div>
                </Link>
                {i < popularGuides.length - 1 && (
                  <div className="border-b border-night/5" />
                )}
              </div>
            ))}
          </div>
          <Link
            href="/blog"
            className="mt-3 block text-center text-xs font-black text-violet hover:underline"
          >
            View all articles →
          </Link>
        </div>

        {/* Section 5: Free Resources */}
        <div className="rounded-2xl border border-night/10 bg-white p-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-night/50">
            Free Resources
          </h3>
          <div className="mt-3 space-y-2.5">
            {freeResources.map((r) => (
              <Link
                key={r}
                href="/resources"
                className="flex items-center justify-between text-sm font-bold text-night/70 transition-colors hover:text-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50 rounded"
              >
                <span className="flex items-center gap-2">
                  <FileText size={13} className="text-violet" />
                  {r}
                </span>
                <ArrowRight size={12} className="text-night/20" />
              </Link>
            ))}
          </div>
          <Link
            href="/resources"
            className="mt-3 block text-center text-xs font-black text-violet hover:underline"
          >
            View all resources →
          </Link>
        </div>
      </div>
    </aside>
  );
}
