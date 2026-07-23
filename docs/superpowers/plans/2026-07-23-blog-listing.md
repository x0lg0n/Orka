# ORKA Blog Listing Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium SaaS blog listing page at `/blog` with hero, featured article, category filters, 3-column blog grid, sticky sidebar, pagination, and bottom CTA.

**Architecture:** Rewrite `app/(marketing)/blog/page.tsx` in-place. Co-locate components in `app/(marketing)/blog/components/`. Mock data in `lib/blog-data.ts`. Reuses existing `(marketing)` layout (Navbar + Footer). All CSS-only animations from globals.css.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4 (CSS-first), lucide-react, next/image.

## Global Constraints

- **Framework:** Next.js 16 App Router, React 19, TypeScript strict mode
- **Styling:** Tailwind v4 via `@tailwindcss/postcss` — NO `tailwind.config.ts`, theme in `globals.css` `@theme inline {}`
- **Fonts:** Anton (`.display`), DM Sans (body), JetBrains Mono (`.tabular`) — CSS variables from root layout
- **Colors:** night (#082033), paper (#fffaf2), violet (#9474ff), teal (#22bd93), orange (#ff8a22), coral (#ff4f42)
- **Package manager:** pnpm
- **No comments** in code unless asked
- **Icons:** lucide-react only
- **Animations:** CSS-only (globals.css `float-y` etc.). No framer-motion.
- **Images:** Placeholder gradients — no external image dependencies
- **Lint:** Run `pnpm lint` in `frontend/` after each task
- **Co-located components:** `app/(marketing)/blog/components/` with relative `./components/...` import

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `app/(marketing)/blog/components/types.ts` | `BlogPost`, `BlogAuthor` interfaces |
| `lib/blog-data.ts` | Mock blog posts array |
| `app/(marketing)/blog/components/BlogHero.tsx` | Hero section with search + floating cards (client) |
| `app/(marketing)/blog/components/FeaturedCard.tsx` | Large featured article card (server) |
| `app/(marketing)/blog/components/CategoryFilter.tsx` | Scrollable filter pills (client) |
| `app/(marketing)/blog/components/BlogCard.tsx` | Individual blog card (server) |
| `app/(marketing)/blog/components/BlogGrid.tsx` | 3-column grid of BlogCards (server) |
| `app/(marketing)/blog/components/NewsletterWidget.tsx` | Email subscribe widget (client) |
| `app/(marketing)/blog/components/BlogSidebar.tsx` | Sticky sidebar with 4 widgets (server) |
| `app/(marketing)/blog/components/Pagination.tsx` | Page navigation (client) |
| `app/(marketing)/blog/components/BlogCta.tsx` | Bottom CTA section (server) |

### Modified Files
| File | Change |
|------|--------|
| `app/(marketing)/blog/page.tsx` | Full rewrite — blog listing page |
| `components/Navbar.tsx` | Change "Get started" CTA to "Join Waitlist" |

---

## Task 1: Types + Mock Data

**Files:**
- Create: `app/(marketing)/blog/components/types.ts`
- Create: `lib/blog-data.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `BlogPost`, `BlogAuthor` types; `blogPosts` array; `categories` array; `featuredPost` getter

- [ ] **Step 1: Create types file**

```ts
export interface BlogAuthor {
  name: string;
  initials: string;
  role: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverGradient: string;
  category: string;
  author: BlogAuthor;
  readingTime: string;
  publishedAt: string;
  featured: boolean;
}
```

- [ ] **Step 2: Create mock data**

```ts
import type { BlogPost } from "@/app/(marketing)/blog/components/types";

export const categories = [
  "All",
  "Agency",
  "Freelancers",
  "Client Management",
  "Payments",
  "Escrow",
  "Contracts",
  "Proposals",
  "Productivity",
  "AI",
  "Guides",
  "Templates",
  "News",
] as const;

export type Category = (typeof categories)[number];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "agencies-lose-revenue-bad-client-management",
    title: "How Agencies Lose 40% Revenue Because of Bad Client Management",
    excerpt:
      "From scattered proposals to delayed payments, learn the 5 biggest leaks in your agency operations (and how to fix them).",
    coverGradient: "from-violet/20 via-violet/10 to-teal/10",
    category: "Agency",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "8 min read",
    publishedAt: "May 12, 2026",
    featured: true,
  },
  {
    id: "2",
    slug: "ai-writes-better-proposals",
    title: "How AI Writes Better Proposals (That Clients Actually Accept)",
    excerpt:
      "Prompt strategies, structure, and real examples from winning proposals.",
    coverGradient: "from-violet/15 via-info/10 to-violet/5",
    category: "AI",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "6 min read",
    publishedAt: "May 10, 2026",
    featured: false,
  },
  {
    id: "3",
    slug: "escrow-future-of-client-payments",
    title: "Why Escrow Is the Future of Client Payments",
    excerpt:
      "Build trust, reduce risk, and get paid on time with milestone-based escrow.",
    coverGradient: "from-teal/15 via-teal/8 to-lime/5",
    category: "Escrow",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "7 min read",
    publishedAt: "May 9, 2026",
    featured: false,
  },
  {
    id: "4",
    slug: "freelancer-contracts-protect-you",
    title: "Freelancer Contracts That Protect You (And Your Clients)",
    excerpt:
      "Key clauses every freelancer and agency should include in 2026.",
    coverGradient: "from-orange/12 via-orange/6 to-coral/5",
    category: "Contracts",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "5 min read",
    publishedAt: "May 8, 2026",
    featured: false,
  },
  {
    id: "5",
    slug: "agency-onboarding-checklist",
    title: "The Ultimate Agency Onboarding Checklist",
    excerpt:
      "A step-by-step system to onboard clients smoothly and reduce churn.",
    coverGradient: "from-lime/12 via-lime/6 to-teal/5",
    category: "Agency",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "6 min read",
    publishedAt: "May 6, 2026",
    featured: false,
  },
  {
    id: "6",
    slug: "managing-multiple-projects",
    title: "Managing Multiple Projects Without Losing Your Mind",
    excerpt:
      "Workflows, tools and systems that keep your projects on track.",
    coverGradient: "from-info/12 via-info/6 to-violet/5",
    category: "Productivity",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "8 min read",
    publishedAt: "May 5, 2026",
    featured: false,
  },
  {
    id: "7",
    slug: "proposal-vs-contract-vs-invoice",
    title: "Proposal vs Contract vs Invoice: What's the Difference?",
    excerpt:
      "A simple breakdown every service business owner should know.",
    coverGradient: "from-violet/10 via-coral/8 to-orange/5",
    category: "Guides",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "4 min read",
    publishedAt: "May 3, 2026",
    featured: false,
  },
  {
    id: "8",
    slug: "milestone-payments-client-trust",
    title: "Why Milestone-Based Payments Build 10x More Client Trust",
    excerpt:
      "Stop chasing invoices. Start approving milestones.",
    coverGradient: "from-teal/12 via-violet/8 to-teal/5",
    category: "Payments",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "6 min read",
    publishedAt: "May 1, 2026",
    featured: false,
  },
  {
    id: "9",
    slug: "freelancer-to-agency-owner",
    title: "From Freelancer to Agency Owner: A Complete Guide",
    excerpt:
      "The systems, mindset, and tools you need to make the leap.",
    coverGradient: "from-orange/10 via-lime/8 to-teal/5",
    category: "Agency",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "9 min read",
    publishedAt: "Apr 28, 2026",
    featured: false,
  },
  {
    id: "10",
    slug: "ai-helps-agencies-win-clients",
    title: "How AI Helps Agencies Win More Clients in Less Time",
    excerpt:
      "From proposal generation to client research — AI tools that actually work.",
    coverGradient: "from-violet/15 via-violet/10 to-info/5",
    category: "AI",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "5 min read",
    publishedAt: "Apr 25, 2026",
    featured: false,
  },
  {
    id: "11",
    slug: "pricing-strategies-agencies",
    title: "5 Pricing Strategies for Agencies That Actually Work",
    excerpt:
      "Value-based, retainer, hybrid — pick the right model for your stage.",
    coverGradient: "from-lime/10 via-orange/8 to-violet/5",
    category: "Agency",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "7 min read",
    publishedAt: "Apr 22, 2026",
    featured: false,
  },
  {
    id: "12",
    slug: "client-portal-benefits",
    title: "Why Every Agency Needs a Client Portal in 2026",
    excerpt:
      "Reduce back-and-forth, build trust, and look professional overnight.",
    coverGradient: "from-info/12 via-violet/8 to-teal/5",
    category: "Client Management",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "5 min read",
    publishedAt: "Apr 18, 2026",
    featured: false,
  },
];

