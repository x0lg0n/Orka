# Coding Conventions

**Analysis Date:** 2026-07-08

## Naming Patterns

**Files:**
- Route handlers use lowercase with no separators: `frontend/app/api/waitlist/route.ts`
- Library modules use lowercase with no separators: `frontend/lib/supabase.ts`, `frontend/lib/resend.ts`
- Page/component files use lowercase: `frontend/app/page.tsx`, `frontend/app/layout.tsx`, `frontend/app/not-found.tsx`
- Config files use dot-notation lowercase: `frontend/eslint.config.mjs`, `frontend/next.config.mjs`, `frontend/postcss.config.mjs`, `frontend/tailwind.config.ts`, `frontend/tsconfig.json`

**Functions:**
- Exported server-side factory functions use `get`-prefix: `getSupabase()` in `frontend/lib/supabase.ts`, `getResend()` in `frontend/lib/resend.ts`
- Local helper functions use camelCase: `escapeHtml()` in `frontend/app/api/waitlist/route.ts`, `getFriendlyError()` in `frontend/app/page.tsx`
- HTTP route handlers are exported as named uppercase verbs: `export async function POST(request: Request)` in `frontend/app/api/waitlist/route.ts`

**Variables:**
- Constants are UPPER_SNAKE_CASE module-level: `EMAIL_PATTERN` in `frontend/app/api/waitlist/route.ts`
- Local variables and React state use camelCase: `submitted`, `loading`, `error` in `frontend/app/page.tsx`

**Types:**
- Inline/local type aliases use PascalCase: `WaitlistResponse` in `frontend/app/page.tsx`
- Named type exports use PascalCase: `Metadata` (Next.js built-in) in `frontend/app/layout.tsx`

## Code Style

**Formatting:**
- No Prettier config present. Formatting is enforced indirectly by ESLint (`eslint-config-next`) and `next build` (which runs `tsc`).
- Indentation: 2 spaces (observed consistently across `frontend/app/api/waitlist/route.ts`, `frontend/lib/*.ts`).
- Strings: double quotes used throughout source files.
- Semicolons: present at end of statements.

**Linting:**
- Tool: ESLint 9 (flat config) — `frontend/eslint.config.mjs`
- Config extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Run command: `pnpm lint` → `eslint .`
- Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- There is **no** standalone `typecheck` script; type errors surface during `pnpm build` (`tsc` via Next).

## Import Organization

**Order observed:**
1. Next.js framework imports (`next/server`, `next/image`, `next/link`)
2. External packages (`@supabase/supabase-js`, `resend`, `react`)
3. Local relative imports (e.g., `../../../lib/resend`, `../../../lib/supabase`)
4. CSS side-effect imports (`import "./globals.css"` in `frontend/app/layout.tsx`)

**Path Aliases:**
- None configured. All local imports use relative paths (e.g., `frontend/app/api/waitlist/route.ts` imports `../../../lib/resend`).
- No `@/` or `~` alias exists in `frontend/tsconfig.json`.

## Error Handling

**Patterns:**
- API routes return `NextResponse.json({ error: "..." }, { status: N })` with explicit user-facing error strings. See `frontend/app/api/waitlist/route.ts` (lines 22, 33, 46, 53, 66, 91).
- Client-side input validation happens before network calls: email regex check in `onSubmit` at `frontend/app/page.tsx:84`.
- Server-side validation is duplicated: `EMAIL_PATTERN` in `frontend/app/api/waitlist/route.ts:5` mirrors the client regex at `frontend/app/page.tsx:84` (defense in depth — both layers validate).
- `try/catch` wraps JSON parsing, client init, and DB insert. Empty `catch` clauses are used to return generic errors (e.g., `frontend/app/api/waitlist/route.ts:21`).
- Supabase unique-violation (Postgres code `"23505"`) is treated as a success path: `frontend/app/api/waitlist/route.ts:78`.
- Errors are logged via `console.error` (e.g., `frontend/app/api/waitlist/route.ts:62,85,121,126`) — no structured logging library.
- `escapeHtml()` in `frontend/app/api/waitlist/route.ts:7` sanitizes user-supplied `name` before interpolation into email HTML to prevent injection.

## Logging

**Framework:** `console` (no dedicated logging library).

**Patterns:**
- `console.error(...)` for failures (Supabase config, DB insert, Resend send).
- `console.log("Resend email sent:", data?.id)` for success telemetry at `frontend/app/api/waitlist/route.ts:123`.

## Comments

**When to Comment:**
- Section dividers in JSX use ASCII banner comments: `{/* ─── HERO ─── */}` in `frontend/app/page.tsx:181`.
- No JSDoc/TSDoc usage observed anywhere in the codebase.
- Functions are documented implicitly via naming; no inline explanatory comments on logic.

## Function Design

**Size:** Route handler `POST` is ~117 lines (`frontend/app/api/waitlist/route.ts:16-133`) — single long handler with inline validation steps. Component `Home` in `frontend/app/page.tsx` is ~370 lines and renders the entire page (no sub-component extraction beyond `WaitlistForm`).
**Parameters:** Handlers take framework request objects (`request: Request`). Helpers take primitives (`escapeHtml(value: string)`, `getFriendlyError(status: number, error?: string)`).
**Return Values:** Route handlers return `NextResponse` objects. Library getters return typed clients or throw.

## Module Design

**Exports:**
- `frontend/lib/supabase.ts` and `frontend/lib/resend.ts` export a single factory function (`getSupabase`, `getResend`).
- `frontend/app/page.tsx` default-exports the page component; `WaitlistForm` is a local (non-exported) component.
- `frontend/app/api/waitlist/route.ts` does NOT use a default export; it exports `POST` (App Router route-handler convention).

**Singletons:**
- Both `frontend/lib/supabase.ts:3` and `frontend/lib/resend.ts:3` cache the client in a module-level `let client` variable and lazily instantiate on first `get*()` call. This is the only shared mutable state in the codebase.

**Barrel Files:** None present.

---

*Convention analysis: 2026-07-08*
