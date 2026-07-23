# ORKA Documentation Redesign — Design Spec

**Date:** 2026-07-23
**Status:** Approved
**Approach:** Refactor in-place (Approach A)

## Summary

Complete redesign of ORKA's documentation experience into a premium, world-class documentation platform. The redesign covers the docs navbar (full-width mega menu), docs landing page (focused docs discovery), and individual doc pages (three-column layout with left sidebar TOC). All while preserving ORKA's existing brand identity, colors, typography, and content layer.

## Key Decisions

| Decision | Choice |
|----------|--------|
| Architecture | Refactor in-place — keep `(docs)` route group, config, content, MDX rendering |
| Individual doc layout | Three-column: left sidebar TOC + content + right sidebar |
| Landing page | Docs-focused: hero with search + popular guides + category grid |
| Mega menu | Full-width panel (Supabase/Stripe style) |
| Theme | Light theme with dark navbar |
| Content | Reuse all 82 existing MDX files unchanged |

## Scope

### In Scope
- Docs navbar with full-width mega menu
- Docs landing page redesign
- Individual doc pages with three-column layout
- New components: LeftSidebar, MegaPanel, ReadingProgress, ArticleCard, CopyButton, Step, Tabs, Accordion
- Enhanced components: SearchModal styling, Feedback, RelatedArticles, PrevNextNav, DocsBreadcrumbs
- Responsive design (desktop/tablet/mobile)
- Updated MDX component styling

### Out of Scope
- Content changes (all 82 MDX files stay as-is)
- Blog page (separate project)
- Marketing page changes
- Search infrastructure changes (MiniSearch stays)
- API changes to `lib/docs/config.ts` (additive only)

---

## 1. Docs Navbar (`DocsTopNav`)

### Purpose
Replace the current `DocsNavbar` with a full-width mega menu navbar inspired by Supabase Docs.

### Location
`components/docs/DocsTopNav.tsx` (replaces `DocsNavbar.tsx`)

### Layout
- **Sticky** at top, `z-40`
- **Full width**, dark navy background (`bg-[#082033]`)
- **Height:** 64px (h-16)
- **Border:** `border-b border-white/10`

### Structure
```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] ORKA  │ Getting Started ▼ │ Workspaces ▼ │ ... │ [Search] [GitHub] [Theme] │
└──────────────────────────────────────────────────────────────────┘
```

### Nav Items
Pulled from `docsNavigation` config. Each top-level item becomes a nav trigger:

- Getting Started
- Workspaces
- Projects
- Clients
- Proposals
- Contracts
- Milestones
- Escrow
- Payments
- AI Copilot
- Resources

### Mega Panel
On hover/click, a full-width panel drops down:

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  [Section Header]          [Column 1]        [Column 2]             │
│  Description text           Link 1            Link 4                 │
│                              Link 2            Link 5                 │
│                              Link 3            Link 6                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

- **Width:** Full viewport width, max-width constrained to content area
- **Background:** White (`bg-white`) with subtle shadow
- **Animation:** Fade-in + slide-down (150ms ease-out)
- **Columns:** 2-3 columns depending on number of children
- **Active state:** Current page highlighted with violet text + violet/10 background
- **Close:** Click outside, press Escape, or hover away (150ms delay)

### Right Side
- **Search trigger:** Rounded button with search icon + "Search…" text + `⌘K` kbd indicator
- **GitHub icon:** Link to repo
- **Theme toggle:** Reuse existing `ThemeToggle` component

### Mobile (< 1024px)
- Hamburger menu button replaces nav items
- Opens a slide-in drawer from left (300px wide)
- Drawer has accordion sections for each category
- Search button at top of drawer

### Interactions
- `⌘K` / `Ctrl+K` opens search modal (existing `SearchModal`)
- Hover on nav item opens mega panel after 100ms delay
- Mouse leave closes panel after 150ms delay
- Escape closes panel and search

### Files Modified
- `components/docs/DocsTopNav.tsx` — NEW (replaces `DocsNavbar.tsx`)
- `components/docs/MegaPanel.tsx` — NEW
- `app/(docs)/layout.tsx` — update import from `DocsNavbar` to `DocsTopNav`

---

## 2. Docs Landing Page

### Purpose
Focused documentation discovery page with hero, search, popular guides, and category grid.

### Location
`app/(docs)/docs/page.tsx` (rewrite existing)

### Layout
Full-width, single column. No sidebar on landing page.

### Sections

