# ORKA — Signup Page (Phase 1 MVP) — Design Spec

- **Date:** 2026-07-10
- **Status:** Approved (design). Pending plan.
- **Owner:** Frontend (Next.js 16 App Router) + Supabase Auth
- **Source of truth:** `ROADMAP.md` (Auth & Custody Model, Phase 1), `docs/USER_FLOW.md`

## 1. Context

ORKA is building the Phase 1 MVP: a workspace where an agency creates a project, a
client funds USDC escrow on Stellar, the client approves a milestone, and the
freelancer gets paid — without anyone touching crypto (Mode A) or with self-custody
via Freighter (Mode B).

The repo today is the **landing page + a waitlist API only**. There is **no
`/signup` route** (the Navbar links to it and it 404s) and **no auth backend**.
`@supabase/supabase-js` is already a dependency; the only backend is the waitlist
insert + Resend email.

Per the ROADMAP, auth (email/Google for Mode A, Freighter for Mode B) with a
one-time `custody_mode` choice is a Phase 1 deliverable. This spec covers the
**signup slice** of Phase 1: creating a real ORKA account.

### Sequencing decision (why signup first)
Signup is the entry point and the highest-value, lowest-risk slice. It depends only
on **Supabase Auth + a `profiles` table** (ROADMAP §1.1 — SQL/config, not custom
servers). The Soroban escrow contract (`contracts/escrow`) and the Rust backend
(`services/`: `custody.rs`, `stellar.rs`, `bridge.rs`) power *fund/approve/release*
and only run **after** a user exists and creates a project — they are downstream,
separate Phase 1 plans, not prerequisites for signup.

## 2. Goals

1. A `/signup` page that creates a **real Supabase Auth user** (Mode A and Mode B).
2. Capture, once at signup: `full_name`, `role` (agency | freelancer | client),
   `custody_mode` (`orka` | `freighter`), and (Mode B) `stellar_address`.
3. Production-grade sessions via httpOnly cookies (Supabase + Next.js SSR pattern).
4. Match the existing landing-page design system (palette, `shadow-hard`,
   `.cut-corner`, `.display`, Lucide icons, error-banner pattern).

## 3. Non-goals (out of scope)

- `/dashboard`, project creation, milestone board, escrow fund/approve/release UI.
- Soroban contract deploy and the Rust `services/` custody/stellar/bridge layer.
- Server-side **Freighter-session login** verifier (ROADMAP Phase 1 `auth.rs`).
  Signup *creates* the Mode B account; Mode B re-login later uses that backend.
- `/login` page (a minimal stub may link back to `/signup`; full login is a follow-up).
- KYC/AML, licensing gating (Phase 3).

## 4. Decisions (confirmed with user)

| Decision | Choice |
|---|---|
| Signup behavior | Real Supabase Auth (client-side, cookie sessions) |
| Modes | Both fully functional; Mode B = real Freighter connect |
| Freighter re-login | Known Phase 1 backend follow-up (documented limitation) |
| Form fields | Email + password + full name + role selector |
| Architecture | Browser Supabase client + `@supabase/ssr` + middleware (Approach 1, elevated to prod quality) |
| Stage | Full Phase 1 MVP, not pre-launch |

## 5. Architecture

Use the current recommended **Supabase + Next.js** pattern (`@supabase/ssr`):

- `lib/supabase/client.ts` — browser client (used by the signup form).
  Built from `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `lib/supabase/server.ts` — server client for Server Components / Route Handlers
  (reads/writes the session cookie).
- `middleware.ts` (repo root `frontend/`) — refreshes the Supabase session cookie on
  each request so Server Components see the logged-in user.
- Keep the existing `lib/supabase.ts` (service-role client for the waitlist API) as-is.

Session handling is via **httpOnly cookies** managed by `@supabase/ssr` — not a raw
public client. This is production-grade and required for the later `/dashboard`.

### 5.1 Mode A — Orka-managed
- Email/password: `supabase.auth.signUp({ email, password, options: { data: {
  full_name, role, custody_mode: "orka" } } })`.
- Google: `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo,
  data: { full_name, role, custody_mode: "orka" } } })`. Supabase accepts a `data`
  payload on the OAuth request, so the currently selected `role` is captured at init
  (the on-page role selector is not bypassed — it is read before the redirect). Google
  supplies `full_name`/`email`; `custody_mode` is forced to `"orka"`.

### 5.2 Mode B — Freighter self-custody
- "Connect Freighter" button → `@stellar/freighter-api` `getPublicKey()` (real browser
  extension interaction). If the extension is absent, show a friendly
  "Install Freighter to continue" message and disable submit.
- After connect, show the masked public key (e.g. `GABC…XYZ1`) and reveal the
  email + password + role form. On submit, `signUp` with `data: { full_name, role,
  custody_mode: "freighter", stellar_address: <pubkey> }`.
- No on-chain action at signup (contract deploy happens at project creation, later).

## 6. Data model

The Phase 1.1 schema already exists at `frontend/supabase/phase1_schema.sql` and
defines `profiles` (with `full_name`, `stellar_address`, `custody_mode` enum,
`created_at`, `updated_at`), org-scoped RLS helpers, and a `handle_new_user()`
trigger. **We extend that file** — we do NOT redefine `profiles`.

Two gaps to close for signup:
1. The existing `profiles` has **no `role` column**. We add `role`
   (`agency | freelancer | client`) to capture the signup choice.
2. The existing `handle_new_user()` only copies `full_name`. We update it to also
   copy `role`, `custody_mode`, and `stellar_address` from `raw_user_meta_data`.

Idempotent SQL to **append** to `phase1_schema.sql`:

```sql
-- 1.1.3b — capture the signup role on profiles
alter table public.profiles
  add column if not exists role text
    check (role in ('agency','freelancer','client'));

