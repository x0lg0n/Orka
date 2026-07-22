# ORKA Docs: Dedicated Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the left sidebar with a dedicated top navbar featuring mega menus, move docs to its own `(docs)` route group, and add breadcrumbs + a sticky right sidebar.

**Architecture:** Move `app/(marketing)/docs/` to `app/(docs)/docs/` with an independent layout. Create 7 new components (DocsNavbar, DocsMegaMenu, DocsNavItem, DocsSearchTrigger, DocsBreadcrumbs, DocsRightSidebar, mobile drawer). Delete 5 old sidebar components. URLs stay identical (`/docs/...`).

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, lucide-react icons, existing `SearchModal` (MiniSearch).

## Global Constraints

- Tailwind v4 (CSS-first, no `tailwind.config.ts`) — theme lives in CSS
- `strict: true` TypeScript, `moduleResolution: "bundler"`
- ORKA design tokens: `bg-night` (#082033), `text-violet` (#9474ff), `text-orange` (#ff8a22), `bg-lime` (#eaff35)
- Lint: `pnpm lint` in `frontend/` — 0 new errors allowed (46 pre-existing warnings OK)
- Build: `pnpm build` in `frontend/` — must pass clean
- No changes to MDX content files, search index, or `lib/docs/mdx.tsx`
- Co-located components use `components/` folder next to route, NOT `_components`

---

### Task 1: Update Config with Descriptions

**Files:**
- Modify: `frontend/lib/docs/config.ts`

**Interfaces:**
- Produces: `DocItem.description` field used by `DocsMegaMenu` in Task 3

- [ ] **Step 1: Add `description` to `DocItem` interface**

```typescript
// frontend/lib/docs/config.ts — line 6-11
export interface DocItem {
  title: string;
  slug: string;
  icon?: string;
  children?: DocItem[];
  description?: string;
}
```

- [ ] **Step 2: Add descriptions to all 14 top-level items**

Update each item in `docsNavigation` with a `description` field:

```typescript
{
  title: "Getting Started",
  slug: "getting-started",
  icon: "rocket",
  description: "Set up your account and learn the basics.",
  children: [ ... ]
},
{
  title: "Workspaces",
  slug: "workspaces",
  icon: "layout-grid",
  description: "Create and manage your team workspace.",
  children: [ ... ]
},
{
  title: "Projects",
  slug: "projects",
  icon: "folder",
  description: "Manage client work, milestones, files, and payments.",
  children: [ ... ]
},
{
  title: "Proposals",
  slug: "proposals",
  icon: "file-text",
  description: "Create, send, and track proposals with AI.",
  children: [ ... ]
},
{
  title: "Contracts",
  slug: "contracts",
  icon: "file-check",
  description: "Generate contracts and collect signatures.",
  children: [ ... ]
},
{
  title: "Milestones",
  slug: "milestones",
  icon: "milestone",
  description: "Break projects into trackable milestones.",
  children: [ ... ]
},
{
  title: "Escrow",
  slug: "escrow",
  icon: "shield",
  description: "Secure payments with automated releases.",
  children: [ ... ]
},
{
  title: "Payments",
  slug: "payments",
  icon: "wallet",
  description: "Track transactions and Stellar payments.",
  children: [ ... ]
},
{
  title: "Invoices",
  slug: "invoices",
  icon: "receipt",
  description: "Generate invoices and get paid faster.",
  children: [ ... ]
},
{
  title: "Clients",
  slug: "clients",
  icon: "users",
  description: "Manage clients and the client portal.",
  children: [ ... ]
},
{
  title: "Freighter",
  slug: "freighter",
  icon: "wallet",
  description: "Connect your Stellar wallet with Freighter.",
  children: [ ... ]
},
{
  title: "API",
  slug: "api",
  icon: "code",
  description: "Developer resources and API reference.",
  children: [ ... ]
},
{
  title: "Security",
  slug: "security",
  icon: "shield-check",
  description: "Encryption, permissions, and best practices.",
  children: [ ... ]
},
{
  title: "FAQ",
  slug: "faq",
  icon: "help-circle",
  description: "Frequently asked questions.",
  children: [ ... ]
},
```

- [ ] **Step 3: Verify build still passes**

Run: `cd frontend && pnpm build`
Expected: 107 pages generated, no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/lib/docs/config.ts
git commit -m "docs: add description field to DocItem for mega menu"
```

---

### Task 2: Create DocsNavItem and DocsMegaMenu

**Files:**
- Create: `frontend/components/docs/DocsNavItem.tsx`
- Create: `frontend/components/docs/DocsMegaMenu.tsx`

**Interfaces:**
- Consumes: `DocItem` from `lib/docs/config.ts` (with `description` field)
- Produces: Used by `DocsNavbar` in Task 4

- [ ] **Step 1: Create DocsNavItem component**

```tsx
// frontend/components/docs/DocsNavItem.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocItem } from "@/lib/docs/config";
import DocsMegaMenu from "./DocsMegaMenu";

interface DocsNavItemProps {
  item: DocItem;
}

export default function DocsNavItem({ item }: DocsNavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const isActive =
    pathname === `/docs/${item.slug}` ||
    pathname.startsWith(`/docs/${item.slug}/`);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/docs/${item.slug}`}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-violet/10 text-violet"
            : "text-white/80 hover:text-white"
        }`}
      >
        {item.title}
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Link>

      {isOpen && item.children && item.children.length > 0 && (
        <DocsMegaMenu
          item={item}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create DocsMegaMenu component**

```tsx
// frontend/components/docs/DocsMegaMenu.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocItem } from "@/lib/docs/config";

interface DocsMegaMenuProps {
  item: DocItem;
  onClose: () => void;
}

export default function DocsMegaMenu({ item, onClose }: DocsMegaMenuProps) {
  const pathname = usePathname();

  if (!item.children || item.children.length === 0) return null;

  // Calculate grid columns based on child count
  const cols =
    item.children.length <= 3
      ? "grid-cols-1"
      : item.children.length <= 6
        ? "grid-cols-2"
        : "grid-cols-3";

  return (
    <div className="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2">
      <div
        className="animate-in fade-in slide-in-from-top-1 w-[640px] rounded-2xl border border-night/10 bg-white p-6 shadow-xl backdrop-blur-xl"
        style={{ animationDuration: "150ms" }}
        onMouseEnter={() => {}}
        onMouseLeave={onClose}
      >
        {/* Category header */}
        <div className="mb-4">
          <p className="text-sm font-black text-night">{item.title}</p>
          {item.description && (
            <p className="mt-0.5 text-[13px] font-bold text-night/50">
              {item.description}
            </p>
          )}
        </div>

        {/* Grid of child items */}
        <div className={`grid ${cols} gap-1`}>
          {item.children.map((child) => {
            const href = `/docs/${item.slug}/${child.slug}`;
            const isChildActive = pathname === href;

            return (
              <Link
                key={child.slug}
                href={href}
                onClick={onClose}
                className={`rounded-xl px-3 py-2.5 transition-colors ${
                  isChildActive
                    ? "bg-violet/10 text-violet"
                    : "text-night hover:bg-night/5"
                }`}
              >
                <p className="text-[13px] font-bold">{child.title}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && pnpm build`
Expected: 107 pages generated, no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/components/docs/DocsNavItem.tsx frontend/components/docs/DocsMegaMenu.tsx
git commit -m "feat: add DocsNavItem and DocsMegaMenu components"
```

---

### Task 3: Create DocsSearchTrigger

**Files:**
- Create: `frontend/components/docs/DocsSearchTrigger.tsx`

**Interfaces:**
- Consumes: Opens existing `SearchModal` via `useCallback` pattern
- Produces: Used by `DocsNavbar` in Task 4

- [ ] **Step 1: Create DocsSearchTrigger component**

```tsx
// frontend/components/docs/DocsSearchTrigger.tsx
"use client";

import { Search } from "lucide-react";

interface DocsSearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export default function DocsSearchTrigger({ onClick, className = "" }: DocsSearchTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:bg-white/15 ${className}`}
    >
      <Search size={16} className="shrink-0" />
      <span className="hidden sm:inline">Search documentation…</span>
      <kbd className="ml-2 hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] font-bold text-white/40 sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && pnpm build`
Expected: 107 pages generated, no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/DocsSearchTrigger.tsx
git commit -m "feat: add DocsSearchTrigger component"
```

---

### Task 4: Create DocsNavbar

**Files:**
- Create: `frontend/components/docs/DocsNavbar.tsx`

**Interfaces:**
- Consumes: `DocsNavItem` (Task 2), `DocsSearchTrigger` (Task 3), `docsNavigation` from config
- Produces: Used by `(docs)/layout.tsx` in Task 6

- [ ] **Step 1: Create DocsNavbar component**

```tsx
// frontend/components/docs/DocsNavbar.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { docsNavigation, DocItem } from "@/lib/docs/config";
import DocsNavItem from "./DocsNavItem";
import DocsSearchTrigger from "./DocsSearchTrigger";
import SearchModal from "./SearchModal";

export default function DocsNavbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  // ⌘K keyboard shortcut
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

  // Get all top-level items across sections
  const allItems = docsNavigation.flatMap((section) => section.items);

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav className="sticky top-0 z-40 h-[72px] w-full border-b border-white/10 bg-[#071426]">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-8 lg:px-12">
          {/* Left: Logo + Hamburger */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-white/70 hover:text-white"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* ORKA logo */}
            <Link
              href="/docs"
              className="display text-xl uppercase text-white"
            >
              ORKA
            </Link>
          </div>

          {/* Center: Nav items (desktop) */}
          <div className="hidden items-center gap-1 lg:flex">
            {allItems.map((item) => (
              <DocsNavItem key={item.slug} item={item} />
            ))}
          </div>

          {/* Right: Search */}
          <div className="flex items-center gap-3">
            <DocsSearchTrigger onClick={handleOpenSearch} />
          </div>
        </div>

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

// Mobile drawer sub-component
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-night/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-[72px] h-[calc(100%-72px)] w-[300px] overflow-y-auto bg-white shadow-xl">
        <div className="p-4">
          {/* Search trigger */}
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-night/10 bg-night/5 px-4 py-3 text-sm text-night/50"
          >
            Search documentation…
          </button>

          {/* Accordion nav */}
          <div className="mt-4 space-y-1">
            {items.map((item) => {
              const isExpanded = expandedSlug === item.slug;
              return (
                <div key={item.slug}>
                  <button
                    onClick={() =>
                      setExpandedSlug(isExpanded ? null : item.slug)
                    }
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-night transition-colors hover:bg-night/5"
                  >
                    {item.title}
                    <span
                      className={`transition-transform duration-150 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
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

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && pnpm build`
Expected: 107 pages generated, no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/DocsNavbar.tsx
git commit -m "feat: add DocsNavbar with mega menus and mobile drawer"
```

---

### Task 5: Create DocsBreadcrumbs

**Files:**
- Create: `frontend/components/docs/DocsBreadcrumbs.tsx`
- Delete: `frontend/components/docs/Breadcrumbs.tsx` (after Task 7)

**Interfaces:**
- Consumes: `getSectionForDoc()`, `getDocBySlug()` from config
- Produces: Used by `[...slug]/page.tsx` in Task 8

- [ ] **Step 1: Create DocsBreadcrumbs component**

```tsx
// frontend/components/docs/DocsBreadcrumbs.tsx
import Link from "next/link";
import { getDocBySlug, getSectionForDoc } from "@/lib/docs/config";

interface DocsBreadcrumbsProps {
  slug: string;
}

export default function DocsBreadcrumbs({ slug }: DocsBreadcrumbsProps) {
  const doc = getDocBySlug(slug);
  const section = getSectionForDoc(slug);
  const parts = slug.split("/");

  // Build breadcrumb items
  const items: { label: string; href?: string }[] = [
    { label: "Home", href: "/docs" },
  ];

  if (section) {
    // Add parent category
    const parentItem = section.items.find(
      (item) => item.slug === parts[0]
    );
    if (parentItem) {
      items.push({
        label: parentItem.title,
        href: `/docs/${parentItem.slug}`,
      });
    }
  }

  // Add current page (last item, no link)
  if (doc) {
    items.push({ label: doc.title });
  }

  return (
    <nav className="mb-6 flex items-center text-sm text-night/50">
      {items.map((item, index) => (
        <span key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-night/80 hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-night/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd frontend && pnpm build`
Expected: 107 pages generated, no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/components/docs/DocsBreadcrumbs.tsx
git commit -m "feat: add DocsBreadcrumbs component"
```

---

### Task 6: Create DocsRightSidebar

**Files:**
- Create: `frontend/components/docs/DocsRightSidebar.tsx`

**Interfaces:**
- Consumes: `DocsToc` (existing, with `TocItem[]` headings prop)
- Produces: Used by `[...slug]/page.tsx` in Task 8

- [ ] **Step 1: Create DocsRightSidebar component**

```tsx
// frontend/components/docs/DocsRightSidebar.tsx
"use client";

import DocsToc, { TocItem } from "./DocsToc";

interface DocsRightSidebarProps {
  headings: TocItem[];
}

export default function DocsRightSidebar({ headings }: DocsRightSidebarProps) {
  return (
    <div className="hidden w-[320px] shrink-0 self-start lg:block">
      <div className="sticky top-[96px]">
        <DocsToc headings={headings} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update DocsToc styling**

The existing `DocsToc` has its own sticky and width styling. Update it to remove those since `DocsRightSidebar` now handles them:

```tsx
// frontend/components/docs/DocsToc.tsx — line 42
// Change from:
<aside className="sticky top-8 hidden w-[200px] shrink-0 self-start lg:block">
// To:
<aside className="w-full">
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && pnpm build`
Expected: 107 pages generated, no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/components/docs/DocsRightSidebar.tsx frontend/components/docs/DocsToc.tsx
git commit -m "feat: add DocsRightSidebar wrapper, update DocsToc styling"
```

---

### Task 7: Migrate Routes to `(docs)` Route Group

**Files:**
- Create: `frontend/app/(docs)/layout.tsx`
- Move: `frontend/app/(marketing)/docs/` → `frontend/app/(docs)/docs/`
- Delete: `frontend/app/(marketing)/docs/layout.tsx` (old sidebar layout)

**Interfaces:**
- Consumes: `DocsNavbar` (Task 4), `Footer` (existing)
- Produces: All docs routes now served from `(docs)` group

- [ ] **Step 1: Create `(docs)/layout.tsx`**

```tsx
// frontend/app/(docs)/layout.tsx
import DocsNavbar from "@/components/docs/DocsNavbar";
import Footer from "@/components/Footer";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <DocsNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Move docs folder**

```bash
# Create target directory
mkdir -p frontend/app/\(docs\)/docs

# Move docs pages
mv frontend/app/\(marketing\)/docs/page.tsx frontend/app/\(docs\)/docs/page.tsx
mv frontend/app/\(marketing\)/docs/\[...slug\] frontend/app/\(docs\)/docs/\[...slug\]

# Remove old layout (sidebar-based)
rm frontend/app/\(marketing\)/docs/layout.tsx

# Remove old empty docs directory
rmdir frontend/app/\(marketing\)/docs
```

- [ ] **Step 3: Update `[...slug]/page.tsx` imports**

The file moves but imports stay the same (all use `@/` path alias). Just verify it compiles.

- [ ] **Step 4: Verify build passes**

Run: `cd frontend && pnpm build`
Expected: 107 pages generated, all `/docs/*` routes present, no errors

- [ ] **Step 5: Commit**

```bash
git add frontend/app/\(docs\)/
git add frontend/app/\(marketing\)/docs/
git commit -m "feat: migrate docs to (docs) route group with dedicated layout"
```

---

### Task 8: Update Doc Pages for New Layout

**Files:**
- Modify: `frontend/app/(docs)/docs/[...slug]/page.tsx`
- Modify: `frontend/app/(docs)/docs/page.tsx`

**Interfaces:**
- Consumes: `DocsBreadcrumbs` (Task 5), `DocsRightSidebar` (Task 6)
- Produces: Final page layout with 2-column grid

- [ ] **Step 1: Update `[...slug]/page.tsx`**

Replace the current layout with 2-column grid, breadcrumbs, and new right sidebar:

```tsx
// frontend/app/(docs)/docs/[...slug]/page.tsx
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllDocSlugs, getDocBySlug, getParentSlug } from "@/lib/docs/config";
import { renderMDX } from "@/lib/docs/mdx";
import DocsBreadcrumbs from "@/components/docs/DocsBreadcrumbs";
import DocsRightSidebar from "@/components/docs/DocsRightSidebar";
import PrevNextNav from "@/components/docs/PrevNextNav";
import Feedback from "@/components/docs/Feedback";
import RelatedArticles from "@/components/docs/RelatedArticles";

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

  if (!doc) {
    notFound();
  }

  const docsDir = path.join(process.cwd(), "content/docs");
  
  let filePath = path.join(docsDir, `${slugPath}.mdx`);
  
  const parentSlug = getParentSlug(slugPath);
  if (!fs.existsSync(filePath) && parentSlug) {
    filePath = path.join(docsDir, `${slugPath}/overview.mdx`);
  }
  
  if (!fs.existsSync(filePath)) {
    filePath = path.join(docsDir, `${parentSlug || slugPath}.mdx`);
  }

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);
  const headings = extractHeadings(content);
  const mdxContent = await renderMDX(content);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-12">
      <div className="grid gap-12" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
        {/* Main content */}
        <article className="min-w-0 max-w-[920px]">
          <DocsBreadcrumbs slug={slugPath} />

          <h1 className="display text-4xl uppercase sm:text-5xl text-night">
            {data.title || doc.title}
          </h1>

          {data.description && (
            <p className="mt-3 text-base font-normal leading-7 text-night/60 sm:text-[18px]">
              {data.description}
            </p>
          )}

          <div className="mt-8">{mdxContent}</div>

          <PrevNextNav slug={slugPath} />
          <Feedback slug={slugPath} />
          <RelatedArticles slug={slugPath} />
        </article>

        {/* Right sidebar */}
        <DocsRightSidebar headings={headings} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update landing page `page.tsx`**

Remove the `DocsLandingRightSidebar` import and the sidebar from the layout. The landing page now uses full width:

```tsx
// frontend/app/(docs)/docs/page.tsx
// Remove this import:
// import DocsLandingRightSidebar from "@/components/docs/DocsLandingRightSidebar";

// In the JSX, remove the flex container and right sidebar.
// Change from:
//   <div className="flex gap-8">
//     ... content ...
//     <DocsLandingRightSidebar />
//   </div>
// To:
//   <div>
//     ... content (same, just remove the flex gap wrapper) ...
//   </div>

// Also remove the SearchModal and useEffect from this page since
// DocsNavbar now handles search. Keep only the page content.
```

Specifically, the landing page should become:

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
  Headphones,
  BookOpen,
} from "lucide-react";
import { docsNavigation } from "@/lib/docs/config";

// ... keep popularGuides, features, categoryIcons, categoryDescriptions arrays ...

export default function DocsPage() {
  const allItems = docsNavigation.flatMap((s) => s.items);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
        <div className="relative z-10 mx-auto max-w-5xl pt-16 pb-4 text-center">
          <span className="text-[15px] font-medium text-white sm:text-[18px]">
            Documentation
          </span>
          <h1 className="display mx-auto mt-6 max-w-4xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4.4rem] md:text-[6rem]">
            Documentation
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-normal leading-7 text-white/78 sm:text-lg sm:leading-8">
            Everything you need to run your service business with ORKA.
          </p>
        </div>
      </section>

      {/* ... rest of sections unchanged ... */}
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && pnpm build`
Expected: 107 pages generated, no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/app/\(docs\)/docs/\[...slug\]/page.tsx frontend/app/\(docs\)/docs/page.tsx
git commit -m "feat: update doc pages with 2-column grid, breadcrumbs, and right sidebar"
```

---

### Task 9: Delete Old Sidebar Components

**Files:**
- Delete: `frontend/components/docs/DocsSidebar.tsx`
- Delete: `frontend/components/docs/DocsSidebarAccordion.tsx`
- Delete: `frontend/components/docs/DocsSidebarSearch.tsx`
- Delete: `frontend/components/docs/DocsMobileDrawer.tsx`
- Delete: `frontend/components/docs/Breadcrumbs.tsx`

**Interfaces:**
- These are no longer imported anywhere after Tasks 7-8

- [ ] **Step 1: Verify no remaining imports**

```bash
cd frontend && grep -r "DocsSidebar\|DocsSidebarAccordion\|DocsSidebarSearch\|DocsMobileDrawer\|components/docs/Breadcrumbs" --include="*.tsx" --include="*.ts" app/ components/
```

Expected: No results (all old imports removed in Tasks 7-8)

- [ ] **Step 2: Delete old files**

```bash
rm frontend/components/docs/DocsSidebar.tsx
rm frontend/components/docs/DocsSidebarAccordion.tsx
rm frontend/components/docs/DocsSidebarSearch.tsx
rm frontend/components/docs/DocsMobileDrawer.tsx
rm frontend/components/docs/Breadcrumbs.tsx
```

- [ ] **Step 3: Verify build passes**

Run: `cd frontend && pnpm build`
Expected: 107 pages generated, no errors

- [ ] **Step 4: Run lint**

Run: `cd frontend && pnpm lint`
Expected: 0 new errors (46 pre-existing warnings OK)

- [ ] **Step 5: Commit**

```bash
git add -A frontend/components/docs/
git commit -m "feat: remove old sidebar components (DocsSidebar, Accordion, Search, MobileDrawer, Breadcrumbs)"
```

---

### Task 10: Final Build and Verification

**Files:** None (verification only)

- [ ] **Step 1: Full build**

Run: `cd frontend && pnpm build`
Expected: 107 pages, all routes generated, no errors

- [ ] **Step 2: Full lint**

Run: `cd frontend && pnpm lint`
Expected: 0 new errors

- [ ] **Step 3: Verify route structure**

Check that these routes are all generated:
- `/docs` (landing page)
- `/docs/getting-started`
- `/docs/getting-started/overview`
- `/docs/projects`
- `/docs/projects/timeline`
- All 87+ doc routes

- [ ] **Step 4: Write final report**

```bash
cat > .superpowers/sdd/task-10-report.md << 'EOF'
# Task 10: Final Verification

## Status: DONE

## Build Results
- Lint: [paste result]
- Build: [paste result]
- Routes: [count]

## Summary
All 10 tasks complete. Left sidebar removed, dedicated navbar with mega menus live.
EOF
```

- [ ] **Step 5: Commit report**

```bash
git add .superpowers/sdd/task-10-report.md
git commit -m "docs: final verification report for navbar migration"
```
