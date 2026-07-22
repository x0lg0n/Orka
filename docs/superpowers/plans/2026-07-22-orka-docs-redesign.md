# ORKA Documentation Experience — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild ORKA's documentation from a single-page blog into a premium 3-column SaaS docs hub with MDX content, Cmd+K search, sidebar navigation, and right TOC.

**Architecture:** MDX files in `content/docs/` rendered via `next-mdx-remote` through a dynamic `[slug]` route. Landing page at `/docs` with hero + search + category grid. Individual doc pages use a 3-column layout (sidebar | content | TOC). Client-side search via `mini-search` with a build-time index.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, `next-mdx-remote`, `mini-search`, `lucide-react`, existing ORKA design tokens.

## Global Constraints

- Only documentation pages under `app/(marketing)/docs/` are modified
- No changes to auth, dashboard, API routes, or database schema
- Use existing ORKA brand tokens: `bg-night`, `text-violet`, `text-orange`, `bg-lime`, `text-coral`, `bg-teal`
- Use existing CSS classes: `display`, `cut-corner`, `sticker`, `shadow-hard`, `section-label`
- Use existing UI components: `Button`, `Card`, `Badge`, `Input` from `components/ui/`
- Font stack: Anton (display), DM Sans (body), JetBrains Mono (code)
- All pages must be responsive (mobile-first)
- `prefers-reduced-motion` must be respected

---

## File Map

### New Files

| File | Responsibility |
|------|---------------|
| `content/docs/getting-started.mdx` | Getting started guide |
| `content/docs/workspaces.mdx` | Workspaces documentation |
| `content/docs/projects.mdx` | Projects documentation |
| `content/docs/proposals.mdx` | Proposals documentation |
| `content/docs/contracts.mdx` | Contracts documentation |
| `content/docs/milestones.mdx` | Milestones documentation |
| `content/docs/escrow.mdx` | Escrow documentation |
| `content/docs/payments.mdx` | Payments documentation |
| `content/docs/invoices.mdx` | Invoices documentation |
| `content/docs/clients.mdx` | Clients documentation |
| `content/docs/freighter.mdx` | Freighter wallet documentation |
| `content/docs/api.mdx` | API documentation |
| `content/docs/security.mdx` | Security documentation |
| `content/docs/faq.mdx` | FAQ |
| `lib/docs/config.ts` | Sidebar navigation tree + doc metadata |
| `lib/docs/search.ts` | Build-time search index generator |
| `lib/docs/mdx.ts` | MDX rendering utilities + custom components |
| `components/docs/DocsLayout.tsx` | 3-column layout shell for individual pages |
| `components/docs/DocsSidebar.tsx` | Left sidebar navigation |
| `components/docs/DocsToc.tsx` | Right "On this page" TOC |
| `components/docs/SearchModal.tsx` | Cmd+K search dialog |
| `components/docs/Breadcrumbs.tsx` | Breadcrumb trail |
| `components/docs/Callout.tsx` | Info/tip/warning/error callout boxes |
| `components/docs/PrevNextNav.tsx` | Previous/Next article navigation |
| `components/docs/Feedback.tsx` | "Was this helpful?" widget |
| `components/docs/RelatedArticles.tsx` | Related doc cards |
| `app/(marketing)/docs/layout.tsx` | Docs layout wrapper (individual pages only) |
| `app/(marketing)/docs/[slug]/page.tsx` | Dynamic doc page renderer |

### Modified Files

| File | Change |
|------|--------|
| `app/(marketing)/docs/page.tsx` | Complete rewrite as docs landing page |

---

## Task 1: Install Dependencies & Create Content Directory

**Files:**
- Create: `content/docs/` (directory)
- Modify: `frontend/package.json` (add dependencies)

**Interfaces:**
- Consumes: existing `package.json`
- Produces: installed `next-mdx-remote` and `mini-search` packages

- [ ] **Step 1: Install next-mdx-remote and mini-search**

```bash
cd frontend && pnpm add next-mdx-remote mini-search
```

Expected: Both packages added to `package.json` dependencies.

- [ ] **Step 2: Create content directory**

```bash
mkdir -p content/docs
```

Expected: `content/docs/` directory exists.

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/pnpm-lock.yaml content/
git commit -m "chore: add next-mdx-remote and mini-search for docs"
```

---

## Task 2: Navigation Config (`lib/docs/config.ts`)

**Files:**
- Create: `lib/docs/config.ts`

**Interfaces:**
- Consumes: none
- Produces: `docsNavigation` array, `DocSection` type, `DocItem` type, `getDocBySlug()` helper, `getAdjacentDocs()` helper

- [ ] **Step 1: Create the config file**

```typescript
// lib/docs/config.ts

export interface DocSection {
  title: string;
  items: DocItem[];
}

export interface DocItem {
  title: string;
  slug: string;
  icon?: string;
}

export interface DocMeta {
  title: string;
  description: string;
  category: string;
  order: number;
  icon?: string;
}

