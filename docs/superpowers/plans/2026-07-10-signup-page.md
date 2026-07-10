# ORKA Signup Page (Phase 1 MVP) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real `/signup` page that creates a Supabase Auth user (Mode A: email/password + Google; Mode B: Freighter self-custody) and captures `full_name`, `role`, `custody_mode`, and `stellar_address` into `profiles`.

**Architecture:** Browser Supabase client (`@supabase/ssr`) drives the form; a server client + `middleware.ts` manage httpOnly session cookies so Server Components see the logged-in user. Signup metadata is written into `profiles` by an enriched `handle_new_user()` trigger (extending the existing `phase1_schema.sql`).

**Tech Stack:** Next.js 16 (App Router) + React 19, `@supabase/supabase-js`, `@supabase/ssr`, `@stellar/freighter-api`, `lucide-react`, Tailwind v3.

## Global Constraints

- Env var names are exact: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser); existing server-only `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` stay for the waitlist API and must not be changed.
- Keep the existing `frontend/lib/supabase.ts` (service-role client for the waitlist API) **as-is**.
- Reuse the existing design system verbatim: `.display`, `.cut-corner`, `shadow-hard`, focus ring `focus:border-violet focus:ring-4 focus:ring-violet/20`, error-banner pattern from `WaitlistForm` (`bg-bone`, `border-ink/15`, `shadow-[4px_4px_0_rgba(6,26,43,0.15)]`, `!` badge), Lucide icons only (no new SVG files).
- Email regex verbatim from `WaitlistForm`: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Password minimum length: 8.
- `role` values are exactly `agency | freelancer | client`; `custody_mode` values exactly `orka | freighter`.
- SQL must be **idempotent appends** — do NOT redefine `profiles` or recreate the `handle_new_user` trigger from scratch in a way that drops other behavior; use the `create or replace` + `add column if not exists` forms from the spec.
- The repo has **no unit-test runner** (per AGENTS.md: typecheck surfaces via `next build`; lint via `pnpm lint`). Automated gates per task = `pnpm lint` / `pnpm build`. Runtime verification is manual with a configured Supabase project (spec §11). Do not add a test framework (YAGNI).

---

## File Structure

- **Create** `frontend/lib/supabase/client.ts` — browser Supabase client (used by the signup form).
- **Create** `frontend/lib/supabase/server.ts` — server Supabase client (Server Components / Route Handlers; reads+writes session cookie).
- **Create** `frontend/middleware.ts` — refresh the Supabase session cookie each request; guard `/dashboard`.
- **Create** `frontend/components/SignupForm.tsx` — the client form (Mode A + Mode B, validation, errors, success state).
- **Create** `frontend/app/signup/page.tsx` — server component: redirect if already logged in, else render `SignupForm`.
- **Create** `frontend/app/login/page.tsx` — minimal stub linking back to `/signup`.
- **Modify** `frontend/supabase/phase1_schema.sql` — append `role` column + enriched `handle_new_user()`.
- **Modify** `frontend/components/Navbar.tsx` — make the `/signup` link a real `next/link` (drop `target="_blank"`).
- **Modify** `frontend/package.json` — add `@supabase/ssr` + `@stellar/freighter-api`.
- **Modify** `frontend/.env.example` — document `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

---

### Task 1: Add dependencies

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install the two new dependencies with pnpm**

Run (from `frontend/`):
```bash
cd frontend && pnpm add @supabase/ssr @stellar/freighter-api
```
Expected: both added to `dependencies` in `package.json`; lockfile updated.

- [ ] **Step 2: Verify they resolved**

Run:
```bash
pnpm list @supabase/ssr @stellar/freighter-api
```
Expected: two lines showing installed versions, no error.

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/pnpm-lock.yaml
git commit -m "chore: add @supabase/ssr and @stellar/freighter-api for signup"
```

---

### Task 2: Extend the SQL schema (role column + enriched trigger)

**Files:**
- Modify: `frontend/supabase/phase1_schema.sql` (append to end of file)

**Interfaces:**
- Consumes: existing `public.profiles` table and existing `public.handle_new_user()` trigger (defined in the same file).
- Produces: `profiles.role` column + a `handle_new_user()` that also copies `role`, `custody_mode`, `stellar_address`.

- [ ] **Step 1: Append the idempotent SQL to the end of `phase1_schema.sql`**

