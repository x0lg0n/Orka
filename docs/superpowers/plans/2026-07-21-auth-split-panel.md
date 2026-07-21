# Auth Split-Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the full-marketing-chrome auth layout with a two-panel split layout that builds trust and drives signups.

**Architecture:** A shared `AuthSplitLayout` in `app/(auth)/layout.tsx` renders a fixed left marketing panel and slots `{children}` into the right panel. Each auth page strips to just its form content. A new `login/page.tsx` re-exports signin to fix broken `/login` links.

**Tech Stack:** Next.js 16 App Router, Tailwind v4, React Server Components

## Global Constraints

- Existing form components (`SignupForm`, `WalletSignIn`) are unchanged — no auth logic changes
- Use existing brand colors (`bg-night`, `bg-paper`, `text-lime`, `text-violet`)
- Use existing testimonial data from `lib/content/testimonials.ts`
- Use existing logo from `public/Logo/LOGO.svg`
- No new npm packages
- Route `/login` must resolve (create re-export, don't rename `signin`)
- Mobile: panels stack vertically below `lg` breakpoint

---
### Task 1: Route fix — create `/login` page

**Files:**
- Create: `app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `/login` resolves to the signin page

- [ ] **Step 1: Create the re-export page**

Create `frontend/app/(auth)/login/page.tsx`:

```tsx
export { default } from "../signin/page";
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: no errors, `/login` route appears in build output

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(auth\)/login/page.tsx
git commit -m "fix: add /login route re-exporting signin page"
```

---
### Task 2: Create `AuthMarketingPanel` component

**Files:**
- Create: `components/auth/AuthMarketingPanel.tsx`

**Interfaces:**
- Consumes: nothing (self-contained)
- Produces: `<AuthMarketingPanel />` exported component used by the layout

- [ ] **Step 1: Create the component**

Create `frontend/components/auth/AuthMarketingPanel.tsx`:

```tsx
import Image from "next/image";
import { ShieldCheck, FileText, ExternalLink } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Milestone escrow",
    desc: "Funds release on approval, not promises",
  },
  {
    icon: FileText,
    title: "Smart contracts",
    desc: "Proposals & agreements on Stellar",
  },
  {
    icon: ExternalLink,
    title: "Client portal",
    desc: "Share, sign, and get paid",
  },
];

export default function AuthMarketingPanel() {
  return (
    <aside className="flex h-full flex-col justify-center px-8 py-12 lg:px-12">
      <div className="mb-8 flex items-center gap-3">
        <Image
          src="/Logo/LOGO.svg"
          alt="ORKA"
          width={32}
          height={32}
          className="size-8"
        />
        <span className="text-lg font-bold text-white">ORKA</span>
      </div>

      <h2 className="max-w-[18ch] text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
        Ship work.
        <br />
        Get paid.
        <br />
        <span className="text-lime">On Stellar.</span>
      </h2>

      <div className="mt-10 space-y-5">
        {features.map((f) => (
          <div key={f.title} className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10">
              <f.icon className="h-4 w-4 text-lime" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{f.title}</p>
              <p className="text-sm text-white/60">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-4 border-t border-white/10 pt-8">
        <figure>
          <blockquote className="text-sm leading-relaxed text-white/80">
            &ldquo;ORKA makes client agreements painless. The smart contract
            integration is a game-changer for freelance work.&rdquo;
          </blockquote>
          <figcaption className="mt-2 text-xs font-bold text-white/50">
            @buildwithorka
          </figcaption>
        </figure>
        <figure>
          <blockquote className="text-sm leading-relaxed text-white/80">
            &ldquo;Milestone-based escrow means I never chase payments anymore.
            This is how project management should work.&rdquo;
          </blockquote>
          <figcaption className="mt-2 text-xs font-bold text-white/50">
            @buildwithorka
          </figcaption>
        </figure>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/components/auth/AuthMarketingPanel.tsx
git commit -m "feat: AuthMarketingPanel component"
```

---
### Task 3: Replace `app/(auth)/layout.tsx` with split-panel layout

**Files:**
- Modify: `app/(auth)/layout.tsx` — full replacement

**Interfaces:**
- Consumes: `AuthMarketingPanel` from Task 2
- Produces: layout that wraps all auth pages with split-panel chrome

- [ ] **Step 1: Replace layout.tsx**

Write `frontend/app/(auth)/layout.tsx`:

```tsx
import type { ReactNode } from "react";
import AuthMarketingPanel from "@/components/auth/AuthMarketingPanel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex-1 bg-night lg:basis-[45%]">
        <AuthMarketingPanel />
      </div>
      <main className="flex flex-1 items-center justify-center bg-paper px-4 py-10 lg:basis-[55%]">
        <div className="flex w-full max-w-md flex-col">
          <a
            href="/"
            className="mb-6 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            &larr; Back to orka.io
          </a>
          {children}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-foreground">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>.
          </p>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `pnpm build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(auth\)/layout.tsx
git commit -m "feat: auth split-panel layout (no nav/footer)"
```

---
### Task 4: Clean up auth pages — strip outer chrome

**Files:**
- Modify: `app/(auth)/signup/page.tsx` — remove logo, heading wrapper, back link (layout provides them)
- Modify: `app/(auth)/signin/page.tsx` — same
- Other auth pages (forgot-password, reset-password, verify-email) are already clean — no change needed

- [ ] **Step 1: Clean up signup page**

Write `frontend/app/(auth)/signup/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignupForm from "@/components/SignupForm";

export const metadata = {
  title: "Sign Up · ORKA",
  description: "Create your ORKA account.",
};

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/workspaces");

  return (
    <div>
      <h1 className="display mb-1 text-3xl uppercase">Create your account</h1>
      <p className="mb-6 text-sm font-bold text-foreground/70">
        Start running projects on ORKA.
      </p>
      <SignupForm />
    </div>
  );
}
```

- [ ] **Step 2: Clean up signin page**

Write `frontend/app/(auth)/signin/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import WalletSignIn from "@/components/WalletSignIn";

export const metadata = {
  title: "Sign In · ORKA",
  description: "Sign in to ORKA.",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect("/workspaces");

  return (
    <div>
      <h1 className="display mb-1 text-3xl uppercase">Sign in</h1>
      <p className="mb-6 text-sm font-bold text-foreground/70">
        Welcome back to ORKA.
      </p>
      <WalletSignIn />
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/app/\(auth\)/signup/page.tsx frontend/app/\(auth\)/signin/page.tsx
git commit -m "refactor: strip outer chrome from signup/signin pages"
```

---
### Task 5: Verify full build

**Files:** none (verification only)

- [ ] **Step 1: Full production build**

Run: `pnpm build`
Expected: all routes compile, no type errors
Check that `/login` and `/signin` both appear in build output

- [ ] **Step 2: Final confirmation**

The signup/signin/forgot-password pages should now render with:
- Dark left panel: ORKA logo, headline, 3 feature bullets, testimonial quotes
- Light right panel: form content, "Back to orka.io" link, terms/privacy text
- No Navbar, no Footer
- Mobile: stacked vertically