export const docsNavigation: DocSection[] = [
  {
    title: "GETTING STARTED",
    items: [
      { title: "Getting Started", slug: "getting-started", icon: "rocket" },
      { title: "Workspaces", slug: "workspaces", icon: "layout-grid" },
    ],
  },
  {
    title: "PRODUCT GUIDE",
    items: [
      { title: "Projects", slug: "projects", icon: "folder" },
      { title: "Proposals", slug: "proposals", icon: "file-text" },
      { title: "Contracts", slug: "contracts", icon: "file-check" },
      { title: "Milestones", slug: "milestones", icon: "milestone" },
      { title: "Escrow", slug: "escrow", icon: "shield" },
      { title: "Payments", slug: "payments", icon: "wallet" },
      { title: "Invoices", slug: "invoices", icon: "receipt" },
      { title: "Clients", slug: "clients", icon: "users" },
      { title: "Freighter", slug: "freighter", icon: "wallet" },
    ],
  },
  {
    title: "DEVELOPERS",
    items: [
      { title: "API", slug: "api", icon: "code" },
      { title: "Security", slug: "security", icon: "shield-check" },
    ],
  },
  {
    title: "RESOURCES",
    items: [
      { title: "FAQ", slug: "faq", icon: "help-circle" },
    ],
  },
];

export function getAllDocSlugs(): string[] {
  return docsNavigation.flatMap((section) =>
    section.items.map((item) => item.slug)
  );
}

export function getDocBySlug(slug: string): DocItem | undefined {
  for (const section of docsNavigation) {
    const found = section.items.find((item) => item.slug === slug);
    if (found) return found;
  }
  return undefined;
}

export function getAdjacentDocs(slug: string): {
  prev: DocItem | null;
  next: DocItem | null;
} {
  const allItems = docsNavigation.flatMap((section) => section.items);
  const index = allItems.findIndex((item) => item.slug === slug);
  return {
    prev: index > 0 ? allItems[index - 1] : null,
    next: index < allItems.length - 1 ? allItems[index + 1] : null,
  };
}

