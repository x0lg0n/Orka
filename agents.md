# AGENTS.md

Compact guidance for OpenCode sessions in the ORKA repo.

## Repo shape

- **pnpm monorepo** (no `pnpm-workspace.yaml` — each package is managed independently). Packages:
  - `frontend/` — Next.js 16 (App Router) app: landing page + dashboard UI, Supabase + Resend waitlist, Stellar/Soroban integration via `@orka/stellar-sdk`. Uses `frontend/pnpm-lock.yaml`.
  - `contracts/` — Soroban smart contracts (Rust). Tested via `cargo test` (snapshots under `test_snapshots/`).
  - `services/` — Rust / Axum backend (`services/src`).
  - `packages/stellar-sdk/` — TypeScript SDK (`vitest` tests under `src/`). Has its own `pnpm-lock.yaml`.
- **Root `README.md` is the project landing page** (rich, with badges + links). It is NOT empty. `ROADMAP.md` is the future build plan; when it conflicts with current code, trust the code.
- `ARCHITECTURE.md`, `docs/`, `packages/`, `contracts/`, and `services/` all contain real, current code — assume they're present.

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
