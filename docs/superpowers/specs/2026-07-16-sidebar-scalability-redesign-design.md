# Sidebar Scalability & Redesign — Design

**Date:** 2026-07-16
**Status:** Approved (design)
**Approach:** C — Full design-system extraction (generic sidebar kit, adopted later)

## Context

The workspace dashboard currently has **two divergent sidebar systems**:

1. `components/shell/Sidebar.tsx` — grouped nav (Overview / Work / Finance / AI / Workspace),
   used by `AppShell`. Feature-complete (real workspace switching via `DropdownMenu`, grouped nav)
   but uses the old `bg-sidebar` brand and is not the live workspace route.
2. `components/dashboard/sidebar/*` — used by the **live** `app/(app)/w/[slug]/layout.tsx`.
   Already config-driven (`lib/dashboard/navigation.ts`) but **partially broken**:
   - `WorkspaceSwitcher` shows a fake dropdown with only the current workspace (no real switch).
   - `UserProfile` "Sign out" does nothing.
   - Nav `href`s point to legacy `/dashboard/*` routes that may not resolve under `w/[slug]`.
   - Flat (ungrouped) nav, hardcoded violet `#7c3aed`, no collapse.

The live route is cramped (large `h-12` rows, big `gap-6` group spacing, everything `font-extrabold`)
and the component structure does not scale well as features are added.

**Decisions (from brainstorming):**
- Goal: **scalability-focused**.
- Nav: **config-driven** (typed, grouped, role-aware).
- Sidebar: **collapsible rail** (icon-only ↔ expanded), state persisted.
- Visual: **redesigned sections** (grouped cards, clearer hierarchy) — not just spacing tweaks.
- Unify on the **dashboard sidebar** system; deprecate `shell/Sidebar` for the workspace route.
- Extract a **generic reusable sidebar kit** into `components/ui/sidebar`, adopted by workspace now,
  other areas later (no forced migration).
- **Default collapse state = collapsed** (`w-[72px]`), overridable via `localStorage`.

## Architecture & Components

### Generic kit — `components/ui/sidebar/`
Reusable, theme-aware (uses existing `bg-sidebar`, `bg-hover`, `text-primary`, ORKA tokens).

- **`Sidebar.tsx`** — composition root. Props: `collapsed: boolean`, `onToggleCollapse: () => void`,
  `children`. Renders `<aside>` (sticky, full-height, width transitions between `w-[280px]` and `w-[72px]`).
- **`SidebarHeader.tsx`** — logo + wordmark; collapses to logo-only.
- **`NavSection.tsx`** — labeled group: `title?` + `items: NavLinkConfig[]`. Renders group heading
  (hidden when collapsed) and maps `NavLink`s.
- **`NavLink.tsx`** — single item: `href`, `icon`, `label`, `badge?`, computes `active` via `usePathname`.
  Collapsed → icon-only with `title` tooltip.
- **`SidebarFooter.tsx`** — slot for user/profile block.
- **`CollapseToggle.tsx`** — rail toggle button; `aria-expanded`, `aria-label`.

### Config — `lib/navigation/workspace-nav.ts`
Typed, **grouped** config (replaces flat `lib/dashboard/navigation.ts`):

```ts
import type { LucideIcon } from "lucide-react";

export type NavLinkConfig = {
  title: string;
  /** Path relative to the workspace, e.g. "dashboard", "projects" */
  path: string;
  icon: LucideIcon;
  badge?: string;
  requiredRole?: string;
};

export type NavGroupConfig = {
  id: string;
  label: string;
  items: NavLinkConfig[];
};

export const workspaceNav: NavGroupConfig[] = [
  { id: "overview", label: "Overview", items: [{ title: "Dashboard", path: "dashboard", icon: Home }] },
  { id: "work", label: "Work", items: [
    { title: "Projects", path: "projects", icon: FolderKanban },
    { title: "Proposals", path: "proposals", icon: FileText },
    { title: "Clients", path: "clients", icon: Users },
  ]},
  { id: "finance", label: "Finance", items: [
    { title: "Payments", path: "payments", icon: CreditCard },
    { title: "Invoices", path: "invoices", icon: ReceiptText },
    { title: "Analytics", path: "analytics", icon: LayoutDashboard },
  ]},
  { id: "ai", label: "AI", items: [{ title: "AI Copilot", path: "ai", icon: Sparkles, badge: "Beta" }] },
  { id: "workspace", label: "Workspace", items: [{ title: "Settings", path: "settings", icon: Settings, requiredRole: "owner" }] },
];
```

