# ORKA Documentation Experience — Design Spec

**Date**: 2026-07-22
**Status**: Approved
**Scope**: Documentation pages only — no changes to auth, dashboard, API routes, or DB schema

---

## Goal

Transform ORKA's documentation from a single-page blog-style layout into a premium SaaS documentation hub (Stripe/Linear/Vercel/Supabase quality) while keeping ORKA's existing visual identity. Users should immediately understand "this is the operating system for service businesses."

## Architecture Decision

**Chosen**: MDX files in `content/docs/` directory + Next.js App Router dynamic routes + `next-mdx-remote` rendering.

Alternatives considered:
- Hardcoded React components (rejected: content mixed with layout, hard to maintain)
- Contentlayer (rejected: semi-maintained, adds heavy dependency)

---

## File Structure

```
frontend/
├── content/
│   └── docs/
│       ├── getting-started.mdx
│       ├── workspaces.mdx
│       ├── projects.mdx
│       ├── proposals.mdx
│       ├── contracts.mdx
│       ├── milestones.mdx
│       ├── escrow.mdx
│       ├── payments.mdx
│       ├── invoices.mdx
│       ├── clients.mdx
│       ├── freighter.mdx
│       ├── api.mdx
│       ├── security.mdx
│       └── faq.mdx
├── lib/
│   └── docs/
│       ├── config.ts          # Sidebar navigation tree + metadata
│       ├── search.ts          # Build-time search index generator
│       └── mdx.ts             # MDX rendering utilities
├── components/
│   └── docs/
│       ├── DocsLayout.tsx     # Shared 3-column layout shell
│       ├── DocsSidebar.tsx    # Left sidebar navigation
│       ├── DocsToc.tsx        # Right "On this page" TOC
│       ├── SearchModal.tsx    # Cmd+K search dialog
│       ├── Breadcrumbs.tsx    # Breadcrumb trail
│       ├── Feedback.tsx       # "Was this helpful?" widget
│       ├── RelatedArticles.tsx
│       ├── PrevNextNav.tsx    # Previous/Next article cards
│       └── Callout.tsx        # Blue/green/yellow/red info boxes
└── app/
    └── (marketing)/
        └── docs/
            ├── page.tsx           # Landing page (no sidebar)
            ├── layout.tsx         # Docs layout wrapper (individual pages only)
            └── [slug]/
                └── page.tsx       # Individual doc pages
```

## Routes

- `/docs` → Landing page (full-width, no sidebar, different chrome)
- `/docs/getting-started` → Individual doc (3-column layout)
- `/docs/projects` → Individual doc
- `/docs/escrow` → Individual doc
- ... etc for all 14 doc pages

`docs/layout.tsx` wraps individual pages but NOT the landing page.

---

## Landing Page Design (`/docs`)

### Hero Section
- Night background, `rounded-b-[42px]` / `md:rounded-b-[72px]` (matches existing ORKA hero)
- Badge: `Documentation` text
- Heading: `Documentation` in `display` (Anton), large, uppercase
- Subtitle: `Everything you need to run your service business with ORKA.`
- **Search bar**: Large, centered, white background, placeholder `Search documentation...`, keyboard shortcut badge `⌘K` on right in `bg-night` rounded pill

### Popular Guides Section (4 cards in a row)
- Each card: icon (lucide-react), title, short description, `Read Guide →` link
- Cards use ORKA's `cut-corner` clip, white background, `border-2 border-night`
- Hover: lift (`-translate-y-1`), violet border, soft glow
- Cards: "Generate Your First Proposal", "Create Your First Contract", "Fund Escrow & Get Paid", "Connect Freighter Wallet"

### Browse Documentation Grid (2-column list)
- Each row: icon + title + description + right chevron
- Categories: Projects, Clients, Proposals, Contracts, Milestones, Escrow, Invoices, Payments, Wallets, AI Copilot, Workspace, Settings, API
- Clean list style, each item clickable to its doc page

### Features Section (3-column grid)
- Cards for: AI Proposal Generator, Escrow Payments, Milestone Tracking, Client Portal, Invoices, Payments, Analytics, Activity Feed
- Each: icon, title, one-line explanation