Append exactly:
```sql
-- ---------- 1.1.3b capture the signup role on profiles ----------
alter table public.profiles
  add column if not exists role text
    check (role in ('agency','freelancer','client'));

-- ---------- 1.1.11b copy the full signup metadata into profiles ----------
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
    full_name      = coalesce(excluded.full_name, profiles.full_name),
    role           = coalesce(excluded.role, profiles.role),
    custody_mode   = coalesce(excluded.custody_mode, profiles.custody_mode),
    stellar_address = coalesce(excluded.stellar_address, profiles.stellar_address);
  return new;
end;
$$;
```

- [ ] **Step 2: Sanity-check the SQL is syntactically runnable (no execution needed locally)**

Run (from `frontend/`):
```bash
pnpm lint
```
Expected: PASS (this only guards TS; the SQL is validated when pasted into the Supabase SQL editor). Note for the human: run the full `phase1_schema.sql` (now including 1.1.3b/1.1.11b) in the Supabase SQL editor.

- [ ] **Step 3: Commit**

```bash
git add frontend/supabase/phase1_schema.sql
git commit -m "feat(db): add role column and enrich handle_new_user for signup"
```

---

### Task 3: Browser Supabase client

**Files:**
- Create: `frontend/lib/supabase/client.ts`

**Interfaces:**
- Produces: `createClient()` returning a `@supabase/ssr` browser client. Imported by `SignupForm` (Task 6).

- [ ] **Step 1: Write the browser client**

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(url, key);
}
```

- [ ] **Step 2: Type-check**

Run (from `frontend/`):
```bash
pnpm build 2>&1 | tail -20
```
Expected: build completes (or only pre-existing warnings); no error referencing `lib/supabase/client.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/supabase/client.ts
git commit -m "feat(auth): add browser Supabase client"
```

---

### Task 4: Server Supabase client

**Files:**
- Create: `frontend/lib/supabase/server.ts`

**Interfaces:**
- Produces: `createClient()` (async) returning a `@supabase/ssr` server client that reads/writes the cookie store. Imported by `app/signup/page.tsx` (Task 7).

- [ ] **Step 1: Write the server client**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — middleware refreshes the session.
        }
      },
    },
  });
}
```

- [ ] **Step 2: Type-check**

Run:
```bash
pnpm build 2>&1 | tail -20
```
Expected: no type errors referencing `lib/supabase/server.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/supabase/server.ts
git commit -m "feat(auth): add server Supabase client with cookie handling"
```

---

### Task 5: Session refresh middleware

**Files:**
- Create: `frontend/middleware.ts` (at the `frontend/` root, sibling to `app/`)

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Produces: refreshed session cookies on every request; redirects unauthenticated `/dashboard` visits to `/signup`.

- [ ] **Step 1: Write the middleware**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/signup";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Build**

Run:
```bash
pnpm build 2>&1 | tail -20
```
Expected: build succeeds; middleware compiles.

- [ ] **Step 3: Commit**

```bash
git add frontend/middleware.ts
git commit -m "feat(auth): add Supabase session-refresh middleware"
```

---

### Task 6: Signup form component (Mode A + Mode B)

**Files:**
- Create: `frontend/components/SignupForm.tsx`

**Interfaces:**
- Consumes: `createClient()` from `../lib/supabase/client` (Task 3); `getPublicKey`, `requestAccess`, `isAllowed` from `@stellar/freighter-api` (Task 1).
- Produces: a rendered signup card; on success either `router.push("/dashboard")` (auto-confirm) or a "check your inbox" state (confirmation required).

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Chrome, Eye, EyeOff, Wallet, CheckCircle2 } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { getPublicKey, requestAccess, isAllowed } from "@stellar/freighter-api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = [
  { value: "agency", label: "Agency" },
  { value: "freelancer", label: "Freelancer" },
  { value: "client", label: "Client" },
] as const;

type Mode = "orka" | "freighter";

function maskKey(key: string) {
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

function getFriendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "This email is already registered. Try logging in instead.";
  }
  if (m.includes("password") && m.includes("8")) {
    return "Password should be at least 8 characters.";
  }
  if (m.includes("invalid email") || m.includes("email address")) {
    return "Please enter a valid email address.";
  }
  return "We could not create your account just now. Please try again.";
}

const inputClass =
  "min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20";