#### 2.1 Hero
- **Background:** Soft gradient (purple/lavender glow), subtle grid pattern overlay
- **Badge:** Pill with "ORKA DOCUMENTATION" text, small, centered
- **Heading:** Large display text (Anton font): "Everything you need to run your service business with ORKA"
- **Subtitle:** One-liner about what docs cover
- **Search bar:** Large centered input with search icon, `⌘K` shortcut indicator
- **Padding:** Generous vertical padding (py-20+)

#### 2.2 Popular Guides
- **Section heading:** "Popular Guides" (display font)
- **Grid:** 4 columns desktop, 2 tablet, 1 mobile
- **Cards:** Cut-corner styling (`.cut-corner`), white bg, night border
  - Icon (colored circle: violet/green/orange/blue)
  - Title (display font, uppercase)
  - Description (small text, night/60)
  - "Read Guide →" link (violet)
  - Hover: lift -1px, violet border, violet glow shadow
- **Content:** Pull from existing `popularGuides` array in current page

#### 2.3 Browse Documentation
- **Section heading:** "Browse Documentation" (display font)
- **Grid:** 2 columns desktop, 1 mobile
- **Cards:** Each category from `docsNavigation`
  - Icon (violet circle)
  - Title (font-black)
  - Description (small, night/50)
  - Arrow right icon
  - Hover: lift, violet border, subtle shadow
- **Links to:** `/docs/{slug}` (parent category page)

#### 2.4 Platform Features
- **Section heading:** "Platform Features" (display font)
- **Grid:** 4 columns desktop, 2 tablet, 1 mobile
- **Cards:** White bg, night/10 border
  - Icon with colored background (bg-{color}/10)
  - Title (font-black)
  - Description (small, night/50)
- **Features:** AI Proposal Generator, Escrow Payments, Milestone Tracking, Client Portal, Invoices, Payments, Analytics, Activity Feed

#### 2.5 Bottom CTA
- **Background:** Dark navy (`bg-night`), rounded corners (24px)
- **Heading:** "Still need help?" (display font, white)
- **Subtitle:** "Our support team is here to help you succeed with ORKA." (white/70)
- **Buttons:** Discord (white/10 bg), Contact Sales (violet bg), Email Us (outlined)

### Files Modified
- `app/(docs)/docs/page.tsx` — full rewrite (stays client component)

---

## 3. Individual Doc Pages (Three-Column Layout)

### Purpose
Premium reading experience with left sidebar TOC, main content, and right sidebar resources.

### Location
`app/(docs)/docs/[...slug]/page.tsx` (rewrite existing)

### Layout
```
Desktop (≥1024px):  grid-cols-[240px_1fr_280px]
Tablet (768-1023px): grid-cols-[1fr_280px] (left sidebar collapses)
Mobile (<768px):    single column (both sidebars below content)
```

### 3.1 Left Sidebar (240px, sticky)

**Sticky:** `sticky top-[80px]`, self-start, max-height calc(100vh - 100px), overflow-y-auto

**Sections:**

#### On This Page
- Heading: "ON THIS PAGE" (uppercase,-xs, font-black, night/50)
- Nav links for each h2/h3 heading
- h3 items indented (pl-6 vs pl-3)
- Active state: violet left border (3px), violet text
- Inactive: transparent border, night/50 text, hover night/80
- Scroll-spy via IntersectionObserver (reuse existing `DocsToc` logic)

#### Reading Progress
- Horizontal bar: 4px height, rounded-full, night/10 bg
- Fill: violet bg, width = scroll percentage
- Updates on scroll via `scroll` event listener

#### Estimated Read Time
- Clock icon + "ESTIMATED READ" label + "X min read"
- Calculated from word count: `Math.ceil(wordCount / 200)`

#### Share This Article
- "SHARE THIS ARTICLE" label
- Three buttons: LinkedIn, X (Twitter), Copy Link
- Each with icon + label
- Copy Link uses `navigator.clipboard.writeText()`

#### Written By (placeholder)
- "WRITTEN BY" label
- Author name + role (hardcoded or from frontmatter `author` field)
- "View all posts →" link

### 3.2 Center Content (flex-1)

**Max-width:** `max-w-3xl` (for comfortable reading, ~72-80 chars)

**Sections top-to-bottom:**

#### Breadcrumbs
- `Home > {Category} > {Page}`
- Reuse existing `DocsBreadcrumbs` logic
- Restyle: smaller text, night/50, `>` separators

#### Title
- Display font (Anton), uppercase, `text-4xl sm:text-5xl`
- Color: `text-night`

#### Description
- From frontmatter `description`
- `text-base`, `text-night/60`, `leading-7`

#### Meta Info
- Last updated date + reading time
- Small text, night/40

#### MDX Content
- Rendered via existing `renderMDX()` function
- Enhanced component styles (see Section 5)
- Max-width constrained for readability

