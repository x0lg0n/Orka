## Objective
- Build a consistent, future-proof design system (violet-primary shadcn brand system via preset `b3HZiW6oVe`, with light/dark switcher), then adopt it on dashboard + auth. Marketing pages (home/docs/about/others) stay AS-IS per user; new marketing pages match existing style.

## Important Details
- Monorepo `C:\Siddhartha\ORKA\Orka`, branch `dev`, local commits not pushed (no-push-without-request).
- Frontend: Next.js 16.2.10 App Router, React 19, Tailwind v4 (CSS-first `@theme`), shadcn/ui (`radix-mira` style, baseColor neutral, cssVariables true), Supabase `@supabase/ssr`, `lucide-react`, pnpm only.
- `components.json` exists; `next-themes` ^0.4.6 installed; shadcn deps present (cva, clsx, tailwind-merge, tw-animate-css).
- **User design decisions (resolved):** (1) Violet = primary brand color (logo/landing) → `--primary: #9474ff` in light + dark. (2) Marketing pages stay AS-IS, no visual edits; new marketing pages match existing. (3) Dashboard + auth adopt shadcn brand system via preset `b3HZiW6oVe`. (4) Light + dark with a SWITCHER required (future). (5) Remove unused `orka-*` tokens (done).
- **Token state:** `orka-*` block REMOVED. `:root` = light, brand-aligned (`--background:#fffaf2`, `--foreground:#082033`, `--primary:#9474ff`, `--card:#fff`, `--border:rgba(8,32,51,0.10)`, `--ring:#9474ff`, brand charts, radius 0.75rem). `.dark` = shell/panel brand (`--background:#030914`, `--card:#0a1c2e`, `--primary:#9474ff`). `.dashboard-light` `--primary`/`--ring` → `#9474ff`. Font self-ref bug fixed (`--font-heading`/`--font-sans` → `var(--font-dm-sans)`). Brand utility colors (`--color-night/bone/lime/orange/coral/teal`) still defined.
- Preset `b3HZiW6oVe` applied: 14 `components/ui/*` updated (avatar, badge, button, card, dropdown-menu, input, label, progress, sonner, table, tabs, tooltip, dialog, sheet); skipped separator + lib/utils; `globals.css` rewritten; tooltip added → `TooltipProvider` now wrapped in root layout.
- **Theme switcher foundation (this segment):** `defaultTheme="dark"` + `enableSystem={false}` so existing hardcoded-dark pages (marketing `bg-night`, dashboard `bg-shell`) are unaffected by default; the toggle meaningfully drives theme-aware components (auth + any future semantic UI). `attribute="class"` toggles `.dark` on `<html>`; `suppressHydrationWarning` set.
- Dashboard dark mode is HARDCODED (`product-ui dark` in `components/shell/AppShell.tsx:19`, `app/workspaces/page.tsx:89`, `app/workspaces/new/page.tsx:22`); `.product-ui` (globals.css:351) only sets `--product-ease`. True light dashboard needs semantic-token migration (deferred/larger).
- `(auth)/layout.tsx` now theme-aware (was dark wrapper). Auth `login` is "coming soon" placeholder; `SignupForm.tsx` is the real form (email/password + Stellar Freighter wallet) — now theme-aware + system focus ring.
- Rule: never `pnpm build` while `pnpm dev` runs — kill dev, `rm -rf .next`, restart. (Dev was killed for build; currently NOT running.)
- `app/globals.css.bak` exists (backup before preset).
- Phase D portal needs `frontend/supabase/portal.sql` applied to Supabase for `/p/[token]` to resolve data.
- `pnpm lint` 0 errors, 4 pre-existing warnings (GlassPanel, _amount, AvatarImage, formatLastActive).
- Pre-existing untracked `app/(auth)/signin/` route; `invite` dir has no page.tsx.

