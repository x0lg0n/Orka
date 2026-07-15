# Shell Rebuild on shadcn/ui — Design

Date: 2026-07-14

## Context

The `frontend/` recently migrated to Tailwind v4 + shadcn/ui. The marketing
landing page was verified to already match production (`orkahq.vercel.app`) in
both structure and brand palette (byte-identical hex values; brand utilities
generate in both dev and prod builds). No landing-page color changes are needed.

The authenticated **shell** (sidebar + mobile nav + workspace switcher + search)
was only partially migrated: it still uses hand-rolled markup and a custom
`btn btn-primary` class that no longer has any styles after the "remove
deprecated raw CSS" commit. The user approved rebuilding the **whole shell** on
shadcn primitives while preserving the existing dark product look
(shell `#030914`, sidebar `#06101f`, panel `#0a1c2e`, violet primary `#9474ff`).

The shell renders inside `AppShell` which applies `product-ui dark`, so shadcn
primitives (`bg-popover`, `bg-primary`, `focus:bg-accent`, etc.) resolve to dark
tones automatically. We only override where we want an exact token match.

## Scope

In scope:
- `components/shell/WorkspaceSwitcher.tsx` → shadcn `DropdownMenu`
- `components/shell/Sidebar.tsx` → shadcn `Button` for nav links + Upgrade CTA; token fix for user card
- `components/shell/MobileNav.tsx` → shadcn `Sheet` drawer
- `components/shell/SearchField.tsx` → already shadcn `Input`; keep (verify dark styling)

Out of scope:
- `AppShell`, `PageHeader`, `DashboardNav`, `DashboardTopBar` (not flagged; left as-is)
- Landing page colors (verified correct)
- Any backend / workspace-switching route logic

## Components

### WorkspaceSwitcher
- Props unchanged: `{ orgs: {id,name}[]; currentOrgId?: string }`.
- Trigger: shadcn `Button` (`variant="ghost"`) styled `rounded-[10px] border border-border bg-hover p-3`, containing `Avatar` (initial) + org name + `{orgs.length} workspace(s)` + `ChevronDown`.
- Content: `DropdownMenuContent` overridden to `bg-sidebar border-border text-white`.
  - `DropdownMenuLabel` "Workspaces"
  - One `DropdownMenuItem` per org; current org shows a check and `bg-hover`.
  - `DropdownMenuSeparator`
  - `DropdownMenuItem` "Manage workspaces" rendered as a Next `Link` (`asChild`) to `/onboarding`.
- Preserves current behavior: the only navigation action is "Manage workspaces".

### Sidebar
- Nav links: replace raw `<Link className=...>` with `<Button asChild variant="ghost">` carrying the existing active styling (`bg-primary/20 text-white` when active, `text-white/90 hover:bg-hover` otherwise) and geometry (`h-12 w-full justify-start gap-5 rounded-[10px] px-4 text-[15px] font-extrabold`).
- Upgrade CTA: replace unstyled `btn btn-primary` with shadcn `<Button className="mt-5 h-12 w-full text-sm font-extrabold">Upgrade Now</Button>` (default violet variant).
- User card: replace `bg-white/[0.045]` with `bg-hover` token.
- Keep `Avatar`, logo, "Upgrade to Pro" box, and all icons/tokens unchanged.

### MobileNav
- Replace the hand-rolled fixed overlay with shadcn `Sheet` (`side="left"`).
- `SheetTrigger`: existing `Button variant="ghost" size="icon"` with `Menu` icon.
- `SheetContent` overridden to `bg-sidebar` so it matches the dark sidebar; contains `<Sidebar {...props} />`.
- Drop the manual `X` button (Sheet provides its own close) and the manual overlay/animation.

### SearchField
- Already uses shadcn `Input`. No structural change; verify it reads well on the dark shell (it does via the `dark` class on `AppShell`).

## Verification
- `pnpm build` passes (type-check + lint via Next).
- `pnpm dev` (clean `rm -rf .next`): visually confirm dashboard shell — sidebar nav, workspace switcher dropdown, mobile drawer, search field — render with the dark product look and no unstyled `btn` artifacts.
- Confirm landing page still matches production.

## Risks
- Tailwind utility ordering for overridden `bg-sidebar` over shadcn's `bg-popover` — mitigated by verifying in the build; `sidebar` sorts after `popover` so the override wins.
- `Sheet`/`Sidebar` height: `Sidebar` uses `h-screen`; inside the fixed `SheetContent` (`h-full`) this is equivalent. Acceptable.
