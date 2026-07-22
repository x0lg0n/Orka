# ORKA Docs: Dedicated Navbar Design

**Date:** 2026-07-22
**Status:** Approved
**Scope:** Documentation layout redesign — remove left sidebar, add dedicated top navbar with mega menus

---

## Goal

Redesign the ORKA documentation layout so the left sidebar is removed completely and all documentation categories move into a dedicated docs navbar at the top. Similar to Supabase Docs navigation, but using ORKA branding, colors, typography, and spacing.

---

## Architecture

### Route Group Migration

**Current:**
```
app/(marketing)/
├── layout.tsx              ← Navbar + Footer (shared)
├── docs/
│   ├── layout.tsx          ← Left sidebar + content wrapper
│   ├── page.tsx            ← Landing page
│   └── [...slug]/page.tsx  ← Doc pages
```

**New:**
```
app/(docs)/
├── layout.tsx              ← DocsNavbar + Footer (independent)
├── docs/
│   ├── layout.tsx          ← Content wrapper (no sidebar)
│   ├── page.tsx            ← Landing page (full width, no right sidebar)
│   └── [...slug]/page.tsx  ← Doc pages (2-column: content + right sidebar)

app/(marketing)/
├── layout.tsx              ← Unchanged — Navbar + Footer for non-docs routes
├── ...                     ← All other routes unchanged
```

- `(docs)` route group is invisible in URLs — `/docs/...` stays identical
- `app/(marketing)/docs/` is deleted (moved to `app/(docs)/docs/`)
- Marketing layout is untouched — no docs logic leaks in

---

## Components

### 1. DocsNavbar (Client)

Sticky top navbar, `h-[72px]`, full width, dark background (`#071426`), subtle bottom border (`border-white/10`).

**Layout:**
```
ORKA logo │ Getting Started ▼ │ Workspaces ▼ │ Projects ▼ │ ... │ Search
```

- Left: ORKA logo (links to `/docs`)
- Center: Nav items (14 categories from `config.ts`), each with `▼` indicator
- Right: Search trigger button + GitHub icon (optional)

**Behavior:**
- Desktop: hover on item → mega menu opens
- Mobile (`< 1024px`): items collapse into hamburger → slide-over drawer
- Active item highlighted with purple (`text-violet`) background pill
- Scroll: navbar stays fixed, content scrolls under it

### 2. DocsMegaMenu (Client)

Hover/click dropdown for each category.

**Data source:** `docsNavigation` from `config.ts` with new `description` field on each category.

