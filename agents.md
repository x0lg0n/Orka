# AGENTS.md

Compact guidance for OpenCode sessions in the ORKA repo.

## Repo shape

- **pnpm monorepo** (no `pnpm-workspace.yaml` — each package is managed independently). Packages:
  - `frontend/` — Next.js 16 (App Router) app: landing page + dashboard UI, Supabase + Resend waitlist, Stellar/Soroban integration via `@orka/stellar-sdk`. Uses `frontend/pnpm-lock.yaml`. Route architecture: `(app)/w/[slug]/...` is the authenticated workspace area (slug = `organizations.slug`, the URL source of truth), `p/[token]` is the public client portal, `(auth)`/`(marketing)` are public route groups, and `/workspaces` is the pre-auth chooser. Legacy `app/dashboard/**` was removed.
  - `contracts/` — Soroban smart contracts (Rust). Tested via `cargo test` (snapshots under `test_snapshots/`).
  - `services/` — Rust / Axum backend (`services/src`).
  - `packages/stellar-sdk/` — TypeScript SDK (`vitest` tests under `src/`). Has its own `pnpm-lock.yaml`.
- **Root `README.md` is the project landing page** (rich, with badges + links). It is NOT empty. `ROADMAP.md` is the future build plan; when it conflicts with current code, trust the code.
- `ARCHITECTURE.md`, `docs/`, `packages/`, `contracts/`, and `services/` all contain real, current code — assume they're present.

## Frontend routing architecture

- **`app/(app)/w/[slug]/...`** — authenticated workspace area. The `slug` param is the workspace identity (resolved via `getActiveOrgBySlug` in `lib/orka.ts`); never trust the internal UUID in URLs. `proxy.ts` keeps an `orka_active_org_slug` cookie in sync and redirects legacy `/dashboard/*` hits here.
- **`app/(app)/w/[slug]/**` detail/settings pages use `?tab=` query-param tabs** via the shared `components/shell/Tabs.tsx` (server component rendering a `Link` tab bar; the page renders panel content itself).
- **`app/p/[projectToken]/...`** — public, no-auth client portal. Data is resolved by a `shared_token` through the `get_portal_project` **SECURITY DEFINER** RPC (granted to `anon`); the schema lives in `frontend/supabase/portal.sql` and must be applied to the DB. `lib/portal.ts` wraps the call. Do **not** add a service-role read path for this.
- **Shared chrome** lives in `components/shell/` (`AppShell`, `Sidebar`, `WorkspaceSwitcher`, `PageHeader`, `MobileNav`, `Tabs`). `PageHeader` is re-exported from `components/dashboard/DashboardUI.tsx` for backward compatibility.
- **No `lib/routes.ts`** — route strings are inline template literals (`` `/w/${slug}/...` ``). Keep slug literals consistent if you add links.
- **Co-located components: use a `components/` folder next to the route `page.tsx`**, NOT `_components`. Import with a relative `./components/...` path (e.g. `app/(app)/w/[slug]/projects/page.tsx` → `./components/ProjectRow`). Already-followed examples: `clients/components/*`, `proposals/components/*`, `analytics/components/*`, `invoices/components/*`, `invoices/[invoiceId]/components/*`, `projects/[id]/components/*`, `workspaces/components/*`. Shared/root-level components (shell, ui, dashboard chrome) stay under `components/`. Only extract a separate component file when a route's `page.tsx` grows large (≈150+ lines) or the piece is reused; keep small pages (≤~100 lines) inline.
- **`app/auth/callback/route.ts` is an intentional exception** — it must stay at `app/auth/callback/` (its URL `/auth/callback` is hardcoded in the OAuth flows). Do NOT move it under the `(auth)` route group, or the OAuth redirect URL would change to `/callback`.

## Commands

- Root `Makefile` exposes: `make dev`, `make lint`, `make build`, `make setup`, plus `make supabase-note` / `make stellar-note`.
- `frontend/` (the main app):
  - `pnpm install` — install deps. **Use pnpm** (repo ships `pnpm-lock.yaml`; there is no committed `package-lock.json`).
  - `pnpm dev` — Next.js dev server at http://localhost:3000
  - `pnpm build` — production build (`pnpm start` to serve it)
  - `pnpm lint` — ESLint. There is **no separate `typecheck` script**; type errors surface during `pnpm build` (`tsc` via Next).
  - ⚠️ `frontend/` has **no test script yet** — tests are not wired into the frontend workflow.
- `contracts/`: `cargo test` (build wasm first: `cargo build -p orka-escrow --target wasm32v1-none --release`).
- `services/`: `cargo test` / `cargo clippy` / `cargo fmt --check`.
- `packages/stellar-sdk/`: `pnpm install` + `pnpm test` (vitest).

## Dependency / lockfile gotchas

- **Never run `npm install` at the repo root.** It created a spurious `package-lock.json` that made Next.js 16 mis-infer the workspace root and crash with `adapterFn is not a function`. Use `pnpm` everywhere.
- `.gitignore` ignores `node_modules/`, `.env*`, `target/`, build outputs, and `package-lock.json`.

## Waitlist / backend prerequisites

- The waitlist API (`app/api/waitlist/route.ts`) requires the `waitlist` table in Supabase. Create it by running `frontend/supabase/waitlist.sql` in the Supabase SQL editor first.
- Env: copy `frontend/.env.example` to `frontend/.env.local`. No env vars are needed for the static landing page itself, but the API route throws at runtime without Supabase/Resend values.

## Env var gotcha (non-standard names)

`lib/supabase.ts` reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-side, **no** `NEXT_PUBLIC_` prefix). The `.env.example` documents these names. Do not switch to `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` unless updating both the client and the example. Service-role key must never reach the browser.

## Conventions / quirks

- **Tailwind v4** (CSS-first, `postcss.config.mjs` + `@tailwindcss/postcss`). There is **no `tailwind.config.ts`** — theme lives in CSS.
- `next.config.mjs` sets `transpilePackages: ["@orka/stellar-sdk"]` and `turbopack.root` (the latter fixes the multi-lockfile `adapterFn` crash).
- `strict: true` TypeScript; `moduleResolution: "bundler"`.
- CI: `.github/workflows/ci.yml` runs frontend lint+build and contracts `cargo test`. (Do not modify without coordination.)
