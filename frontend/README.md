# ORKA Landing Page

The first production-ready marketing surface for ORKA: a responsive Next.js 16 (App
Router) landing page with a Supabase/Resend-backed waitlist. The long-term product
vision lives in the repository root at `../VISION.md`; the canonical build plan is
`../ROADMAP.md`.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v3
- ESLint with Next.js rules

## Getting Started

Install dependencies (use **pnpm** — the repo ships `pnpm-lock.yaml`):

```bash
pnpm install
```

Start the local development server:

```bash
pnpm dev
```

Open the app at http://localhost:3000.

## Available Scripts

```bash
pnpm dev     # Next.js development server
pnpm build   # optimized production build (also surfaces type errors)
pnpm start   # production server (after build)
pnpm lint    # ESLint across the project
```

## Waitlist Backend Prerequisites

The waitlist form posts to `app/api/waitlist/route.ts` and requires a Supabase
`waitlist` table plus Resend credentials:

1. In the Supabase SQL editor, run `supabase/waitlist.sql` to create the `waitlist` table and RLS policies.
2. Copy `.env.example` to `.env.local` and fill in the Supabase and Resend values.
   - No env vars are needed for the static landing page itself, but the API route throws at runtime without Supabase/Resend values.
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are read server-side (no `NEXT_PUBLIC_` prefix). The service-role key must never reach the browser.

## Deployment

Deploy on Vercel or any platform that supports Next.js. Import the repo, keep default
Next.js build settings, deploy. No environment variables are required for the static
landing page.
