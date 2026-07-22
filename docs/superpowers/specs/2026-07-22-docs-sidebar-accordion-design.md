# ORKA Docs — Expandable Sidebar Navigation

**Date:** 2026-07-22  
**Status:** Approved  
**Scope:** Documentation navigation enhancement only

## Goal

Upgrade the left documentation sidebar from a flat list to a professional accordion/tree navigation matching Stripe, Vercel, Supabase, and shadcn/ui documentation quality.

## Architecture

### Config-Driven Catch-All Route

**Approach:** Single config defines the full navigation tree with `children` arrays. A catch-all route resolves nested paths. Sidebar auto-generates from config.

**Trade-offs:**
- + Centralized config — add new pages in one place
- + Single route handler — no duplicated page components
- + Sidebar auto-generated from config — always in sync
- - All routes must follow the config structure

### Route Structure

Replace `[slug]/page.tsx` with `[...slug]/page.tsx` catch-all route.

**URL Resolution:**
- `/docs/projects` → `content/docs/projects.mdx` OR `content/docs/projects/overview.mdx`
- `/docs/projects/timeline` → `content/docs/projects/timeline.mdx`
- `/docs/projects` with children → renders `overview.mdx` as default child

**Content Structure:**
```
content/docs/
├── getting-started.mdx
├── getting-started/
│   ├── create-account.mdx
│   ├── create-workspace.mdx
│   ├── invite-members.mdx
│   └── connect-freighter.mdx
├── projects.mdx
├── projects/
│   ├── creating.mdx
│   ├── timeline.mdx
│   ├── files.mdx
│   ├── client-portal.mdx
│   └── settings.mdx
├── proposals.mdx
├── proposals/
│   ├── overview.mdx
│   ├── ai-generator.mdx
│   ├── edit.mdx
│   ├── send.mdx
│   ├── status.mdx
│   └── versions.mdx
├── contracts.mdx
├── contracts/
│   ├── overview.mdx
│   ├── generate.mdx
│   ├── template.mdx
│   ├── signatures.mdx
│   └── status.mdx
├── milestones.mdx
├── milestones/
│   ├── overview.mdx
│   ├── create.mdx
│   ├── edit.mdx
│   ├── approval.mdx
│   └── release-payment.mdx
├── escrow.mdx
├── escrow/
│   ├── overview.mdx
│   ├── fund.mdx
│   ├── release.mdx
│   ├── partial-release.mdx
│   ├── refund.mdx
│   └── security.mdx
├── payments.mdx
├── payments/
│   ├── overview.mdx
│   ├── transaction-history.mdx
│   ├── stellar.mdx
│   ├── currency-conversion.mdx
│   └── failed-payments.mdx
├── invoices.mdx
├── invoices/
│   ├── overview.mdx
│   ├── create.mdx
│   ├── status.mdx
│   ├── payment-tracking.mdx
│   └── export.mdx
├── clients.mdx
├── clients/
│   ├── overview.mdx
│   ├── portal.mdx
│   ├── invite.mdx
│   ├── shared-files.mdx
│   └── communication.mdx
├── freighter.mdx
├── freighter/
│   ├── overview.mdx
│   ├── install.mdx
│   ├── connect.mdx
│   ├── sign-transaction.mdx
│   └── troubleshooting.mdx
├── api.mdx
├── api/
│   ├── overview.mdx
│   ├── authentication.mdx
│   ├── endpoints.mdx
│   ├── sdk.mdx
│   ├── webhooks.mdx
│   └── examples.mdx
├── security.mdx
├── security/
│   ├── overview.mdx
│   ├── encryption.mdx
│   ├── wallet-security.mdx
│   ├── permissions.mdx
│   └── best-practices.mdx
├── faq.mdx
└── faq/
    ├── general.mdx
    ├── billing.mdx
    ├── escrow.mdx
    ├── payments.mdx
    └── wallet.mdx
```

## Config Interface

```typescript
export interface DocItem {
  title: string;
  slug: string;
  icon?: string;
  children?: DocItem[];
}

export interface DocSection {
  title: string;
  items: DocItem[];
}
```

**Example Config:**
```typescript
{
  title: "Projects",
  slug: "projects",
  icon: "folder",
  children: [
    { title: "Overview", slug: "overview" },
    { title: "Creating Projects", slug: "creating" },
    { title: "Timeline", slug: "timeline" },
    { title: "Files", slug: "files" },
    { title: "Client Portal", slug: "client-portal" },
    { title: "Settings", slug: "settings" },
  ]
}
```

