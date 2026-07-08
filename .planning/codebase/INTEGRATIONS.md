# External Integrations

**Analysis Date:** 2026-07-08

## APIs & External Services

**Supabase (Postgres + Auth/RLS):**
- Purpose: Stores waitlist signups in the `waitlist` table; provides the only persistent data store.
- SDK/Client: `@supabase/supabase-js` (`frontend/lib/supabase.ts` via `createClient`).
- Auth: Service-role key for privileged server-side writes. Env: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (with fallback to `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_*` names in `frontend/lib/supabase.ts`).
- Usage: `frontend/app/api/waitlist/route.ts` calls `supabase.from("waitlist").insert({ email, name })`.

**Resend (Transactional Email):**
- Purpose: Sends the "You're on the ORKA waitlist!" confirmation email after a successful DB insert.
- SDK/Client: `resend` (`frontend/lib/resend.ts` via `new Resend(key)`).
- Auth: `RESEND_API_KEY`. Sender address via `RESEND_FROM_EMAIL` (defaults to `onboarding@resend.dev`).
- Usage: `frontend/app/api/waitlist/route.ts` calls `resend.emails.send({ from, to, subject, html })`. Email sending failures are caught and logged but do NOT fail the request (the waitlist insert still succeeds).

## Data Storage

**Databases:**
- Supabase Postgres
  - Connection: `SUPABASE_URL` + service-role key (server-side only).
  - Client: `@supabase/supabase-js`.
  - Schema: `frontend/supabase/waitlist.sql` defines:
    ```sql
    create table if not exists waitlist (
      id uuid default gen_random_uuid() primary key,
      email text not null unique,
      name text,
      role text,
      created_at timestamptz default now()
    );
    ```
  - Row Level Security is enabled, with an `anon` insert policy ("Allow anonymous waitlist signups") and a `service_role` select policy ("Allow read for service role"). The route uses the service-role key, so the anon policy is not strictly required by the current code path.

**File Storage:**
- Local filesystem only / static assets. Brand assets live in `frontend/public/` (`Logo/`, `Icons/`, `Elements/`, `Favicon.svg`). No cloud blob storage configured.

**Caching:**
- None explicitly. Default Next.js App Router request memoization applies; no Redis/external cache.

## Authentication & Identity

**Auth Provider:**
- None for end users. The waitlist collects `email` + optional `name` with no account creation.
- Supabase access uses the server-side service-role key directly (no end-user auth flow). The Supabase anon key is only a fallback in `frontend/lib/supabase.ts`.

## Monitoring & Observability

**Error Tracking:**
- None configured (no Sentry / PostHog / OpenTelemetry).

**Logs:**
- `console.error` / `console.log` only inside `frontend/app/api/waitlist/route.ts` (Supabase config errors, DB errors, Resend errors, success id). No structured logging.

## CI/CD & Deployment

**Hosting:**
- Vercel (recommended) or any Next.js-compatible host (`frontend/README.md`). No `vercel.json` or `Dockerfile` present.

**CI Pipeline:**
- None. No GitHub Actions / CI config in the repo.

## Environment Configuration

**Required env vars (for the API route to function):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_ANON_KEY`)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (optional; has a default)

**Secrets location:**
- `frontend/.env.local` (git-ignored). Template: `frontend/.env.example`. Per `AGENTS.md`, `.env.local` contents are never read/quoted by agents.

## Webhooks & Callbacks

**Incoming:**
- None. (The waitlist is a single `POST /api/waitlist` endpoint; no external webhook receivers.)

**Outgoing:**
- None beyond the Resend API call. No Stripe/Soroban/on-chain calls exist in the current code.

## Planned But Not Yet Integrated

These are referenced in marketing copy (`frontend/app/page.tsx`) and `ROADMAP.md` but have NO code, SDK, or dependency in the current codebase:
- **Stellar / Soroban** - described as the "escrow & settlement" rails. No `stellar-sdk` / `soroban-sdk` dependency exists in `frontend/package.json`; only narrative text.
- **Stripe / payment processors** - mentioned for invoices/payouts; not present.
- **AI providers** (proposal/verification engines) - described as AI-powered; no LLM SDK wired in yet.

> Treat `ROADMAP.md` as a future build plan, not current code. The only live external integrations today are Supabase and Resend.

---

*Integration audit: 2026-07-08*
