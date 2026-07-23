# ORKA Documentation Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign ORKA's documentation into a premium, world-class platform with full-width mega menu navbar, docs-focused landing page, and three-column individual doc pages.

**Architecture:** Refactor in-place — keep `(docs)` route group, `lib/docs/config.ts`, all 82 MDX content files, and MDX rendering. Replace UI shell: navbar → full-width mega menu, landing page → docs-focused, individual pages → three-column layout with left sidebar TOC.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 (CSS-first), Lucide icons, MiniSearch, next-mdx-remote/rsc, gray-matter, rehype-highlight, rehype-slug.

## Global Constraints

- **Framework:** Next.js 16 App Router, React 19, TypeScript strict mode
- **Styling:** Tailwind v4 via `@tailwindcss/postcss` — NO `tailwind.config.ts`, theme in `globals.css` `@theme inline {}`
- **Fonts:** Anton (display), DM Sans (body), JetBrains Mono (code) — all loaded as CSS variables in root layout
- **Colors:** night (#082033), paper (#fffaf2), violet (#9474ff), teal (#22bd93), orange (#ff8a22), info (#3b82f6), danger (#ff4f42)
- **Package manager:** pnpm (repo ships `pnpm-lock.yaml`)
- **No comments** in code unless asked
- **Co-located components:** use `components/` folder next to route `page.tsx` with relative `./components/...` import, OR shared in `components/docs/`
- **Lint:** Run `pnpm lint` in `frontend/` after each task
- **Content:** 82 MDX files in `content/docs/` — do NOT modify content
- **Config:** `lib/docs/config.ts` — additive changes only, no breaking changes to `docsNavigation` structure

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `components/docs/DocsTopNav.tsx` | Full-width sticky navbar with mega menu (client) |
| `components/docs/MegaPanel.tsx` | Full-width dropdown panel for nav categories (client) |
| `components/docs/LeftSidebar.tsx` | Left sidebar: TOC + reading progress + share + author (client) |
| `components/docs/ReadingProgress.tsx` | Horizontal scroll progress bar (client) |
| `components/docs/ShareButtons.tsx` | LinkedIn / X / Copy Link buttons (client) |
| `components/docs/ArticleCard.tsx` | Card for landing page category grid (server) |
| `components/docs/PopularGuideCard.tsx` | Larger card for popular guides section (server) |
| `components/docs/CopyButton.tsx` | Copy-to-clipboard for code blocks (client) |
| `components/docs/Step.tsx` | Numbered step component (server) |
| `components/docs/DocsTabs.tsx` | Client-side tab switcher (client) |
| `components/docs/Accordion.tsx` | Expandable/collapsible section (client) |
| `components/docs/ImageCaption.tsx` | Image with caption text (server) |

### Modified Files
| File | Change |
|------|--------|
| `app/(docs)/layout.tsx` | Import `DocsTopNav` instead of `DocsNavbar` |
| `app/(docs)/docs/page.tsx` | Full rewrite — docs-focused landing |
| `app/(docs)/docs/[...slug]/page.tsx` | Full rewrite — three-column layout |
| `lib/docs/mdx.tsx` | Add new MDX components, update styling |

### Deprecated Files (remove in final task)
| File | Replaced By |
|------|-------------|
| `components/docs/DocsNavbar.tsx` | `DocsTopNav.tsx` |
| `components/docs/DocsNavItem.tsx` | `MegaPanel.tsx` |
| `components/docs/DocsMegaMenu.tsx` | `MegaPanel.tsx` |
| `components/docs/DocsRightSidebar.tsx` | `LeftSidebar.tsx` |
| `components/docs/DocsLandingRightSidebar.tsx` | Removed (landing has no sidebar) |
| `components/docs/DocsSearchTrigger.tsx` | Inlined in `DocsTopNav` |

---

## Task 1: CopyButton Component

**Files:**
- Create: `components/docs/CopyButton.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<CopyButton text={string} />` — renders a copy button for code blocks

- [ ] **Step 1: Create CopyButton component**

```tsx
"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-bold text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 ${className}`}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/CopyButton.tsx
git commit -m "feat(docs): add CopyButton component for code blocks"
```

---

## Task 2: ReadingProgress Component

**Files:**
- Create: `components/docs/ReadingProgress.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<ReadingProgress />` — renders a horizontal progress bar tracking scroll position

- [ ] **Step 1: Create ReadingProgress component**

```tsx
"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    }

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="w-full">
      <div className="h-1 w-full overflow-hidden rounded-full bg-night/10">
        <div
          className="h-full rounded-full bg-violet transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1.5 text-[11px] font-bold text-night/40">
        {Math.round(progress)}% read
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/ReadingProgress.tsx
git commit -m "feat(docs): add ReadingProgress scroll tracking component"
```

---

## Task 3: ShareButtons Component

**Files:**
- Create: `components/docs/ShareButtons.tsx`

**Interfaces:**
- Consumes: `slug: string` (doc slug for URL), `title: string` (doc title for share text)
- Produces: `<ShareButtons slug={string} title={string} />` — LinkedIn, X, Copy Link buttons

- [ ] **Step 1: Create ShareButtons component**

```tsx
"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";

