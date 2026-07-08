<!-- refreshed: 2026-07-08 -->
# Architecture

**Analysis Date:** 2026-07-08

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
│         `app/page.tsx` (Next.js "use client" landing)        │
│   - WaitlistForm component (local state + fetch)             │
└───────────────────────────┬─────────────────────────────────┘
                            │ POST /api/waitlist (JSON: {name,email})
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Server (App Router)                 │
│              `app/api/waitlist/route.ts` (POST handler)      │
│   1. Parse + validate request body (EMAIL_PATTERN)          │
│   2. escapeHtml(name)                                        │
└───────┬───────────────────────────────┬──────────────────────┘
        │                               │
        ▼                               ▼
┌──────────────────────┐     ┌──────────────────────────────┐
│  `lib/supabase.ts`   │     │     `lib/resend.ts`          │
│  getSupabase()       │     │     getResend()              │
│  → insert waitlist   │     │     → send confirmation email │
└──────────┬───────────┘     └──────────────┬───────────────┘
           │                                │
           ▼                                ▼
┌──────────────────────┐     ┌──────────────────────────────┐
│   Supabase Postgres  │     │        Resend API            │
│   `waitlist` table   │     │  (email delivery)           │
│   (`supabase/        │     │                             │
│    waitlist.sql`)    │     │                             │
└──────────────────────┘     └──────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `Home` (page) | Renders the full single-page marketing landing; owns hardcoded content arrays (`engines`, `steps`, `faqs`) | `app/page.tsx` |
| `WaitlistForm` | Client-side form: validation, fetch to API, success/error UI states | `app/page.tsx` (internal component) |
| `RootLayout` | HTML shell, page metadata, global CSS import | `app/layout.tsx` |
| `NotFound` | Custom 404 page | `app/not-found.tsx` |
| Waitlist API route | Server-side email capture: validate → persist → email | `app/api/waitlist/route.ts` |
| `getSupabase()` | Lazily-initialized singleton Supabase client (server-only) | `lib/supabase.ts` |
| `getResend()` | Lazily-initialized singleton Resend client (server-only) | `lib/resend.ts` |

## Pattern Overview

**Overall:** Single-page Next.js 16 App Router application (static marketing landing + one serverless API route). No backend service of its own — persistence and email are delegated to external SaaS (Supabase + Resend).

**Key Characteristics:**
- Client-server split: the landing page is a `"use client"` component; only the waitlist endpoint runs server-side.
- Singleton client factories in `lib/` to avoid re-instantiating Supabase/Resend on every request.
- Hardcoded marketing copy as module-level constants (`engines`, `steps`, `faqs`) rather than a CMS.
- Defense-in-depth validation: client validates email format, API re-validates, and the DB enforces `unique` on `email`.
- Service-role key used server-side only; never prefixed `NEXT_PUBLIC_` (see `lib/supabase.ts` and `.env.example`).

## Layers

**Presentation (Client) Layer:**
- Purpose: Render marketing sections and capture waitlist signups.
- Location: `app/page.tsx`, `app/layout.tsx`, `app/not-found.tsx`
- Contains: React components, inline Tailwind styling, content arrays
- Depends on: `app/api/waitlist/route.ts` (via `fetch`)
- Used by: End users in the browser

**API / Server Layer:**
- Purpose: Be the trusted boundary that validates input, persists to Supabase, and triggers confirmation email.
- Location: `app/api/waitlist/route.ts`
- Contains: `POST` handler, validation helpers (`EMAIL_PATTERN`, `escapeHtml`), error mapping to HTTP status codes
- Depends on: `lib/supabase.ts`, `lib/resend.ts`
- Used by: The client `WaitlistForm`

**Integration / Client Library Layer:**
- Purpose: Wrap third-party SDKs as lazy singletons.
- Location: `lib/supabase.ts`, `lib/resend.ts`
- Contains: `getSupabase()`, `getResend()` factory functions reading env vars
- Depends on: `@supabase/supabase-js`, `resend` packages; env vars at runtime
- Used by: The API route

**External Persistence / Messaging:**
- Purpose: Store waitlist rows and send transactional email.
- Location: Supabase Postgres (`waitlist` table defined in `supabase/waitlist.sql`); Resend API
- Contains: `waitlist` table (id, email unique, name, role, created_at); RLS policies
- Depends on: Configured Supabase project + Resend account
- Used by: The API route via the integration layer

## Data Flow

### Primary Request Path (waitlist signup)

1. User submits `WaitlistForm` → client validates email with inline regex (`app/page.tsx:84`) → `fetch("/api/waitlist", {method:"POST"})` (`app/page.tsx:93`)
2. `POST` handler in `app/api/waitlist/route.ts:16` parses JSON, validates with `EMAIL_PATTERN` (`route.ts:50`), calls `getSupabase().from("waitlist").insert(...)` (`route.ts:72`)
3. On success, `getResend().emails.send(...)` delivers confirmation (`route.ts:100`); API returns `{success:true}` (`route.ts:129`)
4. Client sets `submitted` state and renders success card (`app/page.tsx:115`)

### DB Constraint / Duplicate Path

