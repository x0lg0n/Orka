# Codebase Concerns

**Analysis Date:** 2026-07-08

> Scope: whole repository (`C:\Siddhartha\ORKA\Orka`). The only deployable code is `frontend/` — a Next.js 16 App Router landing page with a Supabase + Resend waitlist. The contracts/, services/, and packages/ described in `ROADMAP.md` do not exist yet. Concerns below focus on the actual code present today.

## Tech Debt

**[Broken logo asset reference]:**
- Issue: `app/page.tsx` (lines 193, 520) and `app/layout.tsx` (line 9) reference `/orka-logo.png`, but no file `public/orka-logo.png` exists. The only logo asset present is `public/Logo/Primaryt-Logo.png` (note the typo "Primaryt"). The image will 404 / fall back to broken-image rendering in production.
- Files: `frontend/app/page.tsx`, `frontend/app/layout.tsx`, `frontend/public/`
- Impact: Broken logo in nav, footer, and favicon area; degraded first impression.
- Fix approach: Add `public/orka-logo.png` (or fix the `src` paths to `Logo/Primaryt-Logo.png`) and correct the typo'd filename. Verify the build output references a real file.

**[Duplicated email-validation regex]:**
- Issue: The email pattern `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` is implemented independently in `frontend/app/api/waitlist/route.ts` (line 5) and `frontend/app/page.tsx` (line 84). The two can drift.
- Files: `frontend/app/api/waitlist/route.ts`, `frontend/app/page.tsx`
- Impact: Inconsistent validation rules between client and server if one is edited.
- Fix approach: Extract the regex (and validation helper) into a shared module under `frontend/lib/` and import in both places.

**[No separate typecheck/lint script discipline]:**
- Issue: Per `AGENTS.md`, there is no `pnpm typecheck` script; type errors only surface during `pnpm build`. This delays type-error feedback to build time.
- Files: `frontend/package.json`
- Impact: CI / pre-commit type errors are not caught early; slower feedback loop.
- Fix approach: Add a `"typecheck": "tsc --noEmit"` script and wire it into CI and a pre-commit hook.

**[Empty Next.js config]:**
- Issue: `frontend/next.config.mjs` exports `{}` with no settings. There is no `images` config, no security headers, no redirects.
- Files: `frontend/next.config.mjs`
- Impact: Missing hardening opportunities (CSP, HSTS, X-Frame-Options) and `next/image` is used (`next/image`) without any remote/domain config — acceptable for local assets, but no header hardening.
- Fix approach: Add `async headers()` with a Content-Security-Policy and basic security headers.

## Known Bugs

**[Duplicate waitlist signups receive no confirmation email]:**
- Symptoms: A returning user who re-submits an already-registered email hits the `23505` (unique violation) branch (`frontend/app/api/waitlist/route.ts`, lines 78-83) and returns success **before** the Resend email block. The user gets the "already on the list" JSON but never receives a welcome email.
- Files: `frontend/app/api/waitlist/route.ts`
- Trigger: Submit an email already present in the `waitlist` table.
- Workaround: None for the user; they simply don't get the email. Minor UX inconsistency rather than a crash.

**[No input length / payload limit on name/email]:**
- Symptoms: `route.ts` reads `email` and `name` from the JSON body and inserts them without capping length. A very large `name` string is accepted and stored.
- Files: `frontend/app/api/waitlist/route.ts` (lines 39-41)
- Trigger: POST a body with a multi-megabyte `name` field.
- Workaround: None. Could be combined with the lack of rate limiting for abuse.

## Security Considerations

**[Supabase RLS policy permits anonymous inserts]:**
- Risk: `frontend/supabase/waitlist.sql` (lines 14-17) creates a policy `Allow anonymous waitlist signups` granting `insert` to the `anon` role with `with check (true)`. Combined with `frontend/lib/supabase.ts` (lines 9-12), which falls back to `SUPABASE_ANON_KEY` (and even `NEXT_PUBLIC_SUPABASE_ANON_KEY`) if `SUPABASE_SERVICE_ROLE_KEY` is absent, the server route may operate with the anon key. The anon insert policy means anyone with the anon key (which is public/client-side by design) can write to the table directly, bypassing the API route's validation/email step.
- Files: `frontend/supabase/waitlist.sql`, `frontend/lib/supabase.ts`
- Current mitigation: RLS is enabled and a `service_role` read policy exists. The `anon` insert policy is the gap.
- Recommendations:
  - Prefer server-side writes using the service-role key only (remove the `anon` fallback in `lib/supabase.ts`).
  - If the `anon` insert policy is kept, scope the `with check` to only allow `email`/`name` columns and never expose the service-role key. Consider dropping the `anon` policy entirely and writing only from the trusted server route.