Hrefs are built at render time by prefixing the active slug: `` `/w/${slug}/${item.path}` ``.
This keeps config slug-agnostic and reusable.

### Feature-specific — `components/dashboard/sidebar/`
- **`WorkspaceSidebar.tsx`** — composes the generic kit + workspace children
  (`WorkspaceSwitcher`, `NavSection`s from config, `UpgradeCard`, `UserProfile`).
- **`WorkspaceSwitcher.tsx`** — **real** switcher using `orgs: {slug,name}[]` + `useRouter`
  (logic borrowed from `shell/WorkspaceSwitcher`: slug-swap via `router.push`).
- **`UpgradeCard.tsx`** — redesigned, tokenized (no hardcoded hex).
- **`UserProfile.tsx`** — wired to existing `SignOutButton` / sign-out handler.

## Behavior & Data Flow

- **Collapse:** `useSidebarCollapse()` hook backed by `localStorage` (`orka:sidebar-collapsed`).
  Default **collapsed**. Width animates via `transition-[width]`. Collapsed hides labels/cards,
  shows icon-only NavLinks (tooltip via `title`), WorkspaceSwitcher shows initial tile only,
  UpgradeCard/UserProfile collapse to icon/avatar only. Toggle hidden on mobile (sheet-based nav).
- **Data flow:** `w/[slug]/layout.tsx` already fetches `orgs` (`listOrgsForUser`) + `activeOrg`.
  Pass `orgs` + `currentSlug` into `WorkspaceSidebar`. Nav hrefs prefixed with active slug at render.
  `role` from `activeOrg.role` feeds `requiredRole` filtering.
- **Active state:** `usePathname` exact + prefix match (preserved from current `NavItem`).

## Bug Fixes (in scope)

1. `WorkspaceSwitcher` — replace fake dropdown with real `orgs` list + `router.push` slug-swap.
2. `UserProfile` — wire "Sign out" to existing `SignOutButton`.
3. Nav hrefs — repoint config from legacy `/dashboard/*` to `/w/[slug]/*` (slug-prefixed).
4. Active-state highlighting preserved.

## Visual Redesign

- Tokens only (reuse `bg-sidebar`, `bg-hover`, `text-primary`, `--color-violet #9474ff`, lime accent).
  No new hardcoded hex → `dashboard-light` theme keeps working.
- **Expanded:** header (logo + wordmark + collapse chevron); WorkspaceSwitcher tile;
  **nav groups as subtle `rounded-xl bg-white/[0.03]` cards** with small uppercase label,
  separated by `gap-3`; NavLink `h-10` row, `gap-3`, `text-sm`; active = `bg-primary/20 text-white`
  + left accent bar (`border-l-2 border-primary`) + tinted icon; badge pill.
- **Collapsed (rail):** `w-[72px]`; icons only; group cards become icon stacks with thin dividers;
  NavLink icon centered + `title` tooltip; workspace tile = initial; upgrade/user to icon/avatar.
- **Accessibility:** collapse toggle `aria-expanded`/`aria-label`; NavLinks `aria-current="page"`;
  dropdown menus keyboard-navigable (reuse shadcn `DropdownMenu`).

## Deprecation

- `shell/Sidebar.tsx` + `MobileNav` remain for `AppShell` (non-workspace areas) but the workspace
  route stops using them. Later migration can adopt the kit — out of scope now.
- `lib/dashboard/navigation.ts` replaced by `lib/navigation/workspace-nav.ts`.

## Testing / Verification

- `pnpm lint` in `frontend/` passes.
- `pnpm build` (Next.js) succeeds — surfaces type errors.
- Manual: workspace route renders unified sidebar; collapse toggle persists across routes/reload;
  workspace switch navigates and keeps current sub-path; sign-out works; active link highlights;
  `dashboard-light` theme renders correctly.

## Out of Scope

- Command palette (Cmd+K) — noted as future.
- Forced migration of `shell/Sidebar` / portal nav to the kit.
- New nav destinations beyond current items.