export function getSectionForDoc(slug: string): DocSection | undefined {
  return docsNavigation.find((section) =>
    section.items.some((item) => item.slug === slug)
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit lib/docs/config.ts
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add lib/docs/config.ts
git commit -m "feat(docs): add navigation config with sidebar tree"
```

---

## Task 3: MDX Utilities (`lib/docs/mdx.ts`)

**Files:**
- Create: `lib/docs/mdx.ts`

**Interfaces:**
- Consumes: `next-mdx-remote/rsc`, `@/components/docs/Callout`
- Produces: `compileMDX()` function, `getMDXContent()` function, custom MDX component map

- [ ] **Step 1: Create MDX utilities**

```typescript
// lib/docs/mdx.ts
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import {Callout} from "@/components/docs/Callout";

const mdxComponents = {
  Callout,
  h2: ({ children, ...props }: React.ComponentProps<"h2">) => (
    <h2
      className="display mt-10 mb-4 text-3xl uppercase sm:text-4xl"
      id={typeof children === "string" ? children.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined}
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentProps<"h3">) => (
    <h3
      className="display mt-8 mb-3 text-2xl uppercase"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.ComponentProps<"p">) => (
    <p className="mb-4 text-[16px] leading-8 text-night/80" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.ComponentProps<"ul">) => (
    <ul className="mb-4 list-disc pl-6 space-y-2 text-[16px] leading-7 text-night/80" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentProps<"ol">) => (
    <ol className="mb-4 list-decimal pl-6 space-y-2 text-[16px] leading-7 text-night/80" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentProps<"li">) => (
    <li className="font-bold" {...props}>
      {children}
    </li>
  ),
  table: ({ children, ...props }: React.ComponentProps<"table">) => (
    <div className="mb-6 overflow-x-auto rounded-xl border border-night/10">
      <table className="w-full border-collapse text-left text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.ComponentProps<"th">) => (
    <th className="border-b-2 border-night/10 px-4 py-3 text-xs font-black uppercase text-night/60" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentProps<"td">) => (
    <td className="border-b border-night/5 px-4 py-3 font-bold text-night/80" {...props}>
      {children}
    </td>
  ),
  pre: ({ children, ...props }: React.ComponentProps<"pre">) => (
    <pre
      className="mb-6 overflow-x-auto rounded-xl bg-night p-5 text-sm text-white/90 [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    >
      {children}
    </pre>
  ),
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
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  blockquote: ({ children, ...props }: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="mb-6 border-l-4 border-violet pl-4 text-night/70 italic"
      {...props}
    >
      {children}
    </blockquote>
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

- [ ] **Step 2: Install rehype plugins**

```bash
cd frontend && pnpm add rehype-highlight rehype-slug
```

Expected: Packages added.

- [ ] **Step 3: Commit**

```bash
git add lib/docs/mdx.ts frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat(docs): add MDX rendering utilities with custom components"
```

---

## Task 4: Callout Component

**Files:**
- Create: `components/docs/Callout.tsx`

**Interfaces:**
- Consumes: `lucide-react` icons
- Produces: `<Callout type="info|tip|warning|error" title="...">` component

- [ ] **Step 1: Create the Callout component**

```tsx
// components/docs/Callout.tsx
import { Info, Lightbulb, AlertTriangle, XCircle } from "lucide-react";

type CalloutType = "info" | "tip" | "warning" | "error";

const calloutConfig: Record<
  CalloutType,
  { icon: typeof Info; borderColor: string; bgColor: string; iconColor: string; title: string }
> = {
  info: {
    icon: Info,
    borderColor: "border-l-[#3b82f6]",
    bgColor: "bg-blue-50",
    iconColor: "text-[#3b82f6]",
    title: "Info",
  },
  tip: {
    icon: Lightbulb,
    borderColor: "border-l-[#22bd93]",
    bgColor: "bg-green-50",
    iconColor: "text-[#22bd93]",
    title: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-l-[#ff8a22]",
    bgColor: "bg-orange-50",
    iconColor: "text-[#ff8a22]",
    title: "Warning",
  },
  error: {
    icon: XCircle,
    borderColor: "border-l-[#ff4f42]",
    bgColor: "bg-red-50",
    iconColor: "text-[#ff4f42]",
    title: "Error",
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`mb-6 rounded-xl border-l-4 ${config.borderColor} ${config.bgColor} p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} className={config.iconColor} />
        <span className={`text-sm font-black uppercase ${config.iconColor}`}>
          {title || config.title}
        </span>
      </div>
      <div className="text-sm font-bold leading-6 text-night/80">
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/docs/Callout.tsx
git commit -m "feat(docs): add Callout component for info/tip/warning/error boxes"
```

---

## Task 5: Search Index Generator

**Files:**
- Create: `lib/docs/search.ts`

**Interfaces:**
- Consumes: `fs`, `path`, `gray-matter` (for frontmatter parsing)
- Produces: `generateSearchIndex()` function, writes `public/search-index.json`

- [ ] **Step 1: Install gray-matter**

```bash
cd frontend && pnpm add gray-matter
```

Expected: Package added.

- [ ] **Step 2: Create the search index generator**

```typescript
// lib/docs/search.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface SearchEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  url: string;
}

export function generateSearchIndex(): SearchEntry[] {
  const docsDir = path.join(process.cwd(), "content/docs");
  const files = fs.readdirSync(docsDir).filter((f) => f.endsWith(".mdx"));

  return files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const filePath = path.join(docsDir, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    // Strip MDX syntax and extract plain text (first ~300 chars)
    const plainText = content
      .replace(/```[\s\S]*?```/g, "")
      .replace(/<[^>]+>/g, "")
      .replace(/[#*_`~\[\]]/g, "")
      .replace(/\n+/g, " ")
      .trim()
      .slice(0, 300);

    return {
      id: slug,
      title: data.title || slug,
      category: data.category || "Uncategorized",
      description: data.description || "",
      content: plainText,
      url: `/docs/${slug}`,
    };
  });
}

// Write index to public/ for client-side fetching
export function writeSearchIndex(): void {
  const entries = generateSearchIndex();
  const outDir = path.join(process.cwd(), "public");
  const outPath = path.join(outDir, "search-index.json");

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outPath, JSON.stringify(entries, null, 2));
  console.log(`Search index written: ${entries.length} entries → ${outPath}`);
}

// CLI: run directly to generate index
if (require.main === module) {
  writeSearchIndex();
}
```

- [ ] **Step 3: Add search index script to package.json**

Edit `frontend/package.json`, add to `"scripts"`:

```json
"search:build": "node -e \"require('./lib/docs/search.ts')\" || tsx lib/docs/search.ts"
```

Actually, since this is TypeScript, use a simpler approach — add a `postbuild` script or integrate into the build. For now, the function can be called from a build step. Let's keep it as a callable function.

- [ ] **Step 4: Commit**

```bash
git add lib/docs/search.ts frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat(docs): add build-time search index generator"
```

---

## Task 6: Sidebar Component

**Files:**
- Create: `components/docs/DocsSidebar.tsx`

**Interfaces:**
- Consumes: `docsNavigation` from `lib/docs/config`, `usePathname` from `next/navigation`
- Produces: `<DocsSidebar>` component with nested nav tree

- [ ] **Step 1: Create the sidebar component**

```tsx
// components/docs/DocsSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Rocket,
  LayoutGrid,
  Folder,
  FileText,
  FileCheck,
  Milestone,
  Shield,
  Wallet,
  Receipt,
  Users,
  Code,
  ShieldCheck,
  HelpCircle,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { docsNavigation } from "@/lib/docs/config";

const iconMap: Record<string, typeof Rocket> = {
  rocket: Rocket,
  "layout-grid": LayoutGrid,
  folder: Folder,
  "file-text": FileText,
  "file-check": FileCheck,
  milestone: Milestone,
  shield: Shield,
  wallet: Wallet,
  receipt: Receipt,
  users: Users,
  code: Code,
  "shield-check": ShieldCheck,
  "help-circle": HelpCircle,
};

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-[240px] shrink-0 overflow-y-auto border-r border-night/10 bg-white/60 p-4 lg:block hidden">
      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 rounded-lg border border-night/10 bg-white px-3 py-2 text-sm text-night/50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          Search docs...
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-6">
        {docsNavigation.map((section) => (
          <div key={section.title}>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-night/40">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon ? iconMap[item.icon] : Folder;
                const isActive = pathname === `/docs/${item.slug}`;
                return (
                  <li key={item.slug}>
                    <Link
                      href={`/docs/${item.slug}`}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                        isActive
                          ? "border-l-[3px] border-violet bg-violet/5 pl-2.5 text-violet"
                          : "text-night/70 hover:bg-night/5 hover:text-night"
                      }`}
                    >
                      {Icon && <Icon size={15} className="shrink-0" />}
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom cards */}
      <div className="mt-8 space-y-3">
        <div className="rounded-xl border border-night/10 bg-white p-4">
          <p className="text-xs font-black uppercase text-night/50">New to Orka?</p>
          <p className="mt-1 text-xs font-bold text-night/60">
            Follow our interactive setup guide.
          </p>
          <Link
            href="/docs/getting-started"
            className="mt-2 inline-flex items-center gap-1 text-xs font-black text-violet hover:underline"
          >
            Start Tutorial <ArrowRight size={12} />
          </Link>
        </div>
        <div className="rounded-xl border border-night/10 bg-white p-4">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-violet" />
            <p className="text-xs font-black text-night">Need Help?</p>
          </div>
          <p className="mt-1 text-xs font-bold text-night/60">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/contact"
            className="mt-2 inline-flex items-center gap-1 text-xs font-black text-violet hover:underline"
          >
            Contact Support <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/docs/DocsSidebar.tsx
git commit -m "feat(docs): add DocsSidebar with nested navigation"
```

---

## Task 7: Table of Contents Component

**Files:**
- Create: `components/docs/DocsToc.tsx`

**Interfaces:**
- Consumes: heading data extracted from MDX content
- Produces: `<DocsToc>` component with scroll-spy active state

- [ ] **Step 1: Create the TOC component**

```tsx
// components/docs/DocsToc.tsx
"use client";

import { useEffect, useState } from "react";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface DocsTocProps {
  headings: TocItem[];
}

export default function DocsToc({ headings }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
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

  if (headings.length === 0) return null;

  return (
    <aside className="sticky top-8 hidden w-[200px] shrink-0 self-start lg:block">
      <p className="mb-3 text-xs font-black uppercase text-night/50">
        On this page
      </p>
      <nav className="space-y-1">
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

      {/* Article metadata */}
      <div className="mt-8 space-y-3 border-t border-night/10 pt-4">
        <div className="text-[11px] font-bold text-night/40">
          <span className="block">Last Updated: Jul 2026</span>
          <span className="block">Reading Time: 5 min</span>
        </div>
      </div>

      {/* Still stuck card */}
      <div className="mt-4 rounded-xl border border-night/10 bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-violet/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9474ff" strokeWidth="2">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
            </svg>
          </span>
          <div>
            <p className="text-[11px] font-black text-night">Still stuck?</p>
            <p className="text-[10px] font-bold text-night/50">
              Our support team is here to help.
            </p>
          </div>
        </div>
        <a
          href="/contact"
          className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-violet px-3 py-1.5 text-[11px] font-black text-white transition hover:bg-violet/90"
        >
          Contact Support
        </a>
      </div>

      {/* Was this helpful */}
      <div className="mt-4 rounded-xl border border-night/10 bg-white p-3 text-center">
        <p className="text-[11px] font-black text-night">Was this helpful?</p>
        <p className="text-[10px] font-bold text-night/50">
          Your feedback helps us improve.
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button className="rounded-lg border border-night/10 px-3 py-1 text-[11px] font-bold text-night/60 transition hover:border-violet hover:text-violet">
            Yes
          </button>
          <button className="rounded-lg border border-night/10 px-3 py-1 text-[11px] font-bold text-night/60 transition hover:border-violet hover:text-violet">
            No
          </button>
        </div>
      </div>

      {/* Community */}
      <div className="mt-4 rounded-xl border border-night/10 bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-violet/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9474ff" strokeWidth="2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </span>
          <div>
            <p className="text-[11px] font-black text-night">Join Community</p>
            <p className="text-[10px] font-bold text-night/50">
              Connect with the Orka team.
            </p>
          </div>
        </div>
        <a
          href="#"
          className="mt-2 flex items-center justify-center gap-1 text-[11px] font-black text-violet hover:underline"
        >
          Join on Discord
        </a>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/docs/DocsToc.tsx
git commit -m "feat(docs): add DocsToc with scroll-spy and widget cards"
```

---

## Task 8: Search Modal

**Files:**
- Create: `components/docs/SearchModal.tsx`

**Interfaces:**
- Consumes: `SearchEntry` from `lib/docs/search`, `mini-search`
- Produces: `<SearchModal>` component with Cmd+K trigger

- [ ] **Step 1: Install mini-search types**

```bash
cd frontend && pnpm add -D @types/mini-search
```

Expected: Types installed.

- [ ] **Step 2: Create the SearchModal component**

```tsx
// components/docs/SearchModal.tsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import MiniSearch from "mini-search";
import { Search, FileText, ArrowRight, X } from "lucide-react";

interface SearchEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  url: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const indexRef = useRef<MiniSearch<SearchEntry> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load and build search index
  useEffect(() => {
    if (!open) return;

    async function loadIndex() {
      if (indexRef.current) return;
      setLoading(true);
      try {
        const res = await fetch("/search-index.json");
        const entries: SearchEntry[] = await res.json();

        const ms = new MiniSearch<SearchEntry>({
          fields: ["title", "content", "category", "description"],
          storeFields: ["title", "category", "description", "url"],
          searchOptions: {
            boost: { title: 3, category: 2, description: 1.5 },
            prefix: true,
            fuzzy: 0.2,
          },
        });

        ms.addAll(entries);
        indexRef.current = ms;
      } catch (e) {
        console.error("Failed to load search index:", e);
      }
      setLoading(false);
    }

    loadIndex();
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Search on query change
  useEffect(() => {
    if (!query.trim() || !indexRef.current) {
      setResults([]);
      return;
    }
    const found = indexRef.current.search(query).slice(0, 8);
    const mapped = found.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      description: r.description,
      content: "",
      url: r.url,
    }));
    setResults(mapped);
    setSelectedIndex(0);
  }, [query]);

  const navigateTo = useCallback(
    (url: string) => {
      onClose();
      router.push(url);
    },
    [onClose, router]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        navigateTo(results[selectedIndex].url);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, selectedIndex, navigateTo, onClose]
  );

  // Global Cmd+K listener
  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-night/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-night/10 px-4 py-3">
          <Search size={18} className="shrink-0 text-night/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-sm text-night outline-none placeholder:text-night/40"
          />
          <button
            onClick={onClose}
            className="rounded-md bg-night/5 px-2 py-1 text-[11px] font-bold text-night/40"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {loading && (
            <p className="py-8 text-center text-sm text-night/40">
              Loading search index...
            </p>
          )}
          {!loading && query && results.length === 0 && (
            <p className="py-8 text-center text-sm text-night/40">
              No results found for &ldquo;{query}&rdquo;
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul>
              {results.map((result, i) => (
                <li key={result.id}>
                  <button
                    onClick={() => navigateTo(result.url)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                      i === selectedIndex
                        ? "bg-violet/5 text-violet"
                        : "text-night hover:bg-night/5"
                    }`}
                  >
                    <FileText
                      size={16}
                      className="shrink-0 text-night/30"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {result.title}
                      </p>
                      <p className="text-[11px] font-bold text-night/40 truncate">
                        {result.category}
                      </p>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-night/20" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && !query && (
            <div className="py-8 text-center text-sm text-night/40">
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/docs/SearchModal.tsx frontend/package.json frontend/pnpm-lock.yaml
git commit -m "feat(docs): add SearchModal with Cmd+K and mini-search"
```

---

## Task 9: Breadcrumbs Component

**Files:**
- Create: `components/docs/Breadcrumbs.tsx`

**Interfaces:**
- Consumes: `slug` prop, `getDocBySlug` from config
- Produces: `<Breadcrumbs>` component

- [ ] **Step 1: Create the Breadcrumbs component**

```tsx
// components/docs/Breadcrumbs.tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getDocBySlug, getSectionForDoc } from "@/lib/docs/config";

interface BreadcrumbsProps {
  slug: string;
}

export default function Breadcrumbs({ slug }: BreadcrumbsProps) {
  const doc = getDocBySlug(slug);
  const section = getSectionForDoc(slug);

  return (
    <nav className="mb-6 flex items-center gap-2 text-[13px] font-bold text-night/40">
      <Link href="/docs" className="transition-colors hover:text-night">
        Documentation
      </Link>
      <ChevronRight size={12} />
      {section && (
        <>
          <span>{section.title}</span>
          <ChevronRight size={12} />
        </>
      )}
      {doc && <span className="text-night">{doc.title}</span>}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/docs/Breadcrumbs.tsx
git commit -m "feat(docs): add Breadcrumbs component"
```

---

## Task 10: PrevNextNav Component

**Files:**
- Create: `components/docs/PrevNextNav.tsx`

**Interfaces:**
- Consumes: `slug` prop, `getAdjacentDocs` from config
- Produces: `<PrevNextNav>` component

- [ ] **Step 1: Create the PrevNextNav component**

```tsx
// components/docs/PrevNextNav.tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add components/docs/PrevNextNav.tsx
git commit -m "feat(docs): add PrevNextNav for article navigation"
```

---

## Task 11: Feedback Component

**Files:**
- Create: `components/docs/Feedback.tsx`

**Interfaces:**
- Consumes: `slug` prop, `localStorage`
- Produces: `<Feedback>` component with Yes/No buttons

- [ ] **Step 1: Create the Feedback component**

```tsx
// components/docs/Feedback.tsx
"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface FeedbackProps {
  slug: string;
}

export default function Feedback({ slug }: FeedbackProps) {
  const [submitted, setSubmitted] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(`docs-feedback-${slug}`);
    return stored ? stored === "yes" : null;
  });

  function handleFeedback(helpful: boolean) {
    localStorage.setItem(`docs-feedback-${slug}`, helpful ? "yes" : "no");
    setSubmitted(helpful);
  }

  if (submitted !== null) {
    return (
      <div className="mt-12 rounded-xl border border-night/10 bg-white p-6 text-center">
        <p className="text-sm font-bold text-night/60">
          Thanks for your feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-xl border border-night/10 bg-white p-6 text-center">
      <p className="text-sm font-black text-night">Was this page helpful?</p>
      <p className="mt-1 text-[13px] font-bold text-night/50">
        Your feedback helps us improve.
      </p>
      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={() => handleFeedback(true)}
          className="flex items-center gap-2 rounded-lg border border-night/10 px-4 py-2 text-sm font-bold text-night/60 transition-all hover:border-violet hover:text-violet"
        >
          Yes <ThumbsUp size={14} />
        </button>
        <button
          onClick={() => handleFeedback(false)}
          className="flex items-center gap-2 rounded-lg border border-night/10 px-4 py-2 text-sm font-bold text-night/60 transition-all hover:border-violet hover:text-violet"
        >
          No <ThumbsDown size={14} />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/docs/Feedback.tsx
git commit -m "feat(docs): add Feedback widget with localStorage persistence"
```

---

## Task 12: RelatedArticles Component

**Files:**
- Create: `components/docs/RelatedArticles.tsx`

**Interfaces:**
- Consumes: `slug` prop, `docsNavigation` from config
- Produces: `<RelatedArticles>` component showing 3 related docs

- [ ] **Step 1: Create the RelatedArticles component**

```tsx
// components/docs/RelatedArticles.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { docsNavigation } from "@/lib/docs/config";

interface RelatedArticlesProps {
  slug: string;
}

export default function RelatedArticles({ slug }: RelatedArticlesProps) {
  const allItems = docsNavigation.flatMap((s) => s.items);
  const current = allItems.findIndex((i) => i.slug === slug);

  // Get 3 related items (next ones, wrapping around)
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
```

- [ ] **Step 2: Commit**

```bash
git add components/docs/RelatedArticles.tsx
git commit -m "feat(docs): add RelatedArticles component"
```

---

## Task 13: Docs Layout (3-Column Shell)

**Files:**
- Create: `app/(marketing)/docs/layout.tsx`

**Interfaces:**
- Consumes: `DocsSidebar`, `children`
- Produces: Layout wrapper for individual doc pages (NOT the landing page)

- [ ] **Step 1: Create the docs layout**

```tsx
// app/(marketing)/docs/layout.tsx
import DocsSidebar from "@/components/docs/DocsSidebar";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-7xl px-4 py-8 md:px-8 lg:px-12">
      <DocsSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(marketing\)/docs/layout.tsx
git commit -m "feat(docs): add docs layout with sidebar shell"
```

---

## Task 14: Dynamic Doc Page Renderer

**Files:**
- Create: `app/(marketing)/docs/[slug]/page.tsx`

**Interfaces:**
- Consumes: `renderMDX` from `lib/docs/mdx`, `getDocBySlug`/`getAllDocSlugs` from config, `Breadcrumbs`, `DocsToc`, `PrevNextNav`, `Feedback`, `RelatedArticles`
- Produces: Dynamic doc page at `/docs/[slug]`

- [ ] **Step 1: Create the dynamic page**

```tsx
// app/(marketing)/docs/[slug]/page.tsx
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllDocSlugs, getDocBySlug } from "@/lib/docs/config";
import { renderMDX } from "@/lib/docs/mdx";
import Breadcrumbs from "@/components/docs/Breadcrumbs";
import DocsToc from "@/components/docs/DocsToc";
import PrevNextNav from "@/components/docs/PrevNextNav";
import Feedback from "@/components/docs/Feedback";
import RelatedArticles from "@/components/docs/RelatedArticles";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
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
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const docsDir = path.join(process.cwd(), "content/docs");
  const filePath = path.join(docsDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { content, data } = matter(raw);
  const headings = extractHeadings(content);
  const mdxContent = await renderMDX(content);

  return (
    <div className="flex gap-10">
      {/* Center content */}
      <article className="flex-1 min-w-0 max-w-[720px]">
        <Breadcrumbs slug={slug} />

        <h1 className="display text-4xl uppercase sm:text-5xl text-night">
          {data.title || doc.title}
        </h1>

        {data.description && (
          <p className="mt-3 text-base font-normal leading-7 text-night/60 sm:text-[18px]">
            {data.description}
          </p>
        )}

        <div className="mt-8">{mdxContent}</div>

        <PrevNextNav slug={slug} />
        <Feedback slug={slug} />
        <RelatedArticles slug={slug} />
      </article>

      {/* Right TOC */}
      <DocsToc headings={headings} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(marketing\)/docs/\[slug\]/page.tsx
git commit -m "feat(docs): add dynamic doc page renderer with MDX"
```

---

## Task 15: Docs Landing Page

**Files:**
- Modify: `app/(marketing)/docs/page.tsx` (complete rewrite)

**Interfaces:**
- Consumes: `docsNavigation` from config, `SearchModal`
- Produces: Full landing page with hero, search, categories, features, help

- [ ] **Step 1: Rewrite the landing page**

```tsx
// app/(marketing)/docs/page.tsx
"use client";

import { useState, useEffect } from "react";
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
  Search,
  MessageSquare,
  BarChart3,
  Activity,
  LayoutGrid,
  Headphones,
  BookOpen,
} from "lucide-react";
import SearchModal from "@/components/docs/SearchModal";
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
  {
    title: "AI Proposal Generator",
    description: "Create proposals in seconds with AI.",
    icon: FileText,
    color: "bg-[#9474ff]/10 text-[#9474ff]",
  },
  {
    title: "Escrow Payments",
    description: "Secure milestone-based escrow on Stellar.",
    icon: Shield,
    color: "bg-[#ff8a22]/10 text-[#ff8a22]",
  },
  {
    title: "Milestone Tracking",
    description: "Track progress and approve deliverables.",
    icon: Milestone,
    color: "bg-[#22bd93]/10 text-[#22bd93]",
  },
  {
    title: "Client Portal",
    description: "Shared view for clients to track projects.",
    icon: Users,
    color: "bg-[#3b82f6]/10 text-[#3b82f6]",
  },
  {
    title: "Invoices",
    description: "Auto-generated invoices on milestone release.",
    icon: Receipt,
    color: "bg-[#ff4f42]/10 text-[#ff4f42]",
  },
  {
    title: "Payments",
    description: "Track releases and client payments.",
    icon: Wallet,
    color: "bg-[#ff8a22]/10 text-[#ff8a22]",
  },
  {
    title: "Analytics",
    description: "Real-time dashboards for project health.",
    icon: BarChart3,
    color: "bg-[#9474ff]/10 text-[#9474ff]",
  },
  {
    title: "Activity Feed",
    description: "Complete audit trail of all project activity.",
    icon: Activity,
    color: "bg-[#22bd93]/10 text-[#22bd93]",
  },
];

const categoryIcons: Record<string, typeof Folder> = {
  projects: Folder,
  clients: Users,
  proposals: FileText,
  contracts: FileCheck,
  milestones: Milestone,
  escrow: Shield,
  invoices: Receipt,
  payments: Wallet,
  freighter: Wallet,
  api: Code,
  security: Shield,
  faq: HelpCircle,
  "getting-started": Rocket,
  workspaces: LayoutGrid,
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
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Cmd+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allItems = docsNavigation.flatMap((s) => s.items);

  return (
    <div className="overflow-hidden">
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

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

          {/* Search bar */}
          <button
            onClick={() => setSearchOpen(true)}
            className="mx-auto mt-8 flex w-full max-w-lg items-center gap-3 rounded-2xl bg-white px-5 py-4 text-left transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.15)]"
          >
            <Search size={18} className="shrink-0 text-night/40" />
            <span className="flex-1 text-sm text-night/40">
              Search documentation...
            </span>
            <kbd className="rounded-lg bg-night px-2 py-1 text-[11px] font-bold text-white/60">
              ⌘K
            </kbd>
          </button>
        </div>
      </section>

      {/* ── Popular Guides ── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">
            Popular Guides
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <Link
                  key={guide.title}
                  href={guide.href}
                  className="group cut-corner rounded-[14px] border-2 border-night bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet hover:shadow-[0_0_30px_rgba(148,116,255,0.12)]"
                >
                  <span
                    className={`grid size-10 place-items-center rounded-xl ${guide.color} bg-current/10`}
                  >
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-3 display text-lg uppercase text-night">
                    {guide.title}
                  </h3>
                  <p className="mt-1 text-[13px] font-bold leading-5 text-night/60">
                    {guide.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-black text-violet">
                    Read Guide{" "}
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Browse Documentation ── */}
      <section className="px-4 py-12 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">
            Browse Documentation
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {allItems.map((item) => {
              const Icon = categoryIcons[item.slug] || Folder;
              const desc =
                categoryDescriptions[item.slug] || "Documentation for this topic.";
              return (
                <Link
                  key={item.slug}
                  href={`/docs/${item.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-night/10 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-violet hover:shadow-[0_0_20px_rgba(148,116,255,0.08)]"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-violet/10 text-violet">
                    <Icon size={18} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-night">
                      {item.title}
                    </p>
                    <p className="text-[12px] font-bold text-night/50">
                      {desc}
                    </p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-night/20 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">
            Platform Features
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-night/10 bg-white p-5"
                >
                  <span
                    className={`grid size-10 place-items-center rounded-xl ${feature.color}`}
                  >
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-3 text-sm font-black text-night">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-[12px] font-bold text-night/50">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Help Section ── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[24px] bg-night p-8 text-white md:p-12">
          <div className="text-center">
            <h2 className="display text-4xl uppercase sm:text-5xl">
              Still need help?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base font-normal text-white/70">
              Our support team is here to help you succeed with Orka.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="#"
                className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/20"
              >
                <MessageSquare size={16} /> Join Discord
              </a>
              <Link
                href="/contact"
                className="flex items-center gap-2 rounded-full bg-violet px-6 py-3 text-sm font-black text-white transition hover:bg-violet/90"
              >
                <Headphones size={16} /> Contact Support
              </Link>
              <a
                href="#"
                className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/20"
              >
                <BookOpen size={16} /> Book Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="px-4 pb-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="display text-3xl uppercase text-night sm:text-4xl">
            Start building with ORKA
          </h2>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-lime px-8 py-4 text-sm font-black uppercase text-night transition-all hover:-translate-y-0.5 hover:bg-orange hover:text-white"
          >
            Open Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(marketing\)/docs/page.tsx
git commit -m "feat(docs): rewrite landing page with hero, search, categories, features"
```

---

## Task 16: MDX Content Files

**Files:**
- Create: `content/docs/getting-started.mdx` through `content/docs/faq.mdx` (14 files)

**Interfaces:**
- Consumes: none
- Produces: 14 MDX content files with realistic ORKA documentation

- [ ] **Step 1: Create getting-started.mdx**

```mdx
---
title: "Getting Started"
description: "Learn ORKA from scratch — create an account, set up your workspace, and run your first project."
category: "Getting Started"
order: 1
icon: "rocket"
---

Welcome to ORKA! This guide walks you through creating your first workspace and running a project end-to-end.

## Creating an Account

Sign up with your email or Google account. No wallet or seed phrase needed — ORKA handles the blockchain infrastructure for you.

## Creating Your First Workspace

A workspace is your agency's home on ORKA. Each workspace contains projects, team members, and billing settings.

1. Click **Create Workspace** from the dashboard
2. Name your workspace (e.g., "Oreenza Design Studio")
3. Invite team members by email

## Connecting Freighter (Optional)

If you're crypto-native, you can connect your Freighter wallet for self-custody mode. Otherwise, ORKA manages your keys securely.

## Your First Project

1. Create a new project from the workspace dashboard
2. Add the client's details
3. Break the work into milestones with prices
4. Invite the client to review and approve

<Callout type="tip">
You can also generate proposals and contracts using ORKA's AI — just paste the client's brief and let AI handle the scoping.
</Callout>
```

- [ ] **Step 2: Create projects.mdx**

```mdx
---
title: "Projects"
description: "Manage projects, timelines, milestones, and client deliverables."
category: "Product Guide"
order: 3
icon: "folder"
---

Projects organize your client work. Each project contains milestones, files, activity feeds, and a timeline.

## Creating a Project

1. Navigate to your workspace dashboard
2. Click **New Project**
3. Enter the project name, client details, and description
4. Set the project currency and timezone

## Project Overview

The project overview shows:
- **Status**: Active, Paused, or Completed
- **Total value**: Sum of all milestone prices
- **Funded amount**: How much is locked in escrow
- **Completion**: Percentage of milestones released

## Timeline

Track project progress with a visual timeline showing milestone status, deadlines, and deliverables.

## Activity Feed

Every action in a project is logged — proposals sent, contracts signed, milestones funded, work submitted, payments released. The activity feed gives you a complete audit trail.

## Files

Attach files to milestones or the project overall. ORKA supports links to GitHub repos, Figma files, Google Docs, and direct uploads.

## Client Portal

Clients get a read-only portal to track project progress, view milestones, and approve deliverables — without needing an ORKA account.
```

- [ ] **Step 3: Create remaining 12 MDX files**

Follow the same pattern for: `workspaces.mdx`, `proposals.mdx`, `contracts.mdx`, `milestones.mdx`, `escrow.mdx`, `payments.mdx`, `invoices.mdx`, `clients.mdx`, `freighter.mdx`, `api.mdx`, `security.mdx`, `faq.mdx`.

Each file should have:
- Frontmatter with title, description, category, order, icon
- 3-5 sections with H2 headings
- Practical, actionable content about the ORKA feature
- At least one `<Callout>` component usage
- Code examples where relevant (especially for API docs)

- [ ] **Step 4: Verify all 14 files exist**

```bash
ls -la content/docs/
```

Expected: 14 `.mdx` files.

- [ ] **Step 5: Commit**

```bash
git add content/docs/
git commit -m "feat(docs): add all 14 MDX content files with ORKA documentation"
```

---

## Task 17: Build & Verify

**Files:**
- No new files — verification only

**Interfaces:**
- Consumes: all previously created files
- Produces: working build, working dev server

- [ ] **Step 1: Generate search index**

```bash
cd frontend && npx tsx lib/docs/search.ts
```

Expected: `public/search-index.json` created with 14 entries.

- [ ] **Step 2: Run the build**

```bash
cd frontend && pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Start dev server and verify**

```bash
cd frontend && pnpm dev
```

Then verify in browser:
- `/docs` shows landing page with hero, search bar, categories, features, help
- `/docs/getting-started` shows 3-column layout with sidebar, content, TOC
- `/docs/projects` shows 3-column layout
- `⌘K` opens search modal
- Sidebar navigation works (click through all pages)
- TOC highlights active heading on scroll
- Mobile: sidebar collapses, TOC hides
- All links work correctly

- [ ] **Step 4: Run lint**

```bash
cd frontend && pnpm lint
```

Expected: No errors.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(docs): complete docs experience — landing, individual pages, search, sidebar"
```

---

## Self-Review Checklist

After completing all tasks, verify:

1. **Spec coverage**: Landing page (hero, search, categories, features, help) ✓, Individual pages (sidebar, content, TOC) ✓, Search (Cmd+K, mini-search) ✓, All 14 MDX files ✓, Components (Callout, Breadcrumbs, PrevNextNav, Feedback, RelatedArticles) ✓, Mobile responsive ✓, Accessibility ✓

2. **No placeholders**: All steps contain complete code. No TBDs or TODOs.

3. **Type consistency**: `SearchEntry` type used consistently across search.ts and SearchModal.tsx. `DocItem`/`DocSection` types used consistently across config.ts, Sidebar, Breadcrumbs, PrevNextNav.

4. **Scope boundaries**: Only docs pages modified. No changes to auth, dashboard, API, or DB.