### Help Section (large dark card)
- `Still need help?` heading
- Three buttons: Join Discord, Contact Support, Book Demo

### Footer CTA
- `Start building with ORKA` heading
- `Open Dashboard` button

---

## Individual Doc Pages Design (`/docs/[slug]`)

### Left Sidebar (240px, sticky)
- **Search**: Compact search input at top
- **Navigation tree**: Nested categories, always expanded
  - GETTING STARTED: Getting Started, Workspaces
  - PRODUCT GUIDE: Projects, Proposals, Contracts, Milestones, Escrow, Payments, Invoices, Clients, Freighter
  - DEVELOPERS: API, Security
  - RESOURCES: FAQ
- Active page: violet left border + violet text
- **"New to Orka?"** card at bottom with "Start Tutorial →" link
- **"Need Help?"** card with headphone icon + "Contact Support →"

### Center Content (flexible, max-width ~720px)
- **Breadcrumbs**: `Documentation > Projects > Timeline`
- **Page title**: `display` (Anton), large
- **Copy link button**: Top right of title
- **MDX content** with custom components:
  - H1/H2/H3 with proper hierarchy
  - Paragraphs, lists, tables
  - **Callouts**: Blue (info/tips), Green (success), Yellow (warnings), Red (errors)
  - **Code blocks**: Dark editor style (`bg-night`), with copy button ("Copied!" for 2s)
  - **Images**: Rounded corners, shadow
  - **Feature icons row**: 4 icons with labels
  - **Process flow**: Numbered steps with connecting dots/lines

### Right Sidebar (200px, sticky)
- **"On this page"**: Auto-generated from H2/H3 headings, smooth scroll, violet highlight on active
- **Article metadata**: Last Updated, Reading Time, Difficulty, Tags
- **Share article**: Copy link button
- **"Still stuck?"** card: headphone icon, "Contact Support →" button
- **"Was this helpful?"** widget: Yes/No buttons, localStorage feedback
- **"Join Orka Community"** card: Discord icon, "Join on Discord →" link

### Bottom Navigation
- **Previous/Next article** cards: Two side-by-side cards
- **"Back to Docs"** link

### Mobile Behavior
- Left sidebar → hamburger menu
- Right TOC → hidden
- Search stays at top
- Full-width content
- Typography scales down

---

## Styling

### Design Principles
- Keep existing ORKA branding — no new colors, fonts, or spacing
- Use existing classes: `display`, `cut-corner`, `sticker`, `shadow-hard`, `section-label`, `product-icon-*`
- Use existing tokens: `bg-night`, `text-violet`, `text-orange`, `bg-lime`, `text-coral`, `bg-teal`
- Use existing components: `Button`, `Card`, `Badge`, `Input`

### Docs Landing Page
- Hero: Same pattern as other marketing pages
- Cards: `cut-corner` clip, `border-2 border-night`, white bg, `shadow-hard` on hover
- Category grid: Clean list with chevron, white bg, hover lift
- Search bar: White bg, `rounded-2xl`, large, `⌘K` badge in `bg-night` rounded pill

### Individual Doc Pages
- Layout: `lg:grid-cols-[240px_1fr_200px]`
- Sidebar: `bg-white/60`, `border-r border-night/10`, sticky
- Content: `max-w-[720px]`, DM Sans, `text-[16px]`/`leading-8`
- Right TOC: `sticky top-8`, violet left border on active
- Code blocks: `bg-night`, `text-white`, `rounded-xl`, copy button
- Callouts: Left border (4px), colored bg tint, icon + title + content
- Tables: Clean borders, `border-collapse`
- Images: `rounded-xl`, `shadow-product-card`

### Animations (Subtle)
- Cards: `transition-transform duration-300 hover:-translate-y-1`
- Hover glow: `hover:shadow-[0_0_30px_rgba(148,116,255,0.15)]`
- Smooth scroll: `scroll-behavior: smooth`
- Search modal: Fade in + scale up
- No heavy animations

---

## Search Implementation