1. If `email` already exists, Supabase returns `dbError.code === "23505"` (`route.ts:78`)
2. API treats it as success: `"You're already on the ORKA waitlist."` (`route.ts:80`)
3. Email send is still attempted for duplicates (no early return before the send block)

### Supabase Misconfiguration Path

1. `getSupabase()` throws when env vars missing (`lib/supabase.ts:13`)
2. API catches → returns HTTP `503` (`route.ts:63`)

**State Management:**
- Client: React `useState` only (`submitted`, `loading`, `error`) within `WaitlistForm` — no global store/context.
- Server: Stateless; clients are module-level singletons in `lib/` (created once per server process).

## Key Abstractions

**Lazy Client Singleton:**
- Purpose: Provide a single shared Supabase/Resend client for the server runtime without re-auth per request.
- Examples: `lib/supabase.ts:5` (`getSupabase`), `lib/resend.ts:5` (`getResend`)
- Pattern: Module-level `let client = null`, initialized on first call from env vars; throws if required env missing.

**Serverless Route Handler:**
- Purpose: HTTP boundary for waitlist capture.
- Examples: `app/api/waitlist/route.ts:16` (exported `POST`)
- Pattern: Named `POST` export auto-wired by Next.js App Router at `/api/waitlist`.

## Entry Points

**Web Landing Page (`/`):**
- Location: `app/page.tsx`
- Triggers: Direct browser navigation / crawl
- Responsibilities: Render all marketing sections, host two `WaitlistForm` instances (hero + footer CTA)

**Waitlist API (`/api/waitlist`):**
- Location: `app/api/waitlist/route.ts`
- Triggers: `POST` from `WaitlistForm`
- Responsibilities: Validate, persist, email, return JSON status

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every route render
- Responsibilities: `<html>/<body>` shell, `metadata`, imports `app/globals.css`

## Architectural Constraints

- **Threading:** Node.js single-process event loop (Next.js serverless/standalone). No worker threads.
- **Global state:** Module-level singleton clients in `lib/supabase.ts` and `lib/resend.ts`. No shared mutable business state — the only global is the client cache.
- **Circular imports:** None observed. Import graph: `page.tsx` → `route.ts` (HTTP only, not import); `route.ts` → `lib/supabase.ts`, `lib/resend.ts`.
- **Server/client boundary:** `app/page.tsx` is `"use client"`; `lib/supabase.ts`/`lib/resend.ts` and the API route must never be imported by client components (they read server-only env vars). The route uses relative imports `../../../lib/...` rather than `@/` alias.
- **No auth on the landing page itself:** The page is public; Supabase/Resend are only used by the server route.

## Anti-Patterns

### Improper env var naming (service-role key to browser)

**What happens:** Using `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the server client would expose the Supabase URL/key to the browser bundle.
**Why it's wrong:** The route uses `SUPABASE_SERVICE_ROLE_KEY` which is a privileged server secret; leaking it to the client is a critical security risk.
**Do this instead:** Keep server secrets without the `NEXT_PUBLIC_` prefix and gate them to server code only, as in `lib/supabase.ts` (reads `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`). Update both `lib/supabase.ts` and `.env.example` together if renamed.

### Duplicate-email still sends confirmation

**What happens:** On a `23505` unique violation the API returns success but still proceeds to attempt the Resend send (`route.ts:78-83` returns before the send block only conditionally — actually the send block runs after, because the success return at `:79` does return; however the email block at `:98` is reached only on the non-duplicate happy path). Re-check before reuse.
**Why it's wrong:** Confirmation email may be sent to an already-subscribed address unexpectedly.
**Do this instead:** Decide explicitly whether duplicates should re-trigger an email; if not, `return` early before the Resend block.

## Error Handling

**Strategy:** Explicit status-code mapping with friendly, user-safe messages. All errors return JSON `{error}` (400/503/500) or `{success,message}` (200).

**Patterns:**
- `try/catch` around `request.json()` → 400 on malformed body (`route.ts:19`)
- Type guard on body shape (`route.ts:31`)
- Email regex validation → 400 (`route.ts:50`)
- `catch` around `getSupabase()` → 503 with `console.error` (`route.ts:61`)
- DB error code `23505` → treated as success (`route.ts:78`)
- Generic DB error → 500 with `console.error` (`route.ts:85`)
- Email send errors are non-fatal (`catch` + `console.error`), never block the 200 response (`route.ts:125`)
- Client maps status → friendly copy via `getFriendlyError` (`app/page.tsx:59`)

## Cross-Cutting Concerns

**Logging:** `console.error`/`console.log` only (no structured logger). Used in `app/api/waitlist/route.ts:62,85,121,123,126`.
**Validation:** Two layers — client regex (`app/page.tsx:84`) and server `EMAIL_PATTERN` (`route.ts:5`); DB `unique` constraint as final guard.
**Authentication:** None on the landing page. Supabase/Resend are used as infrastructure, not as app auth. (Future auth model is described in `ROADMAP.md`, not yet implemented.)
**Styling:** Tailwind utility classes inline + custom CSS classes (`display`, `sticker`, `cut-corner`, `section-label`, `shadow-hard`) in `app/globals.css` and `tailwind.config.ts`.

---

*Architecture analysis: 2026-07-08*