**[No rate limiting on the waitlist endpoint]:**
- Risk: `app/api/waitlist/route.ts` has no throttling, CAPTCHA, or abuse protection. An attacker can POST arbitrary emails repeatedly, filling the table and triggering many outbound Resend emails (email-bomb / cost risk).
- Files: `frontend/app/api/waitlist/route.ts`
- Current mitigation: None.
- Recommendations: Add IP/email-based rate limiting (e.g., Upstash Redis / Vercel KV), and consider a honeypot field or CAPTCHA on the client form (`app/page.tsx`).

**[Service-role key exposure surface]:**
- Risk: `SUPABASE_SERVICE_ROLE_KEY` is documented as server-only (`frontend/.env.example` lines 4-5), but `frontend/lib/supabase.ts` (lines 9-12) silently falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` if the service key is missing. If a developer mis-sets env vars, the route silently downgrades to anon. The key must never be prefixed `NEXT_PUBLIC_` (confirmed correct today, but the fallback chain is fragile).
- Files: `frontend/lib/supabase.ts`, `frontend/.env.example`
- Current mitigation: Correct non-`NEXT_PUBLIC_` naming today.
- Recommendations: Make `getSupabase()` require `SUPABASE_SERVICE_ROLE_KEY` explicitly (throw if missing) rather than falling back to anon keys; document the requirement clearly.

**[No security headers (CSP, HSTS, X-Frame-Options)]:**
- Risk: `next.config.mjs` is empty. The landing page has no Content-Security-Policy, which leaves it more exposed to injected content (e.g., if any dynamic content were added later).
- Files: `frontend/next.config.mjs`
- Current mitigation: None.
- Recommendations: Add a `headers()` export in `next.config.mjs` with a restrictive CSP and standard security headers.

**[Outbound email content uses escaped name only]:**
- Note: `route.ts` (lines 7-14, 96) HTML-escapes the `name` before injecting into the email HTML — good. No unescaped user input reaches the email body. This is correctly handled; recorded as a positive to preserve.

## Performance Bottlenecks

**[Email send is inline and blocking on the request path]:**
- Problem: `route.ts` (lines 98-127) sends the Resend email synchronously inside the POST handler before returning success. A slow or failing Resend API delays the user's response. It is wrapped in try/catch so failure doesn't block the success response, but latency still affects the request.
- Files: `frontend/app/api/waitlist/route.ts`
- Cause: Sequential await on the email provider.
- Improvement path: Move email delivery to a background job / queue (e.g., a Next.js background task, Vercel Cron, or a queue) so the API returns immediately after the DB insert.

**[No caching of static landing content]:**
- Problem: `app/page.tsx` is a client component (`"use client"`) rendered as the home page. Heavy static marketing content is shipped as a client component, losing static-generation/streaming benefits for above-the-fold content.
- Files: `frontend/app/page.tsx` (line 1)
- Cause: `"use client"` at the top of the page forces the entire page into the client bundle; only the waitlist form actually needs interactivity.
- Improvement path: Convert `page.tsx` to a server component and isolate the interactive `WaitlistForm` into its own `"use client"` component (it already is a separate component, so hoisting it into its own file achieves this).

## Fragile Areas

**[Zero automated test coverage]:**
- Files: entire `frontend/` (`package.json` has no test runner; no `*.test.*`/`*.spec.*` files exist).
- Why fragile: The waitlist API has non-trivial branching (JSON parse failure, validation, duplicate detection, DB error, email error). Any refactor risks silently breaking behavior with no safety net.
- Safe modification: Add a test runner (Vitest is idiomatic for Next, or keep it dependency-light with Node's built-in test runner) and cover `route.ts` POST branches. Until then, run `pnpm build` after every change to catch type/compile errors.
- Test coverage: None — highest-priority gap.

**[Global mutable singleton clients]:**
- Files: `frontend/lib/supabase.ts` (lines 3-18), `frontend/lib/resend.ts` (lines 3-13)
- Why fragile: Module-level `let client = null` singletons. In dev with hot-reload or in serverless with multiple isolates, the cached client can become stale or multiply. Low risk today, but a known Next.js serverless gotcha.
- Safe modification: Acceptable as-is for a single-route app; revisit if more routes or middleware are added.

**[`getSupabase()` fallback chain]:**
- Files: `frontend/lib/supabase.ts` (lines 7-16)
- Why fragile: The long `||` fallback across four env var names makes the effective credentials non-obvious and can mask misconfiguration (see Security).

## Scaling Limits

**[Single Postgres table with no indexes beyond PK/unique]:**
- Current capacity: `waitlist` table (`frontend/supabase/waitlist.sql`) — `email` unique, `id` PK. Fine for thousands of rows.
- Limit: As volume grows, there is no index on `created_at` for reporting, no soft-delete/status column, and no `role` population (the `role` column is defined but never written by `route.ts`).
- Scaling path: Add an index on `created_at`, decide whether `role` should be captured from the form, and add pagination for any admin view.

**[Outbound email cost scales linearly with signups]:**
- Current capacity: One Resend email per unique signup.
- Limit: Free Resend tier has send limits; high signup volume incurs cost and could hit rate ceilings.
- Scaling path: Batch/welcome-drip emails, or gate sending behind a queue with retry/backoff.

## Dependencies at Risk

**[Next.js 16.2.10 (very new major)]:**
- Risk: Pinned to `next@16.2.10` and `react@19.0.0` — a bleeding-edge major. Fewer community examples, higher chance of framework-level breaking changes in patch releases.
- Impact: Upgrades may introduce breaking changes; `eslint-config-next@16.2.10` is matched but other tooling may lag.
- Migration plan: Keep `pnpm-lock.yaml` committed (it is) to lock the resolved tree; budget time to track Next 16 release notes before bumping.

**[`resend@^6.17.1` and `supabase-js@^2.110.0` carets]:**
- Risk: Caret ranges allow minor/patch drift on `pnpm install`. Combined with no lockfile-verified CI, a transitive change could alter behavior.
- Impact: Low today; relevant if CI installs fresh.
- Migration plan: Rely on the committed `pnpm-lock.yaml`; consider `pnpm install --frozen-lockfile` in CI.

## Missing Critical Features

**[No admin/export view for the waitlist]:**
- Problem: Signups land in Supabase but there is no UI, API, or script to list/export them (the `service_role` read policy exists but nothing consumes it).
- Blocks: Operational follow-up with design partners; any reporting.

**[No environment validation at startup]:**
- Problem: Missing env vars only surface as a runtime `503`/`Missing ... key` error inside the request (`route.ts` lines 61-70, `resend.ts` lines 8-10). There is no `zod`/schema validation of required vars at boot.
- Blocks: Fast failure and clear deploy errors.

**[Documentation drift between root and frontend]:**
- Problem: Root `README.md` is empty (intentional per `AGENTS.md`); `ROADMAP.md` is a future plan, not current state. A new contributor reading `ROADMAP.md` may assume contracts/services/packages exist.
- Blocks: Onboarding clarity. `AGENTS.md` mitigates this but is itself lowercase `agents.md` at the root while guidance references `AGENTS.md`.

## Test Coverage Gaps

**[Waitlist API (`route.ts`) — untested]:**
- What's not tested: JSON-parse failure (400), missing body (400), empty email (400), invalid email format (400), successful insert, duplicate (`23505`) handling, DB error (500), Resend success/failure paths.
- Files: `frontend/app/api/waitlist/route.ts`
- Risk: Any change to validation or error codes ships unverified.
- Priority: High

**[Client form validation (`page.tsx`) — untested]:**
- What's not tested: Email regex on the client, error message mapping (`getFriendlyError`), submitted/loading state transitions.
- Files: `frontend/app/page.tsx`
- Risk: UX regressions in the only conversion path.
- Priority: Medium

---

*Concerns audit: 2026-07-08*