### Cmd+K Search Modal
- Triggers on `⌘K` (Mac) or `Ctrl+K` (Windows/Linux)
- Also triggered by clicking search bar on landing page
- Full-screen overlay with centered modal
- Search input at top, results below
- Keyboard navigation: arrow keys, Enter to select, Escape to close

### How It Works
1. **Build time**: Script reads all MDX files, extracts frontmatter + first ~200 words, creates `search-index.json` in `public/`
2. **Client load**: Search modal fetches `/search-index.json` on first open (lazy)
3. **Search**: `mini-search` library for fuzzy matching across title + content + category
4. **Results**: Grouped by category, each shows title, category badge, content snippet with highlighted match
5. **Navigation**: Click result → navigate to doc page, scroll to matched section

### Dependencies
- `next-mdx-remote` (~15KB gzipped) — MDX rendering
- `mini-search` (~5KB gzipped) — client-side search

---

## Content Structure

### MDX Frontmatter Format
```yaml
---
title: "Projects"
description: "Manage projects, timelines, milestones, and client deliverables."
category: "Product Guide"
order: 1
icon: "folder"
---
```

### Navigation Config (`lib/docs/config.ts`)
Each sidebar item maps 1:1 to an MDX file. The sidebar items below match the files in `content/docs/`.

```typescript
export interface DocSection {
  title: string;           // "GETTING STARTED"
  items: DocItem[];
}

export interface DocItem {
  title: string;           // "Projects"
  slug: string;            // "projects" (matches MDX filename without extension)
  icon?: string;           // lucide icon name
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
```

### Content Volume
- 14 MDX files with realistic ORKA content (one per sidebar item)
- Each file: ~200-400 lines of rich content
- Existing monolithic page content redistributed across new pages
- MDX filenames match sidebar slugs exactly (e.g., `projects.mdx` → slug `projects`)

---

## Implementation Order

### Phase 1: Foundation
1. Install `next-mdx-remote` and `mini-search`
2. Create `content/docs/` directory with all 14 MDX files
3. Create `lib/docs/config.ts` (navigation tree)
4. Create `lib/docs/search.ts` (build-time index generator)
5. Create `lib/docs/mdx.ts` (MDX rendering utilities)

### Phase 2: Components
6. `components/docs/DocsSidebar.tsx`
7. `components/docs/DocsToc.tsx`
8. `components/docs/SearchModal.tsx`
9. `components/docs/Breadcrumbs.tsx`
10. `components/docs/Callout.tsx`
11. `components/docs/PrevNextNav.tsx`
12. `components/docs/Feedback.tsx`
13. `components/docs/RelatedArticles.tsx`

### Phase 3: Pages
14. Rewrite `docs/page.tsx` — full landing page
15. Create `docs/[slug]/page.tsx` — dynamic doc page renderer
16. Create `docs/layout.tsx` — 3-column layout shell

### Phase 4: Polish
17. Mobile responsive behavior
18. Reading progress bar
19. Copy-to-clipboard on code blocks
20. Smooth scroll for TOC links
21. Accessibility: keyboard nav, focus states, ARIA labels

---

## Scope Boundaries

### What Changes
- `frontend/app/(marketing)/docs/page.tsx` — completely rewritten as landing page
- New files: `content/docs/*.mdx`, `lib/docs/*`, `components/docs/*`, `app/(marketing)/docs/[slug]/*`

### What Does NOT Change
- `app/(marketing)/layout.tsx` — unchanged
- Navbar, Footer, WaitlistCta — unchanged
- Authentication pages — unchanged
- Dashboard — unchanged
- API routes — unchanged
- Database schema — unchanged
- Any page outside `/docs` — unchanged

---

## Accessibility
- Keyboard navigation throughout
- Focus states on all interactive elements
- ARIA labels on buttons and navigation
- Semantic HTML (proper heading hierarchy, landmarks)
- Screen reader friendly
- `prefers-reduced-motion` respected

## Performance
- Lazy-load search index (only fetch on first search open)
- Dynamic imports for SearchModal (not in initial bundle)
- No unnecessary client components — most pages are server-rendered
- MDX compiled at build time, not runtime
