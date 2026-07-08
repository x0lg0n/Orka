# AGENTS.md

Compact guidance for OpenCode sessions in the ORKA repo.

## Repo shape

- **Root `README.md` is intentionally empty.** The real product/architecture source of truth is `ROADMAP.md` (canonical). The landing page is documented in `frontend/README.md`. Do not treat the empty root README as current.
- Single deployable app today: `frontend/` — a Next.js 16 (App Router) landing page with a Supabase + Resend waitlist. The contracts/ (`Soroban`), services/ (`Rust`/`Axum`), and packages/ dirs described in `ROADMAP.md` do **not** exist yet (Phase 1+). Don't assume they're present.
- `ROADMAP.md` is a future build plan, not a description of current code. When it conflicts with what's in `frontend/`, trust `frontend/`.

## Commands

Run everything from `frontend/` (the only package with a `package.json`).

- `pnpm install` — install deps. **Use pnpm** (repo ships `pnpm-lock.yaml`; there is no `package-lock.json`).
- `pnpm dev` — Next.js dev server at http://localhost:3000
- `pnpm build` — production build (`pnpm start` to serve it)
- `pnpm lint` — ESLint. There is **no separate `typecheck` script**; type errors surface during `pnpm build` (`tsc` via Next). Don't run a standalone `pnpm typecheck`.

## Waitlist / backend prerequisites

- The waitlist API (`app/api/waitlist/route.ts`) requires the `waitlist` table in Supabase. Create it by running `frontend/supabase/waitlist.sql` in the Supabase SQL editor first.
- Env: copy `frontend/.env.example` to `frontend/.env.local`. No env vars are needed for the static landing page itself, but the API route throws at runtime without Supabase/Resend values.

## Env var gotcha (non-standard names)

`lib/supabase.ts` reads `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-side, **no** `NEXT_PUBLIC_` prefix). The `.env.example` documents these names. Do not switch to `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` unless updating both the client and the example. Service-role key must never reach the browser.

## Conventions / quirks

- Tailwind v3 (not v4) — see `tailwind.config.ts` and `postcss.config.mjs`.
- `next.config.mjs` is empty (`{}`); no custom config.
- `strict: true` TypeScript; `moduleResolution: "bundler"`.
