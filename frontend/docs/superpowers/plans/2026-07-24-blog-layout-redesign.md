# Blog Listing Page Layout Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the blog listing page from a content-first layout to a knowledge-hub layout with a sticky left sidebar (categories, newsletter, popular guides, resources) and a right-side content grid, while preserving all existing ORKA design system components.

**Architecture:** Restructure `page.tsx` from vertical stacking (Hero→Featured→Search→Filter→Grid+Sidebar) to a two-column layout (Sidebar|Content). Replace horizontal `CategoryFilter` pills with vertical sidebar categories. Add sort dropdown. Remove FeaturedCard. Keep all existing card, pagination, hero, CTA, and newsletter components unchanged.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide icons, existing ORKA component library.

## Global Constraints

- ORKA branding, typography, colors, spacing, components, animations — unchanged
- Navbar, Hero section, BlogCard design, CTA section, Footer — unchanged
- Reuse existing components: BlogCard, BlogGrid, Pagination, BlogHero, BlogCta, NewsletterWidget, BlogSearch
- Keep existing routes, blog data, filtering logic, pagination logic
- Container max-width: 1440px (already `max-w-7xl`)
- Sidebar width: 280px
- Gap between sidebar and content: 32px
- Grid spacing: 24px horizontal, 32px vertical

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `app/(marketing)/blog/page.tsx` | Modify | New two-column layout, add sort state, remove FeaturedCard |
| `app/(marketing)/blog/components/BlogSidebar.tsx` | Rewrite | New sidebar with Categories, Newsletter, Popular Guides, Free Resources |
| `app/(marketing)/blog/components/CategoryFilter.tsx` | Rewrite | Convert from horizontal pills to vertical sidebar list |
| `app/(marketing)/blog/components/BlogGrid.tsx` | Modify | Update grid spacing to 24px h / 32px v |
| `app/(marketing)/blog/components/SortDropdown.tsx` | Create | Sort dropdown component (Latest, Oldest, Most Popular, Reading Time) |
| `app/(marketing)/blog/components/index.ts` | Modify | Add SortDropdown export |

**Unchanged files:** BlogCard.tsx, BlogHero.tsx, BlogCta.tsx, Pagination.tsx, NewsletterWidget.tsx, BlogSearch.tsx, FeaturedCard.tsx (kept but unused from page), types.ts

---

### Task 1: Create SortDropdown component

**Files:**
- Create: `app/(marketing)/blog/components/SortDropdown.tsx`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: `<SortDropdown value={sortValue} onChange={setSortValue} />`

- [ ] **Step 1: Create the SortDropdown component**

```tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type SortValue = "latest" | "oldest" | "popular" | "reading-time";

const options: { value: SortValue; label: string }[] = [
  { value: "latest", label: "Latest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "popular", label: "Most Popular" },
  { value: "reading-time", label: "Reading Time" },
];

interface SortDropdownProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-night/10 bg-white px-4 py-2 text-sm font-bold text-night/60 transition-colors hover:border-violet/30 hover:text-night focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50"
        aria-label="Sort articles"
        aria-expanded={open}
      >
        {current?.label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-night/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`block w-full px-4 py-2.5 text-left text-sm font-bold transition-colors ${
                value === opt.value
                  ? "bg-violet/10 text-violet"
                  : "text-night/60 hover:bg-night/5 hover:text-night"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify lint passes**

Run: `cd frontend && pnpm lint app/(marketing)/blog/components/SortDropdown.tsx`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add frontend/app/(marketing)/blog/components/SortDropdown.tsx
git commit -m "feat(blog): add SortDropdown component"
```

---

### Task 2: Rewrite CategoryFilter for vertical sidebar use

**Files:**
- Modify: `app/(marketing)/blog/components/CategoryFilter.tsx`

**Interfaces:**
- Consumes: `categories` from `@/lib/blog-data`, `activeCategory`, `onCategoryChange`
- Produces: vertical list with check icon, name, count; active state with purple bg + left accent

- [ ] **Step 1: Rewrite CategoryFilter to vertical sidebar layout**

Replace entire file with:

```tsx
"use client";

import { Check } from "lucide-react";
import { categories, blogPosts } from "@/lib/blog-data";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

function getCategoryCount(cat: string): number {
  if (cat === "All") return blogPosts.length;
  return blogPosts.filter((p) => p.category === cat).length;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="space-y-0.5">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        const count = getCategoryCount(cat);
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50 ${
              isActive
                ? "border-l-[3px] border-l-violet bg-violet/10 pl-[9px] text-violet"
                : "border-l-[3px] border-l-transparent text-night/60 hover:bg-night/5 hover:text-night"
            }`}
          >
            {isActive && <Check size={14} className="shrink-0 text-violet" />}
            <span className="flex-1">{cat}</span>
            <span className={`text-xs font-bold ${isActive ? "text-violet/60" : "text-night/30"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify lint passes**

Run: `cd frontend && pnpm lint app/(marketing)/blog/components/CategoryFilter.tsx`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add frontend/app/(marketing)/blog/components/CategoryFilter.tsx
git commit -m "feat(blog): rewrite CategoryFilter as vertical sidebar list with counts"
```

---

### Task 3: Rewrite BlogSidebar with new sections

**Files:**
- Modify: `app/(marketing)/blog/components/BlogSidebar.tsx`

**Interfaces:**
- Consumes: `blogPosts` from `@/lib/blog-data`, `NewsletterWidget`, `CategoryFilter`
- Produces: sticky sidebar with 4 sections: Categories, Stay in the Loop, Popular Guides, Free Resources

- [ ] **Step 1: Rewrite BlogSidebar**

Replace entire file with:

```tsx
import Link from "next/link";
import { FileText, ArrowRight, BookOpen } from "lucide-react";
import NewsletterWidget from "./NewsletterWidget";
import CategoryFilter from "./CategoryFilter";

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
}

export default function BlogSidebar({ activeCategory, onCategoryChange }: BlogSidebarProps) {
  return (
    <aside className="hidden w-full shrink-0 lg:block lg:w-[280px]">
      <div className="sticky top-24 space-y-6">
        {/* Section 1: Categories */}
        <div>
          <h3 className="mb-3 text-xs font-black uppercase tracking-wider text-night/50">
            Categories
          </h3>
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>

        {/* Section 2: Stay in the Loop */}
        <NewsletterWidget />

        {/* Section 3: Popular Guides */}
        <div className="rounded-2xl border border-night/10 bg-white p-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-night/50">
            Popular Guides
          </h3>
          <div className="mt-3 space-y-0">
            {popularGuides.map((guide, i) => (
              <div key={guide.title}>
                <Link
                  href="/blog"
                  className="group flex items-start gap-3 py-2.5 text-sm font-bold text-night/70 transition-colors hover:text-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50 rounded"
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

        {/* Section 4: Free Resources */}
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
                <ArrowRight size={12} className="text-night/20 transition-transform group-hover:translate-x-0.5" />
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
```

- [ ] **Step 2: Verify lint passes**

Run: `cd frontend && pnpm lint app/(marketing)/blog/components/BlogSidebar.tsx`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add frontend/app/(marketing)/blog/components/BlogSidebar.tsx
git commit -m "feat(blog): rewrite BlogSidebar with categories, popular guides, free resources"
```

---

### Task 4: Update BlogGrid spacing

**Files:**
- Modify: `app/(marketing)/blog/components/BlogGrid.tsx:16`

**Interfaces:**
- Consumes: `BlogPost[]`
- Produces: grid with updated gap spacing

- [ ] **Step 1: Update grid gap**

Change line 16 from:
```tsx
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
```
to:
```tsx
    <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
```

(24px horizontal = `gap-x-6`, 32px vertical = `gap-y-8`)

- [ ] **Step 2: Verify lint passes**

Run: `cd frontend && pnpm lint app/(marketing)/blog/components/BlogGrid.tsx`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add frontend/app/(marketing)/blog/components/BlogGrid.tsx
git commit -m "feat(blog): update BlogGrid spacing to 24px h / 32px v"
```

---

### Task 5: Update index.ts exports

**Files:**
- Modify: `app/(marketing)/blog/components/index.ts`

**Interfaces:**
- Consumes: SortDropdown
- Produces: updated exports

- [ ] **Step 1: Add SortDropdown export**

Add to `index.ts`:
```tsx
export { default as SortDropdown } from "./SortDropdown";
export type { SortValue } from "./SortDropdown";
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/(marketing)/blog/components/index.ts
git commit -m "feat(blog): export SortDropdown component"
```

---

### Task 6: Rewrite page.tsx with new layout

**Files:**
- Modify: `app/(marketing)/blog/page.tsx`

**Interfaces:**
- Consumes: BlogHero, BlogSidebar (with activeCategory/onCategoryChange), BlogGrid, Pagination, BlogCta, SortDropdown, blogPosts, getPostsByCategory
- Produces: new two-column layout page

- [ ] **Step 1: Rewrite page.tsx**

Replace entire file with:

```tsx
"use client";

import { useState, useMemo } from "react";
import BlogHero from "./components/BlogHero";
import FeaturedCard from "./components/FeaturedCard";
import BlogGrid from "./components/BlogGrid";
import BlogSidebar from "./components/BlogSidebar";
import Pagination from "./components/Pagination";
import BlogCta from "./components/BlogCta";
import BlogSearch from "./components/BlogSearch";
import SortDropdown, { type SortValue } from "./components/SortDropdown";
import {
  getFeaturedPost,
  getPostsByCategory,
  blogPosts,
} from "@/lib/blog-data";

const POSTS_PER_PAGE = 9;

function sortPosts(posts: ReturnType<typeof getPostsByCategory>, sort: SortValue) {
  const sorted = [...posts];
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    case "popular":
      return sorted.sort((a, b) => (a.featured ? -1 : 1) - (b.featured ? -1 : 1));
    case "reading-time":
      return sorted.sort((a, b) => parseInt(a.readingTime) - parseInt(b.readingTime));
    case "latest":
    default:
      return sorted.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortValue>("latest");

  const filtered = useMemo(() => {
    const posts = getPostsByCategory(activeCategory);
    if (!searchQuery.trim()) return posts;
    const q = searchQuery.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [activeCategory, searchQuery]);

  const sorted = useMemo(() => sortPosts(filtered, sort), [filtered, sort]);

  const totalPages = Math.ceil(sorted.length / POSTS_PER_PAGE);
  const paginated = sorted.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-paper">
      <BlogHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Two-column layout: Sidebar + Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <BlogSidebar
            activeCategory={activeCategory}
            onCategoryChange={(cat) => {
              setActiveCategory(cat);
              setCurrentPage(1);
            }}
          />

          {/* Main Content */}
          <div className="min-w-0 flex-1">
            {/* Above-grid bar: count + sort */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-bold text-night/50">
                Showing {filtered.length} {filtered.length === 1 ? "article" : "articles"}
              </p>
              <SortDropdown value={sort} onChange={setSort} />
            </div>

            {/* Blog Grid */}
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-night/10 bg-white p-12 text-center">
                <p className="text-md font-bold text-night/50">
                  No articles found matching &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="mt-3 text-base font-bold text-violet hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <>
                <BlogGrid posts={paginated} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      </section>

      <BlogCta />
    </main>
  );
}
```

- [ ] **Step 2: Verify lint passes**

Run: `cd frontend && pnpm lint app/(marketing)/blog/page.tsx`
Expected: No new errors

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && pnpm build`
Expected: Build succeeds, all pages generated

- [ ] **Step 4: Commit**

```bash
git add frontend/app/(marketing)/blog/page.tsx
git commit -m "feat(blog): restructure page with sidebar+grid knowledge hub layout"
```

---

### Task 7: Final verification

- [ ] **Step 1: Full lint**

Run: `cd frontend && pnpm lint`
Expected: No new errors (only pre-existing warnings)

- [ ] **Step 2: Full build**

Run: `cd frontend && pnpm build`
Expected: Build succeeds, `/blog` and `/blog/[slug]` routes generated

- [ ] **Step 3: Visual check**

Run: `cd frontend && pnpm dev`
Open http://localhost:3000/blog and verify:
- Hero section unchanged
- Sidebar on left with Categories (with counts + check icon), Newsletter, Popular Guides, Free Resources
- Sidebar sticky while scrolling
- Content area shows "Showing X articles" + Sort dropdown
- 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
- No FeaturedCard
- Pagination below grid
- CTA section unchanged
- Category filtering works
- Sort dropdown works
- Search works
- Mobile: sidebar sections collapse (accordion or stack above content)