#### Prev/Next Navigation
- Reuse existing `PrevNextNav` logic
- Restyle: cards with border, hover lift, violet accent

#### Feedback
- Reuse existing `Feedback` component
- Minor style updates to match new card aesthetic

#### Related Articles
- Reuse existing `RelatedArticles` logic
- Update to show article cards with category tag, title, reading time

### 3.3 Right Sidebar (280px, sticky)

**Sticky:** `sticky top-[80px]`, self-start

**Sections:**

#### Promo Card
- "Run your agency smarter with ORKA"
- Description text
- "Join Waitlist →" button (violet bg)
- "No spam. Unsubscribe anytime." note

#### Free Resources
- "FREE RESOURCES" heading
- List of resource links:
  - Proposal Template (Free)
  - Contract Template (Free)
  - Invoice Template (Free)
  - Agency Onboarding Checklist (Free)
- "View all resources →" link

#### You Might Also Like
- "YOU MIGHT ALSO LIKE" heading
- 3 article cards:
  - Thumbnail image (placeholder for now)
  - Title
  - Reading time
- Links to related docs

#### See ORKA in Action
- "See ORKA in Action" heading
- Description
- "Book a Demo →" button

### Responsive Behavior

#### Tablet (768-1023px)
- Left sidebar collapses into a floating button that opens a slide-over TOC
- Content + right sidebar remain
- Right sidebar moves below content on smaller tablets

#### Mobile (< 768px)
- Single column layout
- Both sidebars collapse below content
- TOC available via a sticky "On This Page" button at top
- Hamburger nav replaces top nav items

### Files Modified
- `app/(docs)/docs/[...slug]/page.tsx` — full rewrite
- `components/docs/LeftSidebar.tsx` — NEW
- `components/docs/ReadingProgress.tsx` — NEW
- `components/docs/ShareButtons.tsx` — NEW

---

## 4. New Components

### 4.1 `DocsTopNav` (`components/docs/DocsTopNav.tsx`)
Full-width sticky navbar with mega menu. Client component.

### 4.2 `MegaPanel` (`components/docs/MegaPanel.tsx`)
Full-width dropdown panel. Receives `DocItem` and renders columns of links. Client component.

### 4.3 `LeftSidebar` (`components/docs/LeftSidebar.tsx`)
Sticky left sidebar with TOC, progress, share, author. Client component (needs scroll tracking).

### 4.4 `ReadingProgress` (`components/docs/ReadingProgress.tsx`)
Horizontal progress bar. Client component. Uses `scroll` event.

### 4.5 `ShareButtons` (`components/docs/ShareButtons.tsx`)
LinkedIn, X, Copy Link buttons. Client component. Uses `navigator.clipboard`.

### 4.6 `ArticleCard` (`components/docs/ArticleCard.tsx`)
Card for landing page category grid. Server component (no interactivity needed).

### 4.7 `PopularGuideCard` (`components/docs/PopularGuideCard.tsx`)
Larger card for popular guides section. Server component.

### 4.8 `CopyButton` (`components/docs/CopyButton.tsx`)
Copy-to-clipboard button for code blocks. Client component.

### 4.9 `Step` (`components/docs/Step.tsx`)
Numbered step component for tutorials. Server component.

### 4.10 `DocsTabs` (`components/docs/DocsTabs.tsx`)
Client-side tab switcher for MDX content. Client component.

### 4.11 `Accordion` (`components/docs/Accordion.tsx`)
Expandable/collapsible section. Client component.

### 4.12 `ImageCaption` (`components/docs/ImageCaption.tsx`)
Image with caption text below. Server component.

---

## 5. Enhanced Components

### 5.1 `SearchModal`
- Keep existing logic (MiniSearch, keyboard nav, fetch index)
- Update styling: white bg, rounded-2xl, shadow-2xl
- Add category badges to results
- Add keyboard shortcut indicators

### 5.2 `Callout`
- Keep existing types (info/tip/warning/error)
- Minor style updates: slightly more padding, refined colors
- Add dark mode support for callout backgrounds

### 5.3 `Feedback`
- Keep existing logic (localStorage-backed)
- Update card styling to match new right sidebar aesthetic

### 5.4 `RelatedArticles`
- Update to show article cards with category tag, title, reading time
- Keep existing logic (rotate through categories)

### 5.5 `PrevNextNav`
- Restyle cards: rounded-xl, border-2, hover lift
- Keep existing logic (getAdjacentDocs)

### 5.6 `DocsBreadcrumbs`
- Restyle: smaller text, `>` separators instead of `/`
- Keep existing logic (getDocBySlug, getSectionForDoc)