export function getFeaturedPost(): BlogPost {
  return blogPosts.find((p) => p.featured) || blogPosts[0];
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === "All") return blogPosts.filter((p) => !p.featured);
  return blogPosts.filter((p) => !p.featured && p.category === category);
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS (no new errors)

- [ ] **Step 4: Commit**

```bash
git add frontend/app/\(marketing\)/blog/components/types.ts frontend/lib/blog-data.ts
git commit -m "feat(blog): add BlogPost types and mock data"
```

---

## Task 2: BlogHero Component

**Files:**
- Create: `app/(marketing)/blog/components/BlogHero.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<BlogHero />` — hero section with search bar and floating UI cards

- [ ] **Step 1: Create BlogHero component**

```tsx
"use client";

import { Search } from "lucide-react";

function FloatingCard({
  label,
  badge,
  badgeColor,
  icon,
  iconColor,
  style,
}: {
  label: string;
  badge: string;
  badgeColor: string;
  icon: string;
  iconColor: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="absolute hidden rounded-xl border border-night/8 bg-white px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] lg:block"
      style={style}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid size-9 place-items-center rounded-lg ${iconColor}`}
        >
          {icon === "file" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
          {icon === "shield" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          )}
          {icon === "wallet" && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 10H2" />
            </svg>
          )}
        </span>
        <div>
          <p className="text-[13px] font-bold text-night">{label}</p>
          <p className={`text-[11px] font-bold ${badgeColor}`}>{badge}</p>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="absolute hidden rounded-xl border border-night/8 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] lg:block"
      style={style}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-bold text-night">Q2 Website Redesign</p>
        <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-bold text-teal">
          USDC 9,000
        </span>
      </div>
      <p className="mb-3 text-[11px] font-bold text-night/40">Milestones</p>
      <div className="space-y-2">
        {[
          { name: "Research & Strategy", amount: "USDC 1,500", done: true },
          { name: "Design & Prototyping", amount: "USDC 2,400", done: true },
          { name: "Development", amount: "USDC 3,300", done: false },
          { name: "Testing & Launch", amount: "USDC 1,700", done: false },
        ].map((m) => (
          <div key={m.name} className="flex items-center gap-2">
            <span
              className={`size-4 rounded-full border-2 ${m.done ? "border-teal bg-teal" : "border-night/20"} flex items-center justify-center`}
            >
              {m.done && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </span>
            <span className="flex-1 text-[11px] font-bold text-night/70">
              {m.name}
            </span>
            <span className="text-[10px] font-bold text-night/40">
              {m.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogHero() {
  function handleSearchFocus() {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
    );
  }

  return (
    <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
      {/* Background blurs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-violet/8 blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-teal/6 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl pt-16 pb-4 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
        {/* Left: Text */}
        <div>
          <span className="inline-block rounded-full border border-violet/30 bg-violet/15 px-4 py-1.5 text-[13px] font-bold text-violet">
            ORKA JOURNAL
          </span>
          <h1 className="display mx-auto mt-6 max-w-xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4rem] md:text-[5rem] lg:mx-0">
            Insights for Modern Service Businesses
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-normal leading-7 text-white/70 sm:text-lg sm:leading-8 lg:mx-0">
            Actionable insights, templates, and strategies to help agencies and
            freelancers run smarter and grow faster.
          </p>
          <div className="mx-auto mt-8 max-w-xl lg:mx-0">
            <button
              onClick={handleSearchFocus}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/8 px-5 py-4 text-left text-sm text-white/50 transition-colors hover:bg-white/12"
            >
              <Search size={18} />
              Search articles...
              <kbd className="ml-auto rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-white/40">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>

        {/* Right: Floating cards */}
        <div className="relative hidden h-[400px] lg:block">
          <FloatingCard
            label="Proposals"
            badge="AI Generated"
            badgeColor="text-violet"
            icon="file"
            iconColor="bg-violet/10 text-violet"
            style={{ top: 20, left: 40 }}
          />
          <FloatingCard
            label="Escrow"
            badge="Secured"
            badgeColor="text-teal"
            icon="shield"
            iconColor="bg-teal/10 text-teal"
            style={{ top: 160, left: 0 }}
          />
          <FloatingCard
            label="Payments"
            badge="On Track"
            badgeColor="text-orange"
            icon="wallet"
            iconColor="bg-orange/10 text-orange"
            style={{ top: 300, left: 60 }}
          />
          <ProjectCard style={{ top: 40, right: 0, width: 280 }} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(marketing\)/blog/components/BlogHero.tsx
git commit -m "feat(blog): add BlogHero with search bar and floating UI cards"
```

---

## Task 3: FeaturedCard Component

**Files:**
- Create: `app/(marketing)/blog/components/FeaturedCard.tsx`

**Interfaces:**
- Consumes: `BlogPost` from `./types`
- Produces: `<FeaturedCard post={BlogPost} />` — large horizontal featured article card

- [ ] **Step 1: Create FeaturedCard component**

```tsx
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9474ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-6 md:p-8">
          <span className="mb-3 inline-block w-fit rounded-full bg-violet/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-violet">
            {post.category}
          </span>
          <h2 className="display text-2xl uppercase text-night sm:text-3xl">
            {post.title}
          </h2>
          <p className="mt-3 text-[15px] font-bold leading-6 text-night/60">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-violet/10 text-[11px] font-black text-violet">
              {post.author.initials}
            </span>
            <div>
              <p className="text-[13px] font-bold text-night">
                {post.author.name}
              </p>
              <p className="text-[11px] font-bold text-night/40">
                {post.publishedAt} · {post.readingTime}
              </p>
            </div>
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-black text-violet">
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
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(marketing\)/blog/components/FeaturedCard.tsx
git commit -m "feat(blog): add FeaturedCard component"
```

---

## Task 4: CategoryFilter Component

**Files:**
- Create: `app/(marketing)/blog/components/CategoryFilter.tsx`

**Interfaces:**
- Consumes: `categories: readonly string[]`, `activeCategory: string`, `onCategoryChange: (cat: string) => void`
- Produces: `<CategoryFilter />` — scrollable pill bar

- [ ] **Step 1: Create CategoryFilter component**

```tsx
"use client";

import { categories } from "@/lib/blog-data";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-all duration-200 ${
            activeCategory === cat
              ? "bg-violet text-white shadow-[0_2px_8px_rgba(148,116,255,0.3)]"
              : "border border-night/15 text-night/60 hover:bg-night/5 hover:text-night"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(marketing\)/blog/components/CategoryFilter.tsx
git commit -m "feat(blog): add CategoryFilter scrollable pill component"
```

---

## Task 5: BlogCard Component

**Files:**
- Create: `app/(marketing)/blog/components/BlogCard.tsx`

**Interfaces:**
- Consumes: `BlogPost` from `./types`
- Produces: `<BlogCard post={BlogPost} />` — individual blog card for grid

- [ ] **Step 1: Create BlogCard component**

```tsx
import Link from "next/link";
import type { BlogPost } from "./types";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block overflow-hidden rounded-[16px] border border-night/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-violet/30 hover:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.08)]"
    >
      {/* Image */}
      <div
        className={`aspect-[16/10] bg-gradient-to-br ${post.coverGradient} p-6 transition-transform duration-500 group-hover:scale-105`}
      >
        <div className="flex size-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9474ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <span className="mb-2 inline-block rounded-full bg-violet/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-violet">
          {post.category}
        </span>
        <h3 className="mt-2 text-[15px] font-black leading-snug text-night group-hover:text-violet transition-colors">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] font-bold leading-5 text-night/55">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-night/5 pt-3">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-violet/10 text-[9px] font-black text-violet">
              {post.author.initials}
            </span>
            <span className="text-[11px] font-bold text-night/50">
              {post.author.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-night/35">
            <span>{post.readingTime}</span>
            <span>·</span>
            <span>{post.publishedAt}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(marketing\)/blog/components/BlogCard.tsx
git commit -m "feat(blog): add BlogCard component"
```

---

## Task 6: BlogGrid Component

**Files:**
- Create: `app/(marketing)/blog/components/BlogGrid.tsx`

**Interfaces:**
- Consumes: `posts: BlogPost[]`
- Produces: `<BlogGrid posts={BlogPost[]} />` — 3-column responsive grid

- [ ] **Step 1: Create BlogGrid component**

```tsx
import type { BlogPost } from "./types";
import BlogCard from "./BlogCard";

export default function BlogGrid({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-night/10 bg-white p-12 text-center">
        <p className="text-sm font-bold text-night/40">
          No articles found in this category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(marketing\)/blog/components/BlogGrid.tsx
git commit -m "feat(blog): add BlogGrid responsive grid component"
```

---

## Task 7: NewsletterWidget + BlogSidebar

**Files:**
- Create: `app/(marketing)/blog/components/NewsletterWidget.tsx`
- Create: `app/(marketing)/blog/components/BlogSidebar.tsx`

**Interfaces:**
- Consumes: nothing (sidebar is self-contained)
- Produces: `<NewsletterWidget />` (client), `<BlogSidebar />` (server)

- [ ] **Step 1: Create NewsletterWidget**

```tsx
"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  }

  return (
    <div className="rounded-2xl border border-night/10 bg-white p-5">
      <h3 className="text-[15px] font-black text-night">
        Weekly Agency Growth Tips
      </h3>
      <p className="mt-1 text-[12px] font-bold leading-5 text-night/50">
        Join 2,000+ founders getting one actionable tip every week.
      </p>
      {submitted ? (
        <div className="mt-4 rounded-xl bg-teal/10 px-4 py-3 text-center text-[13px] font-bold text-teal">
          Thanks for subscribing!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <div className="relative">
            <Mail
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-night/30"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-night/10 bg-night/[0.02] py-2.5 pl-9 pr-3 text-[13px] font-bold text-night placeholder:text-night/30 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-violet py-2.5 text-[13px] font-black text-white transition-colors hover:bg-violet/90"
          >
            Subscribe
          </button>
        </form>
      )}
      <p className="mt-2 text-center text-[10px] font-bold text-night/30">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create BlogSidebar**

```tsx
import { FileText, ArrowRight } from "lucide-react";
import NewsletterWidget from "./NewsletterWidget";

const resources = [
  "Proposal Template",
  "Contract Template",
  "Invoice Template",
  "Agency Onboarding Checklist",
];

const recommended = [
  {
    title: "5 Pricing Strategies for Agencies That Actually Work",
    readingTime: "7 min read",
  },
  {
    title: "How Milestone Payments Improve Client Relationships",
    readingTime: "6 min read",
  },
  {
    title: "From Freelancer to Agency Owner: A Complete Guide",
    readingTime: "9 min read",
  },
];

export default function BlogSidebar() {
  return (
    <aside className="hidden w-full shrink-0 lg:block lg:w-[300px]">
      <div className="sticky top-24 space-y-5">
        <NewsletterWidget />

        <div className="rounded-2xl border border-night/10 bg-white p-5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-night/50">
            Free Resources
          </h3>
          <div className="mt-3 space-y-2.5">
            {resources.map((r) => (
              <div
                key={r}
                className="flex items-center justify-between text-[12px] font-bold text-night/70"
              >
                <span className="flex items-center gap-2">
                  <FileText size={13} className="text-violet" />
                  {r}
                </span>
                <span className="text-[10px] font-bold text-night/30">
                  Free
                </span>
              </div>
            ))}
          </div>
          <a
            href="#"
            className="mt-3 block text-center text-[11px] font-black text-violet hover:underline"
          >
            View all resources →
          </a>
        </div>

        <div className="rounded-2xl border border-violet/20 bg-violet/5 p-5">
          <h3 className="text-[15px] font-black text-night">
            See Orka in Action
          </h3>
          <p className="mt-1 text-[12px] font-bold leading-5 text-night/50">
            Book a 15-min demo and see how Orka can streamline your operations.
          </p>
          <a
            href="#"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-violet px-4 py-2 text-[12px] font-black text-white transition-colors hover:bg-violet/90"
          >
            Book a Demo <ArrowRight size={12} />
          </a>
        </div>

        <div className="rounded-2xl border border-night/10 bg-white p-5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-night/50">
            Recommended Reads
          </h3>
          <div className="mt-3 space-y-3">
            {recommended.map((r) => (
              <a
                key={r.title}
                href="#"
                className="group block text-[12px] font-bold text-night/70 transition-colors hover:text-violet"
              >
                {r.title}
                <span className="mt-0.5 block text-[10px] font-bold text-night/35">
                  {r.readingTime}
                </span>
              </a>
            ))}
          </div>
          <a
            href="#"
            className="mt-3 block text-center text-[11px] font-black text-violet hover:underline"
          >
            View all articles →
          </a>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/app/\(marketing\)/blog/components/NewsletterWidget.tsx frontend/app/\(marketing\)/blog/components/BlogSidebar.tsx
git commit -m "feat(blog): add NewsletterWidget and BlogSidebar"
```

---

## Task 8: Pagination Component

**Files:**
- Create: `app/(marketing)/blog/components/Pagination.tsx`

**Interfaces:**
- Consumes: `currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void`
- Produces: `<Pagination />` — page navigation

- [ ] **Step 1: Create Pagination component**

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function getPages(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="grid size-9 place-items-center rounded-xl border border-night/10 text-night/40 transition-colors hover:bg-night/5 hover:text-night disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((page, i) =>
        page === "..." ? (
          <span
            key={`dots-${i}`}
            className="grid size-9 place-items-center text-[13px] font-bold text-night/30"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`grid size-9 place-items-center rounded-xl text-[13px] font-bold transition-all duration-200 ${
              currentPage === page
                ? "bg-violet text-white shadow-[0_2px_8px_rgba(148,116,255,0.3)]"
                : "border border-night/10 text-night/50 hover:bg-night/5 hover:text-night"
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="grid size-9 place-items-center rounded-xl border border-night/10 text-night/40 transition-colors hover:bg-night/5 hover:text-night disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(marketing\)/blog/components/Pagination.tsx
git commit -m "feat(blog): add Pagination component"
```

---

## Task 9: BlogCta Component

**Files:**
- Create: `app/(marketing)/blog/components/BlogCta.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<BlogCta />` — bottom CTA section

- [ ] **Step 1: Create BlogCta component**

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BlogCta() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-[24px] bg-night p-8 text-white md:rounded-[36px] md:p-12">
        <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-[13px] font-bold text-white/50">
              Still managing clients manually?
            </p>
            <h2 className="display mt-2 text-3xl uppercase sm:text-4xl md:text-5xl">
              Run your service business on autopilot.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-violet px-6 py-3 text-sm font-black text-white transition-colors hover:bg-violet/90"
            >
              Join Waitlist <ArrowRight size={16} />
            </Link>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/70 transition-colors hover:text-white"
            >
              See how it works <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(marketing\)/blog/components/BlogCta.tsx
git commit -m "feat(blog): add BlogCta bottom CTA section"
```

---

## Task 10: Main Blog Page Assembly

**Files:**
- Modify: `app/(marketing)/blog/page.tsx`

**Interfaces:**
- Consumes: all components from Tasks 2-9, `blogPosts`/`getFeaturedPost`/`getPostsByCategory` from `lib/blog-data`
- Produces: Complete blog listing page

- [ ] **Step 1: Rewrite blog page**

Replace the entire contents of `app/(marketing)/blog/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { blogPosts, getFeaturedPost, getPostsByCategory } from "@/lib/blog-data";
import BlogHero from "./components/BlogHero";
import FeaturedCard from "./components/FeaturedCard";
import CategoryFilter from "./components/CategoryFilter";
import BlogGrid from "./components/BlogGrid";
import BlogSidebar from "./components/BlogSidebar";
import Pagination from "./components/Pagination";
import BlogCta from "./components/BlogCta";

const POSTS_PER_PAGE = 9;

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const featured = getFeaturedPost();
  const filtered = getPostsByCategory(activeCategory);
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  function handleCategoryChange(category: string) {
    setActiveCategory(category);
    setCurrentPage(1);
  }

  return (
    <div className="overflow-hidden">
      <BlogHero />

      <section className="px-4 py-12 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          {/* Featured */}
          <div className="mb-10">
            <p className="mb-4 text-[11px] font-black uppercase tracking-wider text-night/40">
              Featured Story
            </p>
            <FeaturedCard post={featured} />
          </div>

          {/* Filters */}
          <div className="mb-8">
            <CategoryFilter
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Grid + Sidebar */}
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div>
              <BlogGrid posts={paginated} />
              <div className="mt-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
            <BlogSidebar />
          </div>
        </div>
      </section>

      <BlogCta />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(marketing\)/blog/page.tsx
git commit -m "feat(blog): assemble full blog listing page"
```

---

## Task 11: Navbar CTA Update

**Files:**
- Modify: `components/Navbar.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: Updated "Get started" button text

- [ ] **Step 1: Update Navbar CTA**

In `components/Navbar.tsx`, find the "Get started" button text and replace with "Join Waitlist". There are two occurrences — the desktop button and the mobile button.

Search for `Get started` and replace with `Join Waitlist`.

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/components/Navbar.tsx
git commit -m "feat(blog): update Navbar CTA to Join Waitlist"
```

---

## Task 12: Final Build Verification

- [ ] **Step 1: Full lint**

Run: `pnpm lint` in `frontend/`
Expected: PASS (no new errors from blog changes)

- [ ] **Step 2: Full build**

Run: `pnpm build` in `frontend/`
Expected: PASS (no type errors, no build failures)

- [ ] **Step 3: Verify page renders**

Check that `/blog` loads without errors.

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix(blog): final build fixes for blog listing page"
```

---

## Summary

| Task | Component | Est. Time |
|------|-----------|-----------|
| 1 | Types + Mock Data | 10 min |
| 2 | BlogHero | 20 min |
| 3 | FeaturedCard | 10 min |
| 4 | CategoryFilter | 10 min |
| 5 | BlogCard | 10 min |
| 6 | BlogGrid | 5 min |
| 7 | NewsletterWidget + BlogSidebar | 20 min |
| 8 | Pagination | 10 min |
| 9 | BlogCta | 5 min |
| 10 | Main page assembly | 15 min |
| 11 | Navbar CTA update | 5 min |
| 12 | Final build verification | 10 min |
| **Total** | | **~2 hours** |