export default function SignupForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("orka");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stellarAddress, setStellarAddress] = useState("");
  const [freighterError, setFreighterError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const errorId = "signup-error";

  async function connectFreighter() {
    setFreighterError("");
    if (typeof window === "undefined" || !(window as unknown as { freighter?: unknown }).freighter) {
      setFreighterError("Install Freighter to continue.");
      return;
    }
    try {
      const allowed = await isAllowed();
      if (!allowed) await requestAccess();
      const key = await getPublicKey();
      setStellarAddress(key);
    } catch {
      setFreighterError("Could not connect to Freighter. Please try again.");
    }
  }

  async function onGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          data: { full_name: name.trim(), role: role || "client", custody_mode: "orka" },
        },
      });
      if (googleError) setError(getFriendlyError(googleError.message));
    } catch {
      setError("We could not connect just now. Check your connection and try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "freighter" && !stellarAddress) {
      setError("Connect Freighter first.");
      return;
    }
    const fullName = name.trim();
    const emailVal = email.trim();
    if (!EMAIL_RE.test(emailVal)) {
      setError("Please add a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password should be at least 8 characters.");
      return;
    }
    if (!role) {
      setError("Please choose your role.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const meta: Record<string, string> = {
        full_name: fullName,
        role,
        custody_mode: mode,
      };
      if (mode === "freighter" && stellarAddress) {
        meta.stellar_address = stellarAddress;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailVal,
        password,
        options: {
          data: meta,
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        setError(getFriendlyError(signUpError.message));
        return;
      }
      if (data.session) {
        router.push("/dashboard");
        return;
      }
      setSuccess(true);
    } catch {
      setError("We could not connect just now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-[14px] border-2 border-ink bg-lime p-5 text-ink shadow-hard">
        <p className="display text-2xl uppercase">Check your inbox!</p>
        <p className="mt-2 text-sm font-bold">
          We sent a confirmation link to {email.trim() || "your email"}. Open it to finish
          creating your ORKA account.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mode toggle */}
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-full border-2 border-ink bg-white p-1">
        <button
          type="button"
          onClick={() => setMode("orka")}
          aria-pressed={mode === "orka"}
          className={`rounded-full px-4 py-2 text-sm font-black uppercase transition ${
            mode === "orka" ? "bg-ink text-white" : "text-ink hover:bg-bone"
          }`}>
          Orka-managed
        </button>
        <button
          type="button"
          onClick={() => setMode("freighter")}
          aria-pressed={mode === "freighter"}
          className={`rounded-full px-4 py-2 text-sm font-black uppercase transition ${
            mode === "freighter" ? "bg-ink text-white" : "text-ink hover:bg-bone"
          }`}>
          Freighter
        </button>
      </div>

      {error ?
        <div
          id={errorId}
          role="status"
          className="mb-4 flex items-start gap-3 rounded-[14px] border-2 border-ink/15 bg-bone px-4 py-3 text-sm font-bold leading-5 text-ink shadow-[4px_4px_0_rgba(6,26,43,0.15)]">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-orange text-xs font-black text-white">
            !
          </span>
          <p>{error}</p>
        </div>
      : null}

      {/* Mode B panel */}
      {mode === "freighter" && !stellarAddress ?
        <div className="flex flex-col items-center gap-4 py-6">
          <button
            type="button"
            onClick={connectFreighter}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">
            <Wallet size={18} /> Connect Freighter
          </button>
          {freighterError ?
            <p className="text-sm font-bold text-coral">{freighterError}</p>
          : <p className="text-sm font-bold text-ink/70">
              Self-custody via the Freighter browser extension.
            </p>}
        </div>
      :
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="su-name" className="mb-1 block text-sm font-bold text-ink">
              Full name
            </label>
            <input
              id="su-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className={inputClass}
              required
            />
          </div>

          {mode === "freighter" && stellarAddress ?
            <div className="flex items-center gap-2 rounded-[10px] border-2 border-teal bg-white px-4 py-3 text-sm font-bold text-ink">
              <CheckCircle2 size={18} className="text-teal" />
              Connected: {maskKey(stellarAddress)}
            </div>
          : null}

          <div>
            <label htmlFor="su-email" className="mb-1 block text-sm font-bold text-ink">
              Email
            </label>
            <input
              id="su-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="su-password" className="mb-1 block text-sm font-bold text-ink">
              Password
            </label>
            <div className="relative">
              <input
                id="su-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="su-role" className="mb-1 block text-sm font-bold text-ink">
              I am a…
            </label>
            <select
              id="su-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
              required>
              <option value="" disabled>
                Select your role
              </option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white disabled:cursor-wait disabled:opacity-70">
            {loading ? "Creating…" : "Create account"}
          </button>

          {mode === "orka" ?
            <>
              <div className="my-3 flex items-center gap-3 text-ink/50">
                <span className="h-px flex-1 bg-ink/15" />
                <span className="text-xs font-bold uppercase">or</span>
                <span className="h-px flex-1 bg-ink/15" />
              </div>
              <button
                type="button"
                onClick={onGoogle}
                disabled={googleLoading}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-white px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-bone disabled:cursor-wait disabled:opacity-70">
                <Chrome size={18} /> Continue with Google
              </button>
            </>
          : null}
        </form>}

      <p className="mt-6 text-center text-sm font-bold text-ink/70">
        Already have an account?{" "}
        <Link href="/login" className="text-violet underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Build to catch type errors**

Run:
```bash
pnpm build 2>&1 | tail -30
```
Expected: no type errors in `SignupForm.tsx`. (Runtime needs env vars — set them before manual testing.)

- [ ] **Step 3: Commit**

```bash
git add frontend/components/SignupForm.tsx
git commit -m "feat(auth): add signup form with Orka + Freighter modes"
```

---

### Task 7: Signup page (server wrapper)

**Files:**
- Create: `frontend/app/signup/page.tsx`

**Interfaces:**
- Consumes: `createClient()` from `../../lib/supabase/server` (Task 4); `SignupForm` from `../../components/SignupForm` (Task 6).

- [ ] **Step 1: Write the page**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import SignupForm from "../../components/SignupForm";

export const metadata = {
  title: "Sign up · ORKA",
  description: "Create your ORKA account.",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen flex-col bg-ink px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <div className="flex items-center gap-3">
          <Image
            src="/Logo/LOGO.svg"
            alt="ORKA"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <span className="display text-3xl">ORKA</span>
        </div>

        <div className="rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
          <h1 className="display mb-1 text-3xl uppercase">Create your account</h1>
          <p className="mb-6 text-sm font-bold text-ink/70">
            Start running projects on ORKA.
          </p>
          <SignupForm />
        </div>

        <p className="text-center text-sm font-bold text-white/70">
          Just exploring?{" "}
          <a href="/" className="text-lime underline">
            Back to home
          </a>
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Build**

Run:
```bash
pnpm build 2>&1 | tail -30
```
Expected: `/signup` compiles; no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/signup/page.tsx
git commit -m "feat(auth): add /signup page"
```

---

### Task 8: Login stub

**Files:**
- Create: `frontend/app/login/page.tsx`

**Interfaces:**
- Produces: a minimal `/login` page that links back to `/signup` (full login is a later Phase 1 slice).

- [ ] **Step 1: Write the stub**

```tsx
import Link from "next/link";

export const metadata = {
  title: "Log in · ORKA",
  description: "Log in to ORKA.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 text-white">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-center text-ink shadow-hard md:p-8">
        <h1 className="display text-3xl uppercase">Log in</h1>
        <p className="mt-2 text-sm font-bold text-ink/70">
          Login is coming soon. In the meantime, create a new account.
        </p>
        <Link
          href="/signup"
          className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">
          Create account
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Build**

Run:
```bash
pnpm build 2>&1 | tail -20
```
Expected: `/login` compiles.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/login/page.tsx
git commit -m "feat(auth): add minimal /login stub"
```

---

### Task 9: Fix the Navbar `/signup` link

**Files:**
- Modify: `frontend/components/Navbar.tsx`

**Interfaces:**
- Consumes: existing `Link` import (already present at top of file).
- Produces: `/signup` opens in-app (no new tab), so the session/middleware flow works.

- [ ] **Step 1: Replace the two `/signup` `<a>` tags with `Link`**

In the desktop CTA (around line 122) replace:
```tsx
        <a
          href="/signup"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full px-6 py-3 text-[18px] font-black uppercase text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-4 hover:border-white md:flex">
          Sign Up
        </a>
```
with:
```tsx
        <Link
          href="/signup"
          className="hidden rounded-full px-6 py-3 text-[18px] font-black uppercase text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-4 hover:border-white md:flex">
          Sign Up
        </Link>
```

In the mobile menu CTA (around line 200) replace:
```tsx
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="mt-2 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black uppercase text-white transition-all hover:border-white hover:border-2  hover:text-white">
              Sign Up
            </a>
```
with:
```tsx
            <Link
              href="/signup"
              onClick={closeMobileMenu}
              className="mt-2 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black uppercase text-white transition-all hover:border-white hover:border-2 hover:text-white">
              Sign Up
            </Link>
```

- [ ] **Step 2: Lint**

Run:
```bash
pnpm lint
```
Expected: PASS (no unused-var errors; `GITHUB_URL` is still used by the GitHub CTA).

- [ ] **Step 3: Commit**

```bash
git add frontend/components/Navbar.tsx
git commit -m "fix(nav): make /signup a real in-app link"
```

---

### Task 10: Document the browser Supabase env vars

**Files:**
- Modify: `frontend/.env.example`

**Interfaces:**
- Produces: documented `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The human copies `.env.example` → `.env.local` and fills real values.

- [ ] **Step 1: Add the browser-safe Supabase keys**

In `frontend/.env.example`, after the existing `# ── Supabase ──` block (lines 1-6), add:
```bash
# ── Supabase (browser-safe, NEXT_PUBLIC_ exposed to client) ── for auth + session cookies
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 2: Lint (no TS change, just confirm nothing broke)**

Run:
```bash
pnpm lint
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add frontend/.env.example
git commit -m "docs: document NEXT_PUBLIC Supabase keys for auth"
```

---

### Task 11: Final build + lint + manual verification

**Files:**
- Verify: whole `frontend/`

- [ ] **Step 1: Lint**

Run (from `frontend/`):
```bash
pnpm lint
```
Expected: PASS, no errors.

- [ ] **Step 2: Production build (also runs tsc type-check)**

Run:
```bash
pnpm build 2>&1 | tail -40
```
Expected: build succeeds; `/signup`, `/login` routes present; middleware compiled.

- [ ] **Step 3: Manual verification (requires a configured Supabase project)**

With `.env.local` set (all four Supabase keys) and the full `phase1_schema.sql` (including 1.1.3b/1.1.11b) run in the Supabase SQL editor:
1. `pnpm dev`, open `/signup`.
2. Mode A email/password → submit → confirm email → redirected to `/dashboard` (or "check your inbox" if confirmation required).
3. Mode A "Continue with Google" → account created (`custody_mode='orka'`).
4. Mode B "Connect Freighter" (extension installed) → masked pubkey shown; submit → `profiles` row has `custody_mode='freighter'` + `stellar_address`.
5. Mode B with Freighter absent → "Install Freighter to continue", submit hidden/disabled.
6. Duplicate email → friendly "already registered" error.
7. Confirm a `profiles` row is created per signup with correct `role`, `custody_mode`, and (Mode B) `stellar_address`.

- [ ] **Step 4: Final commit (if any fixes were needed)**

```bash
git add -A
git commit -m "feat(auth): complete signup page (Mode A + Mode B)"
```

---

## Self-Review (against spec §1–§12)

- **§2 Goals 1-4:** `/signup` creates a real Supabase user (Task 6-7), captures `full_name`/`role`/`custody_mode`/`stellar_address` (Task 2 trigger + Task 6 metadata), httpOnly cookie sessions (Tasks 3-5), matches design system (Tasks 6-7 reuse palette/`.display`/`.shadow-hard`/error-banner). ✅
- **§4 Decisions:** real Supabase Auth client-side (Task 6), both modes functional (Task 6), Freighter re-login documented as limitation (§12), fields = email+password+full name+role (Task 6), `@supabase/ssr` + middleware (Tasks 3-5). ✅
- **§5.1 Mode A:** `signUp` with `data`, Google via `signInWithOAuth` with `data` + `redirectTo` (Task 6). ✅
- **§5.2 Mode B:** `getPublicKey`/`requestAccess`, masked key, graceful missing-extension message (Task 6). ✅
- **§6 Data model:** `role` column + enriched `handle_new_user` appended idempotently (Task 2), does not redefine `profiles`. ✅
- **§7 Page design:** layout, mode toggle, Mode A/B panels, footer login link (Task 6-7). ✅
- **§8 Errors:** client validation (email/password≥8/role), Supabase error mapping, Freighter-absent message, confirm-email success state, network failure (Task 6). ✅
- **§9 Env:** `NEXT_PUBLIC_*` documented (Task 10). ✅
- **§10 Deps:** `@supabase/ssr` + `@stellar/freighter-api` (Task 1). ✅
- **§11 Verification:** lint + build (Task 11); manual Supabase checks listed. ✅
- **§12 Limitations:** `/dashboard` (redirect target, built later) and `/login` stub (Task 8) — both explicitly non-goals handled. ✅
- **Placeholder scan:** no TBD/TODO; every code step shows real code; verification uses the repo's actual gates. ✅
- **Type consistency:** `createClient()` (no args) used identically in Tasks 3/4/6/7; `mode` is `"orka" | "freighter"`; `role` is the string union value; metadata keys match the trigger's `raw_user_meta_data` reads. ✅