### 5.7 MDX Components (`lib/docs/mdx.tsx`)
- Add `CopyButton` to code blocks
- Add `Step` wrapper for numbered lists
- Add `DocsTabs` for tabbed content
- Add `Accordion` for expandable sections
- Add `ImageCaption` for images
- Update typography: slightly larger body text, more line height
- Keep existing overrides (h2, h3, p, ul, ol, table, etc.)

---

## 6. Files to Create

| File | Type | Purpose |
|------|------|---------|
| `components/docs/DocsTopNav.tsx` | Client | Full-width navbar with mega menu |
| `components/docs/MegaPanel.tsx` | Client | Full-width dropdown panel |
| `components/docs/LeftSidebar.tsx` | Client | Left sidebar with TOC, progress, share |
| `components/docs/ReadingProgress.tsx` | Client | Scroll progress bar |
| `components/docs/ShareButtons.tsx` | Client | LinkedIn/X/Copy Link |
| `components/docs/ArticleCard.tsx` | Server | Landing page category card |
| `components/docs/PopularGuideCard.tsx` | Server | Landing page popular guide card |
| `components/docs/CopyButton.tsx` | Client | Code block copy button |
| `components/docs/Step.tsx` | Server | Numbered step |
| `components/docs/DocsTabs.tsx` | Client | Tab switcher |
| `components/docs/Accordion.tsx` | Client | Expandable section |
| `components/docs/ImageCaption.tsx` | Server | Image with caption |

## 7. Files to Modify

| File | Change |
|------|--------|
| `app/(docs)/layout.tsx` | Update import: `DocsNavbar` → `DocsTopNav` |
| `app/(docs)/docs/page.tsx` | Full rewrite — docs-focused landing |
| `app/(docs)/docs/[...slug]/page.tsx` | Full rewrite — three-column layout |
| `lib/docs/mdx.tsx` | Add new MDX components, update styling |
| `lib/docs/config.ts` | Additive only — no breaking changes |
| `globals.css` | Add docs-specific utility classes if needed |

## 8. Files to Remove/Deprecate

| File | Reason |
|------|--------|
| `components/docs/DocsNavbar.tsx` | Replaced by `DocsTopNav` |
| `components/docs/DocsNavItem.tsx` | Replaced by `MegaPanel` |
| `components/docs/DocsMegaMenu.tsx` | Replaced by `MegaPanel` |
| `components/docs/DocsRightSidebar.tsx` | Replaced by `LeftSidebar` |
| `components/docs/DocsLandingRightSidebar.tsx` | Landing page no longer has sidebar |
| `components/docs/DocsSearchTrigger.tsx` | Inline in `DocsTopNav` |

## 9. Design Tokens

All tokens already exist in `globals.css`. No new tokens needed.

| Token | Usage |
|-------|-------|
| `--color-night` (#082033) | Navbar bg, dark sections |
| `--color-paper` (#fffaf2) | Page background |
| `--color-violet` (#9474ff) | Primary accent, links, active states |
| `--color-teal` (#22bd93) | Success, green accents |
| `--color-orange` (#ff8a22) | Warning, orange accents |
| `--color-info` (#3b82f6) | Info callouts |
| `--color-danger` (#ff4f42) | Error callouts |
| `--font-anton` | Display headings |
| `--font-dm-sans` | Body text |
| `--font-jetbrains-mono` | Code blocks |

## 10. Accessibility

- Keyboard navigation for mega menu (arrow keys, Escape)
- Focus visible states on all interactive elements (existing `focus-visible:outline-violet`)
- ARIA labels on nav, search, mobile menu
- Semantic HTML: `<nav>`, `<aside>`, `<article>`, `<main>`
- Screen reader friendly: skip links, proper heading hierarchy
- `prefers-reduced-motion` respect for animations

## 11. SEO

- Generate metadata for each doc page (title, description, canonical URL)
- OpenGraph images per page (can use default OG image initially)
- Structured data (Article schema)
- Sitemap generation from `getAllDocSlugs()`

## 12. Performance

- Lazy load images below the fold
- Code split MDX components
- Skeleton loaders for search results
- Minimal bundle increase (new components are small)
- Keep existing `generateStaticParams()` for SSG

---

## Appendix: Existing Code to Preserve

These files/functions are **NOT modified** and form the foundation:

- `lib/docs/config.ts` — navigation config + utility functions
- `lib/docs/search.ts` — search index generation
- `content/docs/**` — all 82 MDX content files
- `public/search-index.json` — search index
- `components/theme-provider.tsx` — theme system
- `components/ui/button.tsx` — button component
- `components/Navbar.tsx` — marketing navbar (unchanged)
- `components/Footer.tsx` — footer (unchanged)