## Sidebar Component Behavior

### Accordion/Tree Structure

- Each top-level item with `children` renders as a collapsible group
- Click toggles expand/collapse with smooth height animation
- Chevron rotates 90° when expanded
- Nested items render as indented list below parent

### Auto-Expansion

- On page load, sidebar reads `pathname` and auto-expands the matching parent category
- Example: visiting `/docs/projects/timeline` → "Projects" section auto-expands

### Active Item Styling

- Purple left border (3px)
- Purple background tint (`bg-violet/5`)
- Bold text in violet (`text-violet`)
- Matches ORKA dashboard sidebar style

### Expand Animation

- CSS `max-height` transition with `overflow-hidden`
- Duration: 200ms, ease-in-out
- Children fade in slightly
- No layout jump

### localStorage Persistence

- Expanded categories stored as `string[]` in `docs_sidebar_expanded`
- On mount, restore previous state
- On toggle, update localStorage

## Inline Search

- Search input at top of sidebar
- On type: filter items by title match
- Matching categories auto-expand
- Non-matching categories collapse and get `opacity-50`
- Clear button resets to full tree
- Debounced 150ms to avoid lag

## Mobile Drawer

- Trigger: hamburger icon in mobile header (existing in `MobileNav.tsx`)
- Slide-out panel from left, 280px width
- Backdrop overlay with `bg-night/40`
- Same accordion behavior as desktop
- Auto-close drawer on page navigation
- Animate in/out with `translate-x` transition (250ms)

## Keyboard Accessibility

- `Tab` through items
- `Enter`/`Space` toggles expand/collapse
- `Arrow Up/Down` moves focus between items
- `aria-expanded` on parent items
- `aria-controls` linking to child list
- Focus-visible ring on all interactive elements

## Files to Create/Modify

### New Files
- `frontend/components/docs/DocsSidebarAccordion.tsx` — accordion item component
- `frontend/components/docs/DocsSidebarSearch.tsx` — inline search component
- `frontend/components/docs/DocsMobileDrawer.tsx` — mobile drawer wrapper
- `frontend/app/(marketing)/docs/[...slug]/page.tsx` — catch-all route
- `frontend/content/docs/getting-started/*.mdx` — 4 nested content files
- `frontend/content/docs/projects/*.mdx` — 5 nested content files
- `frontend/content/docs/proposals/*.mdx` — 6 nested content files
- `frontend/content/docs/contracts/*.mdx` — 5 nested content files
- `frontend/content/docs/milestones/*.mdx` — 5 nested content files
- `frontend/content/docs/escrow/*.mdx` — 6 nested content files
- `frontend/content/docs/payments/*.mdx` — 5 nested content files
- `frontend/content/docs/invoices/*.mdx` — 5 nested content files
- `frontend/content/docs/clients/*.mdx` — 5 nested content files
- `frontend/content/docs/freighter/*.mdx` — 5 nested content files
- `frontend/content/docs/api/*.mdx` — 6 nested content files
- `frontend/content/docs/security/*.mdx` — 5 nested content files
- `frontend/content/docs/faq/*.mdx` — 5 nested content files

### Modified Files
- `frontend/lib/docs/config.ts` — add `children` to `DocItem`, update navigation config
- `frontend/components/docs/DocsSidebar.tsx` — complete rewrite with accordion, search, mobile
- `frontend/app/(marketing)/docs/layout.tsx` — add mobile drawer support
- `frontend/public/search-index.json` — regenerate with nested routes

### Deleted Files
- `frontend/app/(marketing)/docs/[slug]/page.tsx` — replaced by `[...slug]`

## Constraints

- Only modify documentation pages under `app/(marketing)/docs/`
- Do NOT modify authentication, dashboard, API routes, or database schema
- Preserve existing ORKA visual identity (colors, fonts, design tokens)
- Existing flat routes must still work (e.g., `/docs/projects` shows overview)

## Verification

1. `pnpm build` passes clean
2. `pnpm lint` passes with 0 new errors
3. `/docs` landing page renders correctly
4. `/docs/projects` shows overview (backward compatible)
5. `/docs/projects/timeline` shows nested page
6. Sidebar accordion expands/collapses smoothly
7. Auto-expansion works on nested routes
8. Inline search filters and highlights correctly
9. Mobile drawer opens/closes and preserves state
10. localStorage persistence works across refreshes
