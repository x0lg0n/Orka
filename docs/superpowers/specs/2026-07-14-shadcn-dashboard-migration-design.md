# ORKA Frontend Structure Fix — shadcn + Tailwind v4 (Dashboard Only)

- **Date:** 2026-07-14
- **Status:** Approved (design)
- **Author:** brainstorming session with user

## 1. Goal

Fix the frontend structure by adopting **shadcn/ui** for the authenticated
product UI, on top of a **Tailwind CSS v4** upgrade. The **marketing/landing
page is preserved exactly as-is**; only the dashboard and its primitives move
to shadcn.

This aligns the codebase with a maintainable, accessible component layer
(Radix primitives, `cn()` util, CSS-variable theming) while keeping ORKA's
brand identity (violet primary, dark shell, DM Sans).

## 2. Decisions (locked)

| # | Decision | Value |
|---|----------|-------|
| D1 | Tailwind version | **Upgrade v3 → v4** + `shadcn@latest` (native v4 support) |
| D2 | Scope | **Landing/marketing untouched**; dashboard + `components/ui`, `components/shell` on shadcn |
| D3 | Preset base | `b2JdfX4DNg` (theme: **violet**, iconLibrary: **lucide**, baseColor: neutral, style: mira, chartColor: orange) |
| D4 | Heading font | **DM Sans** (on-spec with `DESIGN.md`) |
| D5 | Body font | **DM Sans** (preset `font: dm-sans`) |
| D6 | Mono usage | **JetBrains Mono reserved for financial figures only** (escrow amounts, milestone balances, tx IDs, percentages in tables) — NOT for section headings |
| D7 | Preset application | `--only theme,font` — seeds shadcn CSS variables + fonts **without overwriting/installing UI component files** (protects landing) |
| D8 | ORKA custom colors | **Namespaced** in v4 (e.g. `--color-orka-bg`) so they don't collide with shadcn's semantic tokens (`--background`, `--foreground`, …) and the landing page keeps working |

## 3. Approach

### 3.1 Tailwind v3 → v4 migration (do this FIRST)
- Bump `tailwindcss` to `^4`, add `@tailwindcss/postcss`, remove `autoprefixer`.
- `postcss.config.mjs`: switch to `@tailwindcss/postcss` plugin.
- Convert `tailwind.config.ts` `theme.extend` tokens → a v4 `@theme` block in
  `globals.css`. Keep ORKA's custom colors but **rename** them to avoid
  collisions with shadcn semantic names:
  - `background` → `orka-bg`, `ink` → `orka-ink`, `night` → `orka-night`,
    `paper` → `orka-paper`, `bone` → `orka-bone`, `orange` → `orka-orange`,
    `coral` → `orka-coral`, `violet` → `orka-violet`, `lime` → `orka-lime`,
    `teal` → `orka-teal`, plus the semantic aliases (`shell`, `sidebar`,
    `panel`, `primary`, `success`, `warning`, `danger`, `info`, `border`,
    `muted`, `surface`, `text`, …) → `orka-*` prefixed.
  - shadcn owns: `--background`, `--foreground`, `--card`, `--primary`,
    `--muted`, `--border`, `--radius`, etc.
- Replace `@tailwind base/components/utilities` with v4 `@import "tailwindcss"`
  + `@import "tw-animate-css"` and `@custom-variant dark`.

### 3.2 shadcn init
- `pnpm dlx shadcn@latest init` (detects Next.js 16 + Tailwind v4).
- Creates `components.json`, adds `@/components` + `@/lib` path aliases to
  `tsconfig.json`, installs peer deps: `class-variance-authority`, `clsx`,
  `tailwind-merge`, `tw-animate-css`, `lucide-react`, and Radix primitives.
- Base: `radix`.

### 3.3 Apply preset (theme + font only)
- `pnpm dlx shadcn@latest apply b2JdfX4DNg --only theme,font`
  - Seeds violet `--primary`, DM Sans heading/body, lucide into shadcn CSS
    variables.
  - Does **not** reinstall/overwrite UI component files → landing CSS safe.