## Work State
### Completed
- Phases A–F + page consolidation (commit `13bce7e`): `/w/[slug]` architecture, grouped sidebar, public portal, `(auth)`/`(marketing)` groups, top-level route moves.
- Navbar restoration + grouping (uncommitted): `app/(marketing)/layout.tsx` uses `<Navbar/>` in `bg-night` + `<Footer/>`; `components/Navbar.tsx` Link-based, 3 dropdown groups; `lib/content.ts` has productLinks/resourcesLinks/companyLinks.
- **Design-system token foundation:** backed up globals.css; applied preset `b3HZiW6oVe`; removed `orka-*`; brand-aligned `:root`/`.dark`/`.dashboard-light`; fixed font self-ref; `pnpm build` GREEN.
- **Light/dark switcher foundation:** `ThemeProvider` + `TooltipProvider` + `theme-toggle.tsx` + `(auth)/layout.tsx` theme-aware; `SignupForm.tsx`/`signup/page.tsx` theme-aware.
- **Dashboard semantic-token migration (this segment):** `components/shell/AppShell.tsx` is now a client component reading `useTheme()` and applying `dashboard-light` (light) or `dark` (dark) — so the switcher drives the whole app shell. `app/workspaces/page.tsx` + `app/workspaces/new/page.tsx` switched from hardcoded `product-ui dark` to `product-ui dashboard-light`. Remaining auth pages (`login`, `forgot-password`, `reset-password`, `verify-email`, `invite/[token]`, `signup`) migrated from hardcoded `text-night`/`bg-white`/`border-night/15`/`bg-hover` to semantic tokens (`text-foreground`/`bg-background`/`border-border`/`bg-muted`/`text-muted-foreground`); brand lime/orange button retained. Removed a duplicate `.dashboard-light` block in `globals.css`. Fixed a pre-existing type error in dead `components/dashboard/DashboardShell.tsx` (`aria-current={pathname}`) that blocked the build. `pnpm build` GREEN (all routes compile).

### Active
- Keep marketing pages AS-IS per user.

### Blocked
- `frontend/supabase/portal.sql` must be applied to the Supabase project (SQL editor or `supabase` CLI) before `/p/[token]` resolves data — CLI not installed locally; needs user action.

## Next Move
1. (Done) ThemeProvider + TooltipProvider + toggle; dashboard (AppShell + workspaces) + all auth pages theme-aware; `pnpm build` GREEN; dev smoke-tested (signup 200 + toggle present, workspaces redirects to /signup when unauth).
2. (Blocked) Apply `frontend/supabase/portal.sql` to Supabase so `/p/[token]` resolves (needs user action — CLI not installed).
3. Keep marketing pages AS-IS per user; new marketing pages match existing style.

## Relevant Files
- `frontend/components/theme-provider.tsx` — NEW; `next-themes` client wrapper.
- `frontend/components/theme-toggle.tsx` — NEW; sun/moon toggle (shadcn `Button` `variant="outline"` `size="icon"`).
- `frontend/app/layout.tsx` — `ThemeProvider` (attribute=class, defaultTheme=dark, enableSystem=false, disableTransitionOnChange) + `TooltipProvider` (delayDuration 200); `suppressHydrationWarning` on `<html>`.
- `frontend/app/globals.css` — token layer; `orka-*` removed; `:root`/`.dark`/`.dashboard-light` brand-aligned (violet #9474ff); `.product-ui` easing var at 351. Backup: `app/globals.css.bak`.
- `frontend/components/ui/*` — 14 updated by preset (button, card, input, label, tooltip, etc.); only consumed by shell so far.
- `frontend/app/(auth)/layout.tsx` — theme-aware (`bg-background`/`bg-card`/`text-*`, `ThemeToggle` top-right).
- `frontend/components/SignupForm.tsx` — theme-aware (`border-border`/`bg-background`/`text-foreground`, `focus:border-ring focus:ring-ring/20`, `bg-primary` mode-toggle; lime/teal accents kept, dark text on lime for contrast).
- `frontend/app/(auth)/signup/page.tsx` — `text-foreground/70`.
- `frontend/components/shell/AppShell.tsx:19` — hardcoded `product-ui dark bg-shell text-white` (needs semantic migration for light mode).
- `frontend/components/Navbar.tsx`, `frontend/lib/content.ts`, `frontend/app/(marketing)/layout.tsx` — marketing nav (AS-IS, no edits).
- `frontend/supabase/portal.sql` — must be applied to DB for `/p/[token]` data.
- `frontend/components.json` — shadcn config (radix-mira, neutral, cssVariables).
- `docs/superpowers/specs/2026-07-15-frontend-url-architecture-design.md` — prior approved route/IA design.