interface ShareButtonsProps {
  slug: string;
  title: string;
}

export default function ShareButtons({ slug, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/docs/${slug}` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  }

  return (
    <div className="space-y-2">
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        LinkedIn
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        X (Twitter)
      </a>
      <button
        onClick={copyLink}
        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night"
      >
        <Link2 size={14} />
        {copied ? "Copied!" : "Copy Link"}
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
git add frontend/components/docs/ShareButtons.tsx
git commit -m "feat(docs): add ShareButtons component (LinkedIn, X, Copy Link)"
```

---

## Task 4: LeftSidebar Component

**Files:**
- Create: `components/docs/LeftSidebar.tsx`

**Interfaces:**
- Consumes: `headings: { id: string; text: string; level: number }[]`, `slug: string`, `title: string`
- Produces: `<LeftSidebar headings={...} slug={string} title={string} />` — sticky left sidebar

- [ ] **Step 1: Create LeftSidebar component**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import ReadingProgress from "./ReadingProgress";
import ShareButtons from "./ShareButtons";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface LeftSidebarProps {
  headings: TocItem[];
  slug: string;
  title: string;
}

export default function LeftSidebar({ headings, slug, title }: LeftSidebarProps) {
  const [activeId, setActiveId] = useState("");
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const article = document.querySelector("article");
    if (article) {
      setWordCount(article.textContent?.split(/\s+/).length || 0);
    }
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0.1 }
    );

    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean);

    headingElements.forEach((el) => observer.observe(el!));
    return () => observer.disconnect();
  }, [headings]);

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  if (headings.length === 0) return null;

  return (
    <aside className="hidden w-[240px] shrink-0 self-start lg:block">
      <div className="sticky top-[80px] max-h-[calc(100vh-100px)] overflow-y-auto">
        {/* On This Page */}
        <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-night/50">
          On this page
        </p>
        <nav className="space-y-0.5">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className={`block border-l-[3px] py-1 text-[13px] font-bold transition-colors ${
                heading.level === 3 ? "pl-6" : "pl-3"
              } ${
                activeId === heading.id
                  ? "border-violet text-violet"
                  : "border-transparent text-night/50 hover:text-night/80"
              }`}
            >
              {heading.text}
            </a>
          ))}
        </nav>

        {/* Reading Progress */}
        <div className="mt-6 border-t border-night/10 pt-4">
          <ReadingProgress />
        </div>

        {/* Estimated Read Time */}
        <div className="mt-4 flex items-center gap-2 text-[12px] font-bold text-night/40">
          <Clock size={13} />
          <span>{readTime} min read</span>
        </div>

        {/* Share */}
        <div className="mt-6 border-t border-night/10 pt-4">
          <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-night/50">
            Share this article
          </p>
          <ShareButtons slug={slug} title={title} />
        </div>

        {/* Written By (placeholder) */}
        <div className="mt-6 border-t border-night/10 pt-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-night/50">
            Written by
          </p>
          <p className="mt-1 text-[13px] font-bold text-night">ORKA Team</p>
          <p className="text-[11px] font-bold text-night/40">Contributors, ORKA</p>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/LeftSidebar.tsx
git commit -m "feat(docs): add LeftSidebar with TOC, progress, share, author"
```

---

## Task 5: ArticleCard & PopularGuideCard Components

**Files:**
- Create: `components/docs/ArticleCard.tsx`
- Create: `components/docs/PopularGuideCard.tsx`

**Interfaces:**
- Consumes: `title: string`, `description: string`, `href: string`, `icon: LucideIcon`, `color: string`
- Produces: `<ArticleCard />` and `<PopularGuideCard />` — server components for landing page

- [ ] **Step 1: Create ArticleCard component**

```tsx
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface ArticleCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color?: string;
}