- Wire `fontHeading` (DM Sans) through the existing `next/font`
  `var(--font-dm-sans)`; add JetBrains Mono as a second `next/font` for the
  `.tabular` / `font-mono` number utility.

### 3.4 Dashboard component set (added via `shadcn add`)
`button, card, input, label, badge, avatar, progress, table, dropdown-menu,
dialog, tabs, separator, sheet, tooltip, sonner`

Covers what `components/ui/{Button,Card,Input,Avatar,StatusPill}.tsx` and
`ProductPrimitives` already do, plus what `components/shell/*` needs (Sheet =
mobile nav, DropdownMenu = workspace switcher, Dialog = modals).

### 3.5 Primitive reconciliation
- **Replace** `components/ui/{Button,Card,Input,Avatar,StatusPill}.tsx` with
  shadcn equivalents. `StatusPill` → `badge` styled with ORKA semantic colors
  (`status-success`/`warning`/`danger`/`info` → shadcn badge variants).
- **Refactor** `ProductPrimitives.tsx`:
  - `ProgressBar` → shadcn `progress` + ORKA tone classes.
  - `DataTable` → shadcn `table`.
  - `Timeline` / `IconBadge` / `SummaryRow` → keep, rebuilt on shadcn tokens.
- **Migrate** `components/shell/*` (Sidebar, AppShell, PageHeader, MobileNav,
  WorkspaceSwitcher, SearchField) to the new primitives.
- **Delete** now-redundant hardcoded CSS: `.btn*`, `.card`, `.panel`,
  `.input-field`, `.status-*`, `.product-*` from `globals.css`. **Keep**
  landing-only classes (`.display`, `.section-label`, `.cut-corner`, `.noise`,
  `.float-*`, `.speech`, `.sticker`, dropdown/mobile-menu animations,
  navbar animations).

### 3.6 Mono-for-numbers utility
- Add `.tabular` (or `font-mono` + `tabular-nums`) class for financial figure
  columns in dashboard tables/cards. Apply to escrow amounts, milestone
  balances, percentages, tx hashes.

## 4. File-by-file plan (atomic commits)

1. `frontend/package.json`, `frontend/postcss.config.mjs` — Tailwind v4 deps.
2. `frontend/tailwind.config.ts` → removed/merged into `@theme` in globals.css.
3. `frontend/globals.css` — v4 `@theme` (namespaced ORKA colors) + shadcn
   variable block (from `apply --only theme,font`) + keep landing classes.
4. `frontend/tsconfig.json` — `@/components`, `@/lib` aliases.
5. `frontend/components.json` — shadcn config (created by init).
6. `frontend/lib/utils.ts` — `cn()` helper (created by init).
7. `frontend/components/ui/*` — shadcn components replacing custom primitives.
8. `frontend/components/shell/*` — migrated to shadcn primitives.
9. Remove hardcoded `.btn*`/`.product-*` CSS.

Each step is its own commit so the checkpoint commit (`e5af6ec`) stays clean
and any step is revertible.

## 5. Verification

- `pnpm build` (type errors surface in Next build) — must pass.
- `pnpm lint` — must pass.
- Dev server (`pnpm dev`, `localhost:3000`):
  - **Landing page visually identical** to before (regression check).
  - Dashboard renders with shadcn + ORKA violet theme; headings in DM Sans;
    financial figures in JetBrains Mono.
- Manual: navigate dashboard → projects → milestones → payments; check mobile
  nav (Sheet), workspace switcher (DropdownMenu), modals (Dialog).

## 6. Out of scope (this pass)

- Marketing/landing page restyle.
- Contract (`contracts/`), service (`services/`), SDK (`packages/`) changes.
- New product features.
- Promoting the design system to a shared `@orka/ui` package (separate future
  work, discussed for production separation).

## 7. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| `apply` clobbers landing CSS | Use `--only theme,font`; never full `apply`. Landing custom classes retained. |
| v4 token name collision (`background`) breaks landing | Namespace ORKA colors as `orka-*`; shadcn owns semantic tokens. |
| Full `shadcn init` overwrites globals.css | Review the generated diff before committing; preserve landing classes. |
| Mono headings leak into section titles | Mono only via explicit `.tabular`/`font-mono` on number cells; headings stay DM Sans. |