**Example (Projects category):**
```
┌─────────────────────────────────────────────────────┐
│ Projects                                            │
│ Learn how to manage client work, milestones,        │
│ files, and payments.                                │
│                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│ │ Overview    │ │ Creating    │ │ Timeline    │   │
│ │             │ │ Projects    │ │             │   │
│ ├─────────────┤ ├─────────────┤ ├─────────────┤   │
│ │ Files       │ │ Client      │ │ Payments    │   │
│ │             │ │ Portal      │ │             │   │
│ ├─────────────┤ ├─────────────┤ ├─────────────┤   │
│ │ Milestones  │ │ Project     │ │             │   │
│ │             │ │ Settings    │ │             │   │
│ └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Visual style:**
- Rounded corners: `16px`
- Soft shadow: `shadow-xl`
- Backdrop blur: `backdrop-blur-xl`
- Background: `bg-white` with `border border-night/10`
- Max width: `640px` (adjusts per category count)
- Padding: `24px`

**Item style:**
- Each item: link with title + description
- Active item: `bg-violet/10 text-violet` with `rounded-xl`
- Hover: `bg-night/5`
- Transition: `150ms ease`

**Animation:**
- Fade in + slide down: `opacity-0 translate-y-1` → `opacity-100 translate-y-0`
- Duration: `150ms`
- Closing: `150ms` fade out after cursor leaves area (with 150ms grace period)

**Active state:**
- If current route matches a child item → that item gets purple highlight
- Parent nav item in navbar also highlighted

### 3. DocsNavItem (Client)

Individual nav item in the navbar.

- Text: `text-sm font-medium text-white/80`
- Hover: `text-white`
- Active: `text-violet bg-violet/10 rounded-full px-3 py-1.5`
- Indicator: `▼` chevron, rotates on open

### 4. DocsSearchTrigger (Client)

Styled button that opens the existing `SearchModal`.

**Appearance:**
```
Search documentation…                   ⌘K
```

**Style:**
- Width: `~320px`
- Rounded: `full` (pill shape)
- Background: `bg-white/10` (dark translucent)
- Border: `border border-white/10`
- Text: `text-white/50` (placeholder)
- Shortcut badge: `⌘K` in a small rounded pill
- Hover: `bg-white/15`
- Transition: `150ms`

**Behavior:**
- Click → opens existing `SearchModal` (no rewrite)
- `⌘K` keyboard shortcut still works (existing logic)
- Mobile: collapses into a search icon that opens the same modal

### 5. DocsLayout (Server)

Parent layout for `(docs)` route group. Renders:
- `DocsNavbar`
- `<main>` with `{children}`
- `Footer`

### 6. DocsRightSidebar (Client)

Wrapper component that composes the existing `DocsToc` component with additional cards. Used on doc pages (`[...slug]`) only.

**Structure:**
```
DocsRightSidebar
├── DocsToc (existing — heading tracking, active state)
├── What's New card
├── Need Help? card
├── Popular Guides card
└── Feedback card
```

**Style:**
- Width: `320px` fixed
- Sticky: `top: 96px` (72px navbar + 24px spacing)
- Cards: `16px` radius, white bg, subtle border, `20-24px` padding

**Note:** The existing `DocsLandingRightSidebar` is kept unchanged for the landing page (`/docs`). It shows similar cards but without heading tracking.

### 7. DocsBreadcrumbs (Server)

Breadcrumb navigation above the page title on doc pages.

**Example:**
```
Home / Projects / Timeline
```

**Style:**
- Font size: `text-sm` (14px)
- Color: `text-night/50` (muted)
- Separator: `/` with `mx-2`
- Hover: `text-night/80` with underline
- Links use `getSectionForDoc()` from config to resolve parent names

**Behavior:**
- First item: "Home" → links to `/docs`
- Middle items: section names → link to parent doc
- Last item: current page title (not a link)
- Hidden on landing page (`/docs`)

---

## Layout

### Doc pages (`[...slug]`)

```
┌──────────────────────────────────────────────────────────────┐
│ Breadcrumbs: Home / Projects / Overview                      │
│                                                              │
│ ┌─────────────────────────────────┐ ┌──────────────────────┐ │
│ │                                 │ │ On this page         │ │
│ │    Main content                 │ │ - Section 1          │ │
│ │    max-width: 920px             │ │ - Section 2          │ │
│ │    minmax(0, 1fr)               │ │                      │ │
│ │                                 │ │ What's New           │ │
│ │                                 │ │ Need Help?           │ │
│ │                                 │ │ Popular Guides       │ │
│ │                                 │ │ Feedback             │ │
│ └─────────────────────────────────┘ └──────────────────────┘ │
│                                                              │
│ Prev / Next navigation                                       │
└──────────────────────────────────────────────────────────────┘
```

**CSS Grid:**
```css
grid-template-columns: minmax(0, 1fr) 320px;
gap: 48px;
```

**Content area:**
- Max width: `920px` for readability
- Centered within the grid cell
- Breadcrumbs above title

### Landing page (`/docs`)
- Full width (no right sidebar)
- Hero + search + category grid + features

### Responsive (`< 1024px`)
- Single column (right sidebar moves below content)
- Breadcrumbs still show

---

## Mobile Behavior

**Breakpoint:** `< 1024px`

**Hamburger button:**
- Replaces nav items in navbar
- Icon: `Menu` from lucide-react
- Position: left side, after ORKA logo
- Styled: `text-white/70 hover:text-white`

**Slide-over drawer:**
- Width: `300px` from left
- Background: `bg-white`
- Shadow: `shadow-xl`
- Backdrop: `bg-night/40` overlay
- Close: X button + clicking backdrop + selecting a page

**Drawer content:**
```
┌──────────────────────────┐
│ ✕ Documentation          │
├──────────────────────────┤
│ 🔍 Search docs...        │
├──────────────────────────┤
│ Getting Started      ▼   │
│   Overview                │
│   Create Account          │
├──────────────────────────┤
│ Workspaces           ▼   │
│   Overview                │
│   Create Workspace        │
├──────────────────────────┤
│ Projects             ▼   │
│   Overview                │
│   Creating Projects       │
│   Timeline                │
│   Files                   │
├──────────────────────────┤
│ ...                       │
└──────────────────────────┘
```

**Accordion behavior:**
- Categories are accordion sections
- Click to expand/collapse
- Current section auto-expanded based on URL
- Sub-pages nested inside
- Clicking a sub-page navigates and closes drawer

**Animation:**
- Drawer slides in: `-translate-x-full` → `translate-x-0`
- Duration: `200ms`
- Backdrop fades in: `opacity-0` → `opacity-100`

---

## Config Changes

### DocItem interface update

```typescript
interface DocItem {
  title: string;
  slug: string;
  icon?: React.ComponentType<{ size?: number }>;
  children?: DocItem[];
  description?: string;  // NEW — for mega menu
}
```

---

## Files

### Create (7 components)

| File | Type | Purpose |
|---|---|---|
| `components/docs/DocsNavbar.tsx` | Client | Sticky top navbar |
| `components/docs/DocsMegaMenu.tsx` | Client | Hover/click dropdown |
| `components/docs/DocsNavItem.tsx` | Client | Individual nav item |
| `components/docs/DocsSearchTrigger.tsx` | Client | Search button → opens SearchModal |
| `components/docs/DocsRightSidebar.tsx` | Client | Wrapper composing DocsToc + cards for doc pages |
| `components/docs/DocsBreadcrumbs.tsx` | Server | Replaces existing `Breadcrumbs.tsx` with updated styling |
| `app/(docs)/layout.tsx` | Server | Parent layout: DocsNavbar + Footer |

### Delete (old sidebar)

| File | Reason |
|---|---|
| `components/docs/DocsSidebar.tsx` | Replaced by navbar |
| `components/docs/DocsSidebarAccordion.tsx` | Replaced by mega menu |
| `components/docs/DocsSidebarSearch.tsx` | Replaced by navbar search |
| `components/docs/DocsMobileDrawer.tsx` | Replaced by new mobile drawer |
| `components/docs/Breadcrumbs.tsx` | Replaced by `DocsBreadcrumbs.tsx` |

### Move

| From | To |
|---|---|
| `app/(marketing)/docs/` | `app/(docs)/docs/` |

### Modify

| File | Change |
|---|---|
| `lib/docs/config.ts` | Add `description` field to `DocItem` |
| `app/(docs)/docs/[...slug]/page.tsx` | Update imports, add breadcrumbs |
| `app/(docs)/docs/page.tsx` | Full width landing (no right sidebar) |

### Keep unchanged

- All MDX content files (`content/docs/`)
- `lib/docs/mdx.tsx`
- `lib/docs/search.ts`
- `components/docs/SearchModal.tsx`
- `components/docs/DocsToc.tsx`
- `components/docs/DocsLandingRightSidebar.tsx`
- `components/docs/PrevNextNav.tsx`
- `components/docs/RelatedArticles.tsx`
- `components/docs/Feedback.tsx`
- `components/docs/Callout.tsx`

---

## UX Summary

- No left sidebar
- Dedicated docs navbar only
- Hoverable mega menus with nested sub-pages and descriptions
- Much wider reading area (920px max)
- Sticky right sidebar with TOC
- Smooth premium interactions (150ms animations)
- ORKA branding preserved throughout
- Mobile: hamburger → slide-over drawer with accordion