export default function ArticleCard({ title, description, href, icon: Icon, color = "text-violet" }: ArticleCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-night/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-violet hover:shadow-[0_0_20px_rgba(148,116,255,0.08)]"
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl bg-violet/10 ${color}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-night">{title}</p>
        <p className="mt-0.5 text-[12px] font-bold text-night/50">{description}</p>
      </div>
      <ArrowRight size={14} className="shrink-0 text-night/20 transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
```

- [ ] **Step 2: Create PopularGuideCard component**

```tsx
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface PopularGuideCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

export default function PopularGuideCard({ title, description, href, icon: Icon, color }: PopularGuideCardProps) {
  return (
    <Link
      href={href}
      className="group cut-corner rounded-[14px] border-2 border-night bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet hover:shadow-[0_0_30px_rgba(148,116,255,0.12)]"
    >
      <span className={`grid size-10 place-items-center rounded-xl ${color} bg-current/10`}>
        <Icon size={20} />
      </span>
      <h3 className="mt-3 display text-lg uppercase text-night">{title}</h3>
      <p className="mt-1 text-[13px] font-bold leading-5 text-night/60">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-black text-violet">
        Read Guide <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/components/docs/ArticleCard.tsx frontend/components/docs/PopularGuideCard.tsx
git commit -m "feat(docs): add ArticleCard and PopularGuideCard components"
```

---

## Task 6: MegaPanel Component

**Files:**
- Create: `components/docs/MegaPanel.tsx`

**Interfaces:**
- Consumes: `item: DocItem` (from `lib/docs/config.ts`), `onClose: () => void`
- Produces: `<MegaPanel item={...} onClose={...} />` — full-width dropdown panel

- [ ] **Step 1: Create MegaPanel component**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocItem } from "@/lib/docs/config";

interface MegaPanelProps {
  item: DocItem;
  onClose: () => void;
}

export default function MegaPanel({ item, onClose }: MegaPanelProps) {
  const pathname = usePathname();

  if (!item.children || item.children.length === 0) return null;

  const columns = item.children.length <= 4
    ? 2
    : item.children.length <= 8
      ? 3
      : 3;

  const itemsPerColumn = Math.ceil(item.children.length / columns);
  const columnArrays = Array.from({ length: columns }, (_, i) =>
    item.children!.slice(i * itemsPerColumn, (i + 1) * itemsPerColumn)
  );

  return (
    <div className="absolute left-0 top-full z-50 w-full">
      <div
        className="mx-auto max-w-7xl border-b border-night/10 bg-white px-8 py-6 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)]"
        onMouseLeave={onClose}
      >
        <div className="mb-4">
          <p className="text-sm font-black text-night">{item.title}</p>
          {item.description && (
            <p className="mt-0.5 text-[13px] font-bold text-night/50">{item.description}</p>
          )}
        </div>

        <div className={`grid grid-cols-${columns} gap-8`}>
          {columnArrays.map((col, colIdx) => (
            <div key={colIdx} className="space-y-0.5">
              {col.map((child) => {
                const href = `/docs/${item.slug}/${child.slug}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={child.slug}
                    href={href}
                    onClick={onClose}
                    className={`block rounded-lg px-3 py-2 text-[13px] font-bold transition-colors ${
                      isActive
                        ? "bg-violet/10 text-violet"
                        : "text-night/70 hover:bg-night/[0.04] hover:text-night"
                    }`}
                  >
                    {child.title}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/MegaPanel.tsx
git commit -m "feat(docs): add MegaPanel full-width dropdown component"
```

---

## Task 7: DocsTopNav Component

**Files:**
- Create: `components/docs/DocsTopNav.tsx`

**Interfaces:**
- Consumes: `docsNavigation` from `lib/docs/config.ts`, `SearchModal`, `ThemeToggle`
- Produces: `<DocsTopNav />` — full-width sticky navbar with mega menu

- [ ] **Step 1: Create DocsTopNav component**

```tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, Github } from "lucide-react";
import { docsNavigation, DocItem } from "@/lib/docs/config";
import MegaPanel from "./MegaPanel";
import SearchModal from "./SearchModal";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DocsTopNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const allItems = docsNavigation.flatMap((section) => section.items);

  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleItemEnter(slug: string) {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(slug);
  }

  function handleItemLeave() {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  }

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav
        ref={navRef}
        className="sticky top-0 z-40 h-16 w-full border-b border-white/10 bg-[#082033]"
        aria-label="Documentation navigation"
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          {/* Left: Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white/70 hover:text-white lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link href="/docs" className="flex items-center gap-2 text-white" aria-label="ORKA Docs home">
              <Image src="/Logo/LOGO.svg" alt="" width={24} height={24} className="size-6" priority />
              <span className="display text-lg uppercase">ORKA</span>
            </Link>
          </div>

          {/* Center: Nav items */}
          <div className="scrollbar-hide hidden items-center gap-0.5 lg:flex">
            {allItems.map((item) => {
              const isActive = activeDropdown === item.slug;
              const hasChildren = item.children && item.children.length > 0;
              return (
                <div
                  key={item.slug}
                  onMouseEnter={() => hasChildren && handleItemEnter(item.slug)}
                  onMouseLeave={() => hasChildren && handleItemLeave()}
                >
                  <Link
                    href={`/docs/${item.slug}`}
                    className={`flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium transition-colors ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:text-white"
                    }`}
                    onClick={() => setActiveDropdown(null)}
                  >
                    {item.title}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right: Search, GitHub, Theme */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenSearch}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/50 transition-colors hover:bg-white/15"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search…</span>
              <kbd className="ml-1 hidden rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] font-bold text-white/40 sm:inline">
                ⌘K
              </kbd>
            </button>

            <a
              href="https://github.com/x0lg0n/Orka"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[12px] font-medium text-white/60 transition-colors hover:text-white hover:bg-white/8 lg:inline-flex"
              aria-label="GitHub"
            >
              <Github size={15} />
            </a>

            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Mega Panels */}
        {allItems.map((item) => {
          if (activeDropdown !== item.slug) return null;
          if (!item.children || item.children.length === 0) return null;
          return (
            <MegaPanel
              key={item.slug}
              item={item}
              onClose={() => setActiveDropdown(null)}
            />
          );
        })}

        {/* Mobile drawer */}
        {mobileOpen && (
          <MobileNavDrawer
            items={allItems}
            onClose={() => setMobileOpen(false)}
            onOpenSearch={handleOpenSearch}
          />
        )}
      </nav>
    </>
  );
}

function MobileNavDrawer({
  items,
  onClose,
  onOpenSearch,
}: {
  items: DocItem[];
  onClose: () => void;
  onOpenSearch: () => void;
}) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-night/40" onClick={onClose} />
      <div className="absolute left-0 top-16 h-[calc(100%-64px)] w-[300px] overflow-y-auto bg-white shadow-xl">
        <div className="p-4">
          <button
            onClick={() => { onClose(); onOpenSearch(); }}
            className="flex w-full items-center gap-3 rounded-xl border border-night/10 bg-night/5 px-4 py-3 text-sm text-night/50"
          >
            Search documentation…
          </button>

          <div className="mt-4 space-y-1">
            {items.map((item) => {
              const isExpanded = expandedSlug === item.slug;
              return (
                <div key={item.slug}>
                  <button
                    onClick={() => setExpandedSlug(isExpanded ? null : item.slug)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-night transition-colors hover:bg-night/5"
                  >
                    {item.title}
                    <span className={`transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>
                  {isExpanded && item.children && (
                    <div className="ml-3 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.slug}
                          href={`/docs/${item.slug}/${child.slug}`}
                          onClick={onClose}
                          className="block rounded-lg px-3 py-2 text-[13px] font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update docs layout to use DocsTopNav**

Read `app/(docs)/layout.tsx` and replace `DocsNavbar` import with `DocsTopNav`:

```tsx
import DocsTopNav from "@/components/docs/DocsTopNav";
import Footer from "@/components/Footer";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-paper">
      <DocsTopNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/components/docs/DocsTopNav.tsx frontend/app/\(docs\)/layout.tsx
git commit -m "feat(docs): add DocsTopNav with full-width mega menu, update layout"
```

---

## Task 8: Docs Landing Page

**Files:**
- Modify: `app/(docs)/docs/page.tsx`

**Interfaces:**
- Consumes: `docsNavigation` from `lib/docs/config.ts`, `ArticleCard`, `PopularGuideCard`
- Produces: Rewritten landing page with hero, popular guides, category grid, features, CTA

- [ ] **Step 1: Rewrite landing page**

Replace the entire contents of `app/(docs)/docs/page.tsx` with:

```tsx
"use client";

import Link from "next/link";
import {
  Rocket,
  Folder,
  Receipt,
  Shield,
  Wallet,
  FileText,
  Code,
  Users,
  HelpCircle,
  Milestone,
  FileCheck,
  ArrowRight,
  MessageSquare,
  BarChart3,
  Activity,
  LayoutGrid,
} from "lucide-react";
import { docsNavigation } from "@/lib/docs/config";

const popularGuides = [
  {
    title: "Generate Your First Proposal",
    description: "Create and send a professional proposal in minutes using AI.",
    icon: FileText,
    href: "/docs/proposals",
    color: "text-[#9474ff]",
  },
  {
    title: "Create Your First Contract",
    description: "Generate contracts with AI and get them signed.",
    icon: FileCheck,
    href: "/docs/contracts",
    color: "text-[#22bd93]",
  },
  {
    title: "Fund Escrow & Get Paid",
    description: "Secure payments with escrow and release on milestones.",
    icon: Shield,
    href: "/docs/escrow",
    color: "text-[#ff8a22]",
  },
  {
    title: "Connect Freighter Wallet",
    description: "Connect your Stellar wallet to send and receive payments.",
    icon: Wallet,
    href: "/docs/freighter",
    color: "text-[#3b82f6]",
  },
];

const features = [
  { title: "AI Proposal Generator", description: "Create proposals in seconds with AI.", icon: FileText, color: "bg-[#9474ff]/10 text-[#9474ff]" },
  { title: "Escrow Payments", description: "Secure milestone-based escrow on Stellar.", icon: Shield, color: "bg-[#ff8a22]/10 text-[#ff8a22]" },
  { title: "Milestone Tracking", description: "Track progress and approve deliverables.", icon: Milestone, color: "bg-[#22bd93]/10 text-[#22bd93]" },
  { title: "Client Portal", description: "Shared view for clients to track projects.", icon: Users, color: "bg-[#3b82f6]/10 text-[#3b82f6]" },
  { title: "Invoices", description: "Auto-generated invoices on milestone release.", icon: Receipt, color: "bg-[#ff4f42]/10 text-[#ff4f42]" },
  { title: "Payments", description: "Track releases and client payments.", icon: Wallet, color: "bg-[#ff8a22]/10 text-[#ff8a22]" },
  { title: "Analytics", description: "Real-time dashboards for project health.", icon: BarChart3, color: "bg-[#9474ff]/10 text-[#9474ff]" },
  { title: "Activity Feed", description: "Complete audit trail of all project activity.", icon: Activity, color: "bg-[#22bd93]/10 text-[#22bd93]" },
];

const categoryIcons: Record<string, typeof Folder> = {
  projects: Folder, clients: Users, proposals: FileText, contracts: FileCheck,
  milestones: Milestone, escrow: Shield, invoices: Receipt, payments: Wallet,
  freighter: Wallet, api: Code, security: Shield, faq: HelpCircle,
  "getting-started": Rocket, workspaces: LayoutGrid,
};

const categoryDescriptions: Record<string, string> = {
  projects: "Manage projects, timeline, files and activity.",
  clients: "Manage clients and client portal access.",
  proposals: "Create, send and track proposals.",
  contracts: "AI contracts, signatures and versions.",
  milestones: "Create milestones and track progress.",
  escrow: "Secure payments with automated releases.",
  invoices: "Generate invoices and get paid faster.",
  payments: "Track payments and transaction history.",
  freighter: "Connect wallets and manage transactions.",
  api: "Developer resources and API reference.",
  security: "Encryption, permissions and best practices.",
  faq: "Frequently asked questions.",
  "getting-started": "Learn ORKA from scratch.",
  workspaces: "Set up and manage your workspace.",
};

export default function DocsPage() {
  const allItems = docsNavigation.flatMap((s) => s.items);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
        <div className="relative z-10 mx-auto max-w-5xl pt-16 pb-4 text-center">
          <span className="inline-block rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[13px] font-bold text-white/80">
            ORKA DOCUMENTATION
          </span>
          <h1 className="display mx-auto mt-6 max-w-4xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4.4rem] md:text-[6rem]">
            Everything you need to run your service business with ORKA
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-normal leading-7 text-white/78 sm:text-lg sm:leading-8">
            Projects, payments, escrow, contracts, AI, workspaces — find it all here.
          </p>
          <div className="mx-auto mt-8 max-w-xl">
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-left text-sm text-white/50 transition-colors hover:bg-white/15"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              Search documentation…
              <kbd className="ml-auto rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-bold text-white/40">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">Popular Guides</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <Link
                  key={guide.title}
                  href={guide.href}
                  className="group cut-corner rounded-[14px] border-2 border-night bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet hover:shadow-[0_0_30px_rgba(148,116,255,0.12)]"
                >
                  <span className={`grid size-10 place-items-center rounded-xl ${guide.color} bg-current/10`}>
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-3 display text-lg uppercase text-night">{guide.title}</h3>
                  <p className="mt-1 text-[13px] font-bold leading-5 text-night/60">{guide.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-black text-violet">
                    Read Guide <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Browse Documentation */}
      <section className="px-4 py-12 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">Browse Documentation</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {allItems.map((item) => {
              const Icon = categoryIcons[item.slug] || Folder;
              const desc = categoryDescriptions[item.slug] || "Documentation for this topic.";
              return (
                <Link
                  key={item.slug}
                  href={`/docs/${item.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-night/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-violet hover:shadow-[0_0_20px_rgba(148,116,255,0.08)]"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-violet/10 text-violet">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-night">{item.title}</p>
                    <p className="text-[12px] font-bold text-night/50">{desc}</p>
                  </div>
                  <ArrowRight size={14} className="shrink-0 text-night/20 transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">Platform Features</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-xl border border-night/10 bg-white p-5">
                  <span className={`grid size-10 place-items-center rounded-xl ${feature.color}`}>
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-3 text-sm font-black text-night">{feature.title}</h3>
                  <p className="mt-1 text-[12px] font-bold text-night/50">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[24px] bg-night p-8 text-white md:p-12">
          <div className="text-center">
            <h2 className="display text-4xl uppercase sm:text-5xl">Still need help?</h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-normal text-white/70">
              Our support team is here to help you succeed with ORKA.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="#" className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/20">
                <MessageSquare size={16} /> Join Discord
              </a>
              <Link href="/contact" className="flex items-center gap-2 rounded-full bg-violet px-6 py-3 text-sm font-black text-white transition hover:bg-violet/90">
                Contact Sales <ArrowRight size={16} />
              </Link>
              <a href="mailto:support@orka.app" className="flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-black text-white transition hover:bg-white/10">
                Email Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(docs\)/docs/page.tsx
git commit -m "feat(docs): rewrite landing page with hero, guides, categories, features"
```

---

## Task 9: Individual Doc Pages — Three-Column Layout

**Files:**
- Modify: `app/(docs)/docs/[...slug]/page.tsx`

**Interfaces:**
- Consumes: `LeftSidebar`, `renderMDX`, `docsNavigation` config, `gray-matter`
- Produces: Three-column layout with left TOC, main content, right sidebar

- [ ] **Step 1: Rewrite individual doc page**

Replace the entire contents of `app/(docs)/docs/[...slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllDocSlugs, getDocBySlug, getParentSlug, getAdjacentDocs } from "@/lib/docs/config";
import { renderMDX } from "@/lib/docs/mdx";
import LeftSidebar from "@/components/docs/LeftSidebar";
import DocsBreadcrumbs from "@/components/docs/DocsBreadcrumbs";
import PrevNextNav from "@/components/docs/PrevNextNav";
import Feedback from "@/components/docs/Feedback";
import RelatedArticles from "@/components/docs/RelatedArticles";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug: slug.split("/") }));
}

function extractHeadings(source: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = [];
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(source)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    headings.push({ id, text, level });
  }
  return headings;
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const slugPath = Array.isArray(slug) ? slug.join("/") : slug;
  const doc = getDocBySlug(slugPath);

  if (!doc) notFound();

  const docsDir = path.join(process.cwd(), "content/docs");
  let filePath = path.join(docsDir, `${slugPath}.mdx`);
  const parentSlug = getParentSlug(slugPath);

  if (!fs.existsSync(filePath) && parentSlug) {
    filePath = path.join(docsDir, `${slugPath}/overview.mdx`);
  }
  if (!fs.existsSync(filePath)) {
    filePath = path.join(docsDir, `${parentSlug || slugPath}.mdx`);
  }
  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);
  const headings = extractHeadings(content);
  const mdxContent = await renderMDX(content);

  const allItems = docsNavigation.flatMap((s) => s.items);
  const relatedItems = allItems
    .filter((i) => i.slug !== slugPath.split("/")[0])
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 lg:px-12">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr_280px]">
        {/* Left Sidebar */}
        <LeftSidebar headings={headings} slug={slugPath} title={data.title || doc.title} />

        {/* Main Content */}
        <article className="min-w-0 max-w-3xl">
          <DocsBreadcrumbs slug={slugPath} />

          <h1 className="display text-4xl uppercase sm:text-5xl text-night">
            {data.title || doc.title}
          </h1>

          {data.description && (
            <p className="mt-3 text-base font-normal leading-7 text-night/60 sm:text-[18px]">
              {data.description}
            </p>
          )}

          <div className="mt-2 text-[12px] font-bold text-night/40">
            Last updated: Jul 2026
          </div>

          <div className="mt-8">{mdxContent}</div>

          <PrevNextNav slug={slugPath} />
          <Feedback slug={slugPath} />
          <RelatedArticles slug={slugPath} />
        </article>

        {/* Right Sidebar */}
        <aside className="hidden w-[280px] shrink-0 self-start lg:block">
          <div className="sticky top-[80px] space-y-6">
            {/* Promo Card */}
            <div className="rounded-xl border border-night/10 bg-white p-5">
              <h3 className="text-sm font-black text-night">Run your agency smarter with ORKA</h3>
              <p className="mt-1 text-[12px] font-bold text-night/50">
                Proposals, contracts, milestones, escrow and payments — all in one place.
              </p>
              <Link
                href="/signup"
                className="mt-3 flex items-center justify-center gap-1 rounded-lg bg-violet px-4 py-2.5 text-[12px] font-black text-white transition hover:bg-violet/90"
              >
                Join Waitlist <ArrowRight size={12} />
              </Link>
              <p className="mt-2 text-center text-[10px] font-bold text-night/30">No spam. Unsubscribe anytime.</p>
            </div>

            {/* Free Resources */}
            <div className="rounded-xl border border-night/10 bg-white p-5">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-night/50">Free Resources</h3>
              <div className="mt-3 space-y-2">
                {["Proposal Template", "Contract Template", "Invoice Template", "Agency Onboarding Checklist"].map((r) => (
                  <div key={r} className="flex items-center justify-between text-[12px] font-bold text-night/70">
                    <span className="flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9474ff" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      {r}
                    </span>
                    <span className="text-[10px] font-bold text-night/30">Free</span>
                  </div>
                ))}
              </div>
              <a href="#" className="mt-3 block text-center text-[11px] font-black text-violet hover:underline">
                View all resources →
              </a>
            </div>

            {/* You Might Also Like */}
            <div className="rounded-xl border border-night/10 bg-white p-5">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-night/50">You might also like</h3>
              <div className="mt-3 space-y-3">
                {relatedItems.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/docs/${item.slug}`}
                    className="group block text-[12px] font-bold text-night/70 transition-colors hover:text-violet"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(docs\)/docs/\[...slug\]/page.tsx
git commit -m "feat(docs): rewrite individual pages with three-column layout"
```

---

## Task 10: Enhanced MDX Components

**Files:**
- Modify: `lib/docs/mdx.tsx`

**Interfaces:**
- Consumes: existing `renderMDX`, new `CopyButton`
- Produces: Updated MDX component overrides with copy buttons on code blocks

- [ ] **Step 1: Update MDX components**

Replace the contents of `lib/docs/mdx.tsx`:

```tsx
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { Callout } from "@/components/docs/Callout";
import CopyButton from "@/components/docs/CopyButton";

function extractText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as { props: { children: React.ReactNode } }).props.children);
  }
  return "";
}

const mdxComponents = {
  Callout,
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => {
    const text = extractText(children);
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return (
      <h2 className="display mt-10 mb-4 text-3xl uppercase sm:text-4xl" id={id} {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => {
    const text = extractText(children);
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return (
      <h3 className="display mt-8 mb-3 text-2xl uppercase" id={id} {...props}>
        {children}
      </h3>
    );
  },
  p: ({ children, ...props }: React.ComponentProps<"p">) => (
    <p className="mb-4 text-[16px] leading-8 text-night/80" {...props}>{children}</p>
  ),
  ul: ({ children, ...props }: React.ComponentProps<"ul">) => (
    <ul className="mb-4 list-disc pl-6 space-y-2 text-[16px] leading-7 text-night/80" {...props}>{children}</ul>
  ),
  ol: ({ children, ...props }: React.ComponentProps<"ol">) => (
    <ol className="mb-4 list-decimal pl-6 space-y-2 text-[16px] leading-7 text-night/80" {...props}>{children}</ol>
  ),
  li: ({ children, ...props }: React.ComponentProps<"li">) => (
    <li className="font-bold" {...props}>{children}</li>
  ),
  table: ({ children, ...props }: React.ComponentProps<"table">) => (
    <div className="mb-6 overflow-x-auto rounded-xl border border-night/10">
      <table className="w-full border-collapse text-left text-sm" {...props}>{children}</table>
    </div>
  ),
  th: ({ children, ...props }: React.ComponentProps<"th">) => (
    <th className="border-b-2 border-night/10 px-4 py-3 text-xs font-black uppercase text-night/60" {...props}>{children}</th>
  ),
  td: ({ children, ...props }: React.ComponentProps<"td">) => (
    <td className="border-b border-night/5 px-4 py-3 font-bold text-night/80" {...props}>{children}</td>
  ),
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => {
    const codeText = extractText(children);
    return (
      <div className="relative mb-6">
        <pre
          className="overflow-x-auto rounded-xl bg-night p-5 text-sm text-white/90 [&_code]:bg-transparent [&_code]:p-0"
          {...props}
        >
          {children}
        </pre>
        <div className="absolute right-3 top-3">
          <CopyButton text={codeText} />
        </div>
      </div>
    );
  },
  code: ({ children, className, ...props }: React.ComponentProps<"code">) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded-md bg-night/8 px-1.5 py-0.5 text-sm font-bold text-violet" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>{children}</code>
    );
  },
  blockquote: ({ children, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote className="mb-6 border-l-4 border-violet pl-4 text-night/70 italic" {...props}>{children}</blockquote>
  ),
};

export async function renderMDX(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        rehypePlugins: [rehypeHighlight, rehypeSlug],
      },
    },
  });
  return content;
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/docs/mdx.tsx
git commit -m "feat(docs): enhance MDX components with copy buttons, improved typography"
```

---

## Task 11: Responsive Mobile Navigation

**Files:**
- Modify: `components/docs/DocsTopNav.tsx` (mobile drawer already included in Task 7)
- Modify: `app/(docs)/docs/[...slug]/page.tsx` (responsive grid already included in Task 9)

**Note:** Mobile navigation and responsive layout were already implemented in Tasks 7 and 9. This task verifies and polishes the responsive behavior.

- [ ] **Step 1: Add mobile TOC toggle for individual pages**

Add a sticky "On This Page" button that appears on tablet/mobile when the left sidebar is hidden. Update `app/(docs)/docs/[...slug]/page.tsx` to include a client-side mobile TOC component:

Create `components/docs/MobileTocToggle.tsx`:

```tsx
"use client";

import { useState } from "react";
import { List, X } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface MobileTocToggleProps {
  headings: TocItem[];
}

export default function MobileTocToggle({ headings }: MobileTocToggleProps) {
  const [open, setOpen] = useState(false);

  if (headings.length === 0) return null;

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-violet px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-violet/90"
      >
        {open ? <X size={16} /> : <List size={16} />}
        {open ? "Close" : "On this page"}
      </button>

      {open && (
        <div className="fixed inset-0 z-20 bg-night/40" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-20 right-6 w-72 rounded-xl border border-night/10 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-night/50">On this page</p>
            <nav className="space-y-0.5">
              {headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-1.5 text-[13px] font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night ${h.level === 3 ? "pl-6" : ""}`}
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
```

Then add it to the doc page after the `<article>` closing tag:

```tsx
import MobileTocToggle from "@/components/docs/MobileTocToggle";

// Inside the component, after the article:
<MobileTocToggle headings={headings} />
```

- [ ] **Step 2: Verify responsive behavior**

Manually verify:
- Desktop: three-column layout visible
- Tablet (768-1023px): left sidebar hidden, "On this page" floating button visible
- Mobile (< 768px): single column, hamburger nav, floating TOC button

- [ ] **Step 3: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/components/docs/MobileTocToggle.tsx frontend/app/\(docs\)/docs/\[...slug\]/page.tsx
git commit -m "feat(docs): add mobile TOC toggle for responsive navigation"
```

---

## Task 12: Cleanup Deprecated Components

**Files:**
- Delete: `components/docs/DocsNavbar.tsx`
- Delete: `components/docs/DocsNavItem.tsx`
- Delete: `components/docs/DocsMegaMenu.tsx`
- Delete: `components/docs/DocsRightSidebar.tsx`
- Delete: `components/docs/DocsLandingRightSidebar.tsx`
- Delete: `components/docs/DocsSearchTrigger.tsx`

- [ ] **Step 1: Remove deprecated components**

```bash
rm frontend/components/docs/DocsNavbar.tsx
rm frontend/components/docs/DocsNavItem.tsx
rm frontend/components/docs/DocsMegaMenu.tsx
rm frontend/components/docs/DocsRightSidebar.tsx
rm frontend/components/docs/DocsLandingRightSidebar.tsx
rm frontend/components/docs/DocsSearchTrigger.tsx
```

- [ ] **Step 2: Verify no remaining imports**

Search for any remaining imports of the deleted components:

```bash
grep -r "DocsNavbar\|DocsNavItem\|DocsMegaMenu\|DocsRightSidebar\|DocsLandingRightSidebar\|DocsSearchTrigger" frontend/ --include="*.tsx" --include="*.ts"
```

Expected: No results (all imports should reference new components)

- [ ] **Step 3: Verify build**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A frontend/components/docs/
git commit -m "feat(docs): remove deprecated doc components replaced by new design"
```

---

## Task 13: Final Build Verification

- [ ] **Step 1: Full lint**

Run: `pnpm lint` in `frontend/`
Expected: PASS

- [ ] **Step 2: Full build**

Run: `pnpm build` in `frontend/`
Expected: PASS (no type errors, no build failures)

- [ ] **Step 3: Verify all docs pages render**

Check that these pages load without errors:
- `/docs` (landing page)
- `/docs/getting-started` (parent page)
- `/docs/projects/overview` (child page)
- `/docs/escrow/fund` (nested page)

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix(docs): final build fixes for documentation redesign"
```

---

## Summary

| Task | Component | Est. Time |
|------|-----------|-----------|
| 1 | CopyButton | 5 min |
| 2 | ReadingProgress | 5 min |
| 3 | ShareButtons | 10 min |
| 4 | LeftSidebar | 15 min |
| 5 | ArticleCard + PopularGuideCard | 10 min |
| 6 | MegaPanel | 15 min |
| 7 | DocsTopNav + Layout update | 25 min |
| 8 | Landing page rewrite | 20 min |
| 9 | Individual doc pages rewrite | 25 min |
| 10 | Enhanced MDX components | 15 min |
| 11 | Responsive mobile TOC | 15 min |
| 12 | Cleanup deprecated components | 5 min |
| 13 | Final build verification | 10 min |
| **Total** | | **~3 hours** |
