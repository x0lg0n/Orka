# ORKA Frontend

The Next.js 16 (App Router) application for ORKA: a public **landing page** plus the authenticated **dashboard** (workspaces, escrow management, and Stellar/Soroban integration). The root `README.md` is the project-level overview; this file covers the `frontend/` package only.

## Tech Stack

- **Next.js 16** (App Router), **React 19**, **TypeScript** (`strict: true`, `moduleResolution: "bundler"`)
- **Tailwind CSS v4** — CSS-first via `@tailwindcss/postcss` + `postcss.config.mjs`. There is **no `tailwind.config.ts`**; theme lives in CSS.
- **Radix UI** primitives + shadcn-style components (`components/ui`)
- **@supabase/ssr** for auth/data access
- **@orka/stellar-sdk** (workspace package) for escrow operations
- `sonner` (toasts), `next-themes`, `@hugeicons/react`, `lucide-react`, `@stellar/freighter-api`

## Project Structure

```text
app/            # routes: landing, /workspaces, /api/waitlist; root layout
components/
  shell/        # AppShell, Sidebar, MobileNav, WorkspaceSwitcher, PageHeader, SearchField
  ui/           # shadcn-style primitives (button, card, dialog, table, tabs, ...)
  workspace/    # workspace-specific UI
lib/            # supabase client, utils
supabase/       # SQL: waitlist.sql, workspace_owner_rls.sql, workspace_type_logo.sql
types/  public/
```

## Getting Started

Use **pnpm** (the repo ships `pnpm-lock.yaml`; there is no committed `package-lock.json`):

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Scripts

```bash
pnpm dev      # Next.js development server
pnpm build    # production build (also surfaces TypeScript errors via tsc)
pnpm start    # production server (run after build)
pnpm lint     # ESLint
```

> There is **no `test` script yet** — frontend tests are not wired into the workflow.

## Configuration & Gotchas

- `next.config.mjs` sets `transpilePackages: ["@orka/stellar-sdk"]` and `turbopack.root` (the latter prevents the `adapterFn is not a function` crash caused by Next.js mis-inferring the workspace root when multiple lockfiles are present).
- **Never run `npm install` at the repo root** — it creates a spurious `package-lock.json`.

## Waitlist Backend Prerequisites

The waitlist form posts to `app/api/waitlist/route.ts` and requires Supabase:

1. In the Supabase SQL editor, run `supabase/waitlist.sql` to create the `waitlist` table + RLS policies.
2. Copy `.env.example` → `.env.local` and fill in Supabase + Resend values.
   - No env vars are needed for the static landing page, but the API route throws at runtime without them.
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are read **server-side** (no `NEXT_PUBLIC_` prefix). The service-role key must never reach the browser.

## Deployment

Deploy on Vercel or any platform that supports Next.js. Import the repo, keep default Next.js build settings. No environment variables are required for the static landing page itself.