-- 1.1.11b — copy the full signup metadata into profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, custody_mode, stellar_address)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'custody_mode',
    new.raw_user_meta_data->>'stellar_address'
  )
  on conflict (id) do update set
    full_name     = coalesce(excluded.full_name, profiles.full_name),
    role          = coalesce(excluded.role, profiles.role),
    custody_mode  = coalesce(excluded.custody_mode, profiles.custody_mode),
    stellar_address = coalesce(excluded.stellar_address, profiles.stellar_address);
  return new;
end;
$$;
```

Notes:
- `custody_mode` stays **nullable** (as in the base schema) so other inserts are not
  broken; the signup flow always supplies it.
- RLS on `profiles` already exists in the base schema (owner + org-share read) — no
  change needed; we only add the column and enrich the trigger.
- The `role` captured here is the user's signup role; when a workspace is created
  later, it is mirrored into `organization_members.role` (owner/admin/member).

## 7. Page design

Route: `frontend/app/signup/page.tsx` (client component for the form; can be wrapped
by a server component that checks existing session and redirects if logged in).

**Layout**
- Full-height `bg-ink` page, centered card `rounded-[28px] shadow-hard` (paper/white
  card on dark bg), ORKA palette accents.
- Header: ORKA logo/wordmark (reuse `Logo/LOGO.svg` pattern) + "Create your account".
- **Mode toggle** (segmented control): "Orka-managed" (default) | "Freighter".
- **Mode A panel:** Full name, Email, Password (show/hide), Role `<select>`
  (Agency / Freelancer / Client), "Create account" button (lime → orange hover),
  divider, "Continue with Google" button (Lucide `Chrome`/mail icon).
- **Mode B panel:** "Connect Freighter" button (Lucide `Wallet` icon) → on success
  shows masked pubkey + Email, Password, Role form; same "Create account" CTA.
- Footer links: "Already have an account? Log in" → `/login` (stub/redirect), and a
  link back to the waitlist/home.

**Reuse from existing system**
- `.display`, `.cut-corner`, focus ring `focus:border-violet focus:ring-4
  focus:ring-violet/20` (from `WaitlistForm`).
- Error banner: rounded card, `bg-bone`, `border-ink/15`, `shadow-[4px_4px_0_…]`,
  `!` badge — same pattern as `WaitlistForm`.
- Lucide icons only (no new SVG files), per project rule.

**Accessibility & motion**
- Labels + `aria-invalid`/`aria-describedby` on inputs; buttons have `aria-label`.
- Respect `prefers-reduced-motion` (animations already guarded in `globals.css`).

## 8. Error & edge handling

- Client validation: email regex (reuse `WaitlistForm` pattern), password ≥ 8 chars,
  role required.
- Map Supabase errors to friendly copy: email already registered, weak password,
  invalid email, unexpected. Inline error banner.
- **Freighter not installed:** detect missing `window.freighter` / failed `getPublicKey`
  → friendly "Install Freighter to continue" message; the email/password form stays
  hidden until a key is successfully connected.
- **Email confirmation:** if Supabase requires confirmation, after `signUp` show a
  "Check your inbox to confirm your email" success state. Once confirmed, the session
  resolves via middleware and the user is redirected to `/dashboard`. If auto-confirm
  (local/dev), redirect immediately.
- Network failure → "We could not connect just now" message (same tone as waitlist).

## 9. Environment variables

Add to `.env.local` (and document in `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (existing server-only `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` stay for the
  waitlist API)

Google OAuth: enable the Google provider in Supabase Auth and set the OAuth redirect.
Freighter: requires the browser extension; no server secret.

## 10. Dependencies to add

- `@supabase/ssr` (session/cookie helper)
- `@stellar/freighter-api` (Mode B wallet connect)
- (already present: `@supabase/supabase-js`, `lucide-react`)

## 11. Verification

1. `pnpm lint` and `pnpm build` pass.
2. Manual (with a configured Supabase project):
   - Mode A email/password signup → confirm email → redirected to `/dashboard`.
   - Mode A Google signup → account created.
   - Mode B Freighter signup (extension installed) → pubkey captured, profile row has
     `custody_mode='freighter'` + `stellar_address`.
   - Mode B with Freighter absent → graceful message, submit disabled.
   - Duplicate email → friendly "already registered" error.
3. Confirm a `profiles` row is created per signup with correct `role`, `custody_mode`,
   and (Mode B) `stellar_address`.

## 12. Known limitations (explicit)

- Mode B **re-login** via Freighter session requires the Phase 1 backend
  (`auth.rs` Freighter-session verification). Signup creates the account; subsequent
  Freighter login is a later slice.
- `/dashboard` and `/login` are follow-up Phase 1 slices; signup redirects to
  `/dashboard` (to be built) and links to `/login` (stub for now).
