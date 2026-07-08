# Technology Stack

**Analysis Date:** 2026-07-08

## Languages

**Primary:**
- TypeScript [5.7.x] - All application source (`frontend/*.ts`, `frontend/*.tsx`). Configured via `frontend/tsconfig.json` with `strict: true`, `target: ES2017`, `moduleResolution: "bundler"`.
- JavaScript [ESM] - Build/config files (`frontend/next.config.mjs`, `frontend/postcss.config.mjs`, `frontend/eslint.config.mjs`).

**Secondary:**
- SQL - Supabase schema definition (`frontend/supabase/waitlist.sql`).
- CSS - Global styles and design utilities (`frontend/app/globals.css`).

## Runtime

**Environment:**
- Node.js (no explicit `engines` field pinned in `frontend/package.json`; Next.js 16 requires Node 18.18+ / 20+).

**Package Manager:**
- pnpm [lockfile: `frontend/pnpm-lock.yaml` present]
- Note: `frontend/package.json` has no `package-lock.json` counterpart (README mentions `npm install`, but the repo ships pnpm lock). Per `AGENTS.md`, use `pnpm install` / `pnpm dev` / `pnpm build` / `pnpm lint`.

## Frameworks

**Core:**
- Next.js [16.2.10] - React framework, App Router (`frontend/app/` directory), used for both the static landing page and the API route. Config: `frontend/next.config.mjs` is empty (`{}`).
- React [19.0.0] - UI library. The landing page (`frontend/app/page.tsx`) is a client component (`"use client"`) due to the interactive waitlist form.

**Testing:**
- Not configured. No test runner (Jest/Vitest/Playwright) is present. `frontend/package.json` has no `test` script.

**Build/Dev:**
- TypeScript compiler (via `next build`) - type errors surface at build time; there is no standalone `typecheck` script (`AGENTS.md`).
- ESLint [9.17.0] with `eslint-config-next` [16.2.10] - lint via `frontend/eslint.config.mjs` (core-web-vitals + typescript presets).
- Tailwind CSS [3.4.17] - styling, config in `frontend/tailwind.config.ts`.
- PostCSS [8.5.16] + Autoprefixer [10.4.20] - CSS pipeline via `frontend/postcss.config.mjs`.

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` [^2.110.0] - Database client for the waitlist. Initialized in `frontend/lib/supabase.ts`, used by `frontend/app/api/waitlist/route.ts`.
- `resend` [^6.17.1] - Transactional email (waitlist confirmation). Initialized in `frontend/lib/resend.ts`, used by `frontend/app/api/waitlist/route.ts`.
- `next` / `react` / `react-dom` [16.2.10 / 19.0.0] - Core app framework and rendering.

**Infrastructure:**
- `tailwindcss`, `postcss`, `autoprefixer` - styling pipeline.
- `@types/node`, `@types/react`, `@types/react-dom` - TypeScript type defs.

## Configuration

**Environment:**
- Environment variables supplied via `.env.local` (copy of `frontend/.env.example`). Documented vars:
  - `SUPABASE_URL` (server-side, no `NEXT_PUBLIC_` prefix per `AGENTS.md`)
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never exposed to browser)
  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
- Note: `lib/supabase.ts` also falls back to `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` if the non-public names are absent, but `AGENTS.md` states the intended convention is the non-public `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.

**Build:**
- `frontend/next.config.mjs` - empty config (`{}`). No custom webpack, redirects, or headers.
- `frontend/tsconfig.json` - strict TS, Next.js plugin enabled.
- `frontend/tailwind.config.ts` - custom brand color palette (`ink`, `night`, `paper`, `bone`, `orange`, `coral`, `violet`, `lime`, `teal`) and custom `shadow-hard` / `shadow-glow`.
- `frontend/postcss.config.mjs` - tailwindcss + autoprefixer plugins.

## Platform Requirements

**Development:**
- pnpm installed; run from `frontend/`: `pnpm install`, `pnpm dev` (http://localhost:3000), `pnpm build`, `pnpm start`, `pnpm lint`.
- A Supabase project with the `waitlist` table (created by running `frontend/supabase/waitlist.sql`).
- A Resend account + API key for email sends.

**Production:**
- Deployable to Vercel (or any Next.js host). The static landing page needs no env vars, but the `/api/waitlist` route throws at runtime without Supabase/Resend values.

---

*Stack analysis: 2026-07-08*
