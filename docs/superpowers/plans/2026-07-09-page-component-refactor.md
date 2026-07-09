# Landing Page Component Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `frontend/app/page.tsx` (single ~527-line component) into a production component architecture: a thin composition root, per-section components, a relocated `WaitlistForm`, and a typed `lib/content.ts` content module. Pure refactor — output must be pixel-identical.

**Architecture:** `page.tsx` becomes a composition root importing 10 section components + `WaitlistForm`. All data/copy lives in `lib/content.ts` with exported types. Static sections are server components; only `Navbar` and `WaitlistForm` are client components.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v3, TypeScript strict mode, `pnpm`

## Global Constraints

- Package manager: `pnpm` (never npm/yarn)
- Working directory for all commands: `frontend/`
- TypeScript `strict: true` — no implicit `any`, no type errors
- `pnpm build` must pass with zero errors after the full refactor
- `pnpm lint` must be clean
- **Pure refactor**: every Tailwind class, arbitrary value, decoration, and copy string copied verbatim from current `page.tsx`. No visual/behavioral change.
- Component contract: section components are `export default function X()` with NO props; they import data from `lib/content.ts`.
- Only `Navbar.tsx` and `WaitlistForm.tsx` carry `"use client"`. `Faq.tsx` uses native `<details>` (server component). All other sections are server components.
- `productLinks` moves from `Navbar.tsx` into `lib/content.ts`; `Navbar.tsx` imports it.

---

### Task 1: Create `lib/content.ts` (typed content module)

**Files:**
- Create: `frontend/lib/content.ts`

**Interfaces:**
- Consumes: nothing
- Produces: exported `Engine`, `Step`, `Faq` types; exported `engines`, `steps`, `faqs`, `productLinks` constants

- [ ] **Step 1: Create `frontend/lib/content.ts`**

Create the file with the exact data from `page.tsx` (lines 6–51) plus `productLinks` (currently in `Navbar.tsx` lines 7–11):

```ts
export type Engine = {
  title: string;
  copy: string;
  color: string;
};

export type Step = [string, string, string, string[][]?];

export type Faq = [string, string];

export const engines: Engine[] = [
  {
    title: "Agreement Engine",
    copy: "AI turns rough client briefs into scoped proposals, contracts, pricing, and fundable milestones.",
    color: "bg-orange",
  },
  {
    title: "Escrow & Settlement",
    copy: "Soroban smart contracts lock client funds and release them only when milestone conditions are met.",
    color: "bg-violet",
  },
  {
    title: "Verification Engine",
    copy: "AI checks GitHub, Figma, content, links, and delivery evidence before triggering payment release.",
    color: "bg-coral",
  },
  {
    title: "Email & Payouts",
    copy: "Automated invoices, multi-currency records, tax categories, and back-office reporting workflows.",
    color: "bg-coral",
  },
  {
    title: "Financial Ledger",
    copy: "Every transaction tracked, categorized, and ready for reporting — no spreadsheets needed.",
    color: "bg-teal",
  },
  {
    title: "Analytics & Reporting",
    copy: "Real-time dashboards for project health, cash flow, and team performance across borders.",
    color: "bg-ink",
  },
];

export const steps: Step[] = [
  ["01", "Proposal is generated", "The service brief becomes a clear scope, timeline, agreement, and milestone schedule.", [["Scope", "Timeline", "Agreement"], ["Milestones", "Pricing", "Deliverables"], ["Review", "Approve", "Sign"]]],
  ["02", "Escrow is funded", "Clients pay in a familiar flow while ORKA handles Stellar infrastructure underneath."],
  ["03", "Work is verified", "AI reviews delivery evidence and gives the client a clean review trail."],
  ["04", "Payouts execute", "Funds release, currency routes, invoices send, and the ledger updates automatically."],
];

export const faqs: Faq[] = [
  ["Is ORKA a marketplace?", "No. ORKA starts after the sale, helping agencies and freelancers operate projects, escrow, verification, payouts, and finance."],
  ["Do users need crypto wallets?", "No. ORKA is designed as a Web2 product experience, using Stellar and Soroban under the hood."],
  ["Who is it for first?", "Mid-sized digital agencies, global freelancers, remote startups, and niche service marketplaces."],
  ["Is the product live?", "This landing page is for the early waitlist and design partners while the hackathon/pre-seed foundation is built."],
];

export const productLinks = [
  { label: "Engines", href: "#engines" },
  { label: "Method", href: "#method" },
  { label: "FAQ", href: "#faq" },
];
```

- [ ] **Step 2: Verify file and types compile**

```bash
cd frontend && pnpm exec tsc --noEmit 2>&1 | head
```

Expected: no errors (or only pre-existing unrelated errors — there should be none for this new file).

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/content.ts
git commit -m "feat: add typed content module for landing page"
```

---

### Task 2: Create `WaitlistForm.tsx` (relocate from page.tsx)

**Files:**
- Create: `frontend/components/WaitlistForm.tsx`
- Modify: `frontend/components/Navbar.tsx` (import `productLinks` from `lib/content` — see Task 8; NOT this task)
- Modify: `frontend/app/page.tsx` (remove `WaitlistForm` definition — done in Task 11)

**Interfaces:**
- Consumes: nothing (self-contained; renders its own form + fetch)
- Produces: `export default function WaitlistForm({ compact }: { compact?: boolean })`

- [ ] **Step 1: Create `frontend/components/WaitlistForm.tsx`**

Copy lines 71–176 from current `page.tsx` verbatim, adding `"use client"` at the top and the `WaitlistResponse` type. The full content:

```tsx
"use client";

import { FormEvent, useState } from "react";

type WaitlistResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

function getFriendlyError(status: number, error?: string) {
  if (status === 400) {
    return error || "Please check your email and try again.";
  }

  if (status === 503) {
    return "Waitlist is taking a short break. Please try again in a minute.";
  }

  return "We could not save your spot just now. Please try again shortly.";
}

export default function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const errorId = compact ? "hero-waitlist-error" : "footer-waitlist-error";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please add a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = (await res.json().catch(() => ({}))) as WaitlistResponse;

      if (!res.ok) {
        setError(getFriendlyError(res.status, data.error));
        return;
      }

      setSubmitted(true);
      formElement.reset();
    } catch {
      setError("We could not connect just now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[14px] border-2 border-ink bg-lime p-5 text-ink shadow-hard">
        <p className="display text-2xl uppercase">You&apos;re on the list!</p>
        <p className="mt-2 text-sm font-bold">
          We&apos;ll reach out when design partner slots open.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className={compact ? "flex flex-col gap-3 sm:flex-row" : "flex flex-col gap-3 md:flex-row md:items-end"}>
        <div className="flex-1">
          <input
            name="name"
            placeholder="Your name"
            className="min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20"
          />
        </div>
        <div className="flex-[1.5]">
          <input
            name="email"
            type="email"
            placeholder="Email address"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Joining..." : (
            <>
              Join waitlist
              <span className="grid size-6 place-items-center rounded-full bg-ink text-white transition group-hover:bg-white group-hover:text-ink">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
              </span>
            </>
          )}
        </button>
      </form>
      {error ? (
        <div
          id={errorId}
          role="status"
          className="mt-3 flex items-start gap-3 rounded-[14px] border-2 border-ink/15 bg-bone px-4 py-3 text-sm font-bold leading-5 text-ink shadow-[4px_4px_0_rgba(6,26,43,0.15)]"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-orange text-xs font-black text-white">
            !
          </span>
          <p>{error}</p>
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/WaitlistForm.tsx
git commit -m "feat: extract WaitlistForm into its own client component"
```

---

### Task 3: Create `Hero.tsx`

**Files:**
- Create: `frontend/components/Hero.tsx`

**Interfaces:**
- Consumes: `Navbar` (from `./Navbar`), `WaitlistForm` (from `./WaitlistForm`)
- Produces: `export default function Hero()`

- [ ] **Step 1: Create `frontend/components/Hero.tsx`**

Copy lines 182–275 from `page.tsx` verbatim (the hero `<section>`), replacing the inline `<WaitlistForm compact />` with the imported component. It is a server component (no `"use client"` — Navbar and WaitlistForm manage their own client needs).

```tsx
import Image from "next/image";
import Navbar from "./Navbar";
import WaitlistForm from "./WaitlistForm";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-b-[42px] bg-ink px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
      {/* Floating decorations */}
      <span className="absolute left-[8%] top-[18%] text-3xl text-lime opacity-60 select-none">+</span>
      <span className="absolute right-[12%] top-[10%] text-2xl text-orange opacity-50 select-none">✦</span>
      <span className="absolute left-[4%] bottom-[30%] text-xl text-violet opacity-40 select-none">★</span>
      <span className="absolute right-[6%] bottom-[20%] text-3xl text-coral opacity-40 select-none">+</span>

      {/* Nav */}
      <Navbar />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-7xl pt-16 pb-8">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <span className="rounded-full bg-coral/20 border border-coral/40 px-4 py-1.5 text-xs font-black uppercase text-coral">
            AI operations + programmable finance
          </span>
          <span className="sticker rounded-full bg-lime px-4 py-1.5 text-xs font-black uppercase text-ink shadow-hard">
            #1 Financial OS for Service Work
          </span>
        </div>

        <h1 className="display mx-auto max-w-5xl text-center text-[4.2rem] uppercase text-white sm:text-[6.4rem] lg:text-[7.3rem]">
          Autonomous financial{" "}
          <span className="text-orange">OS</span> for{" "}
          <span className="text-violet">global</span> service work.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-semibold leading-8 text-white/78">
          ORKA eliminates the admin tax of proposals, escrow, milestone verification, payouts,
          invoices, and financial records for agencies and freelancers working across borders.
        </p>

        <div className="mt-8 flex justify-center ">
          <div className="rounded-[18px] bg-white p-5 text-ink md:p-6">
            <WaitlistForm compact />
          </div>
        </div>
      </div>

      {/* Stats + tag cloud row */}
      <div className="relative z-10 mx-auto mt-12 flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        {/* Tag cloud */}
        <div className="flex flex-wrap gap-2 max-w-md">
          {["Business Growth", "Success", "Performance Metrics", "Global Payments", "AI Automation"].map((tag, i) => (
            <span
              key={tag}
              className={`sticker rounded-full px-4 py-1.5 text-xs font-black uppercase shadow-hard ${
                i === 0 ? "bg-orange text-white rotate-[-3deg]" :
                i === 1 ? "bg-coral text-white rotate-[2deg]" :
                i === 2 ? "bg-lime text-ink rotate-[-1deg]" :
                i === 3 ? "bg-violet text-white rotate-[3deg]" :
                "bg-teal text-white rotate-[-2deg]"
              }`}
            >
              {tag}
            </span>
          ))}
          <p className="w-full mt-3 display text-3xl uppercase text-white/90 leading-tight">
            5X achieved ROI on ad spend consistently! Average increase in ROI for our clients.
          </p>
        </div>

        {/* Stat cards */}
        <div className="flex gap-4">
          <div className="cut-corner rounded-[14px] bg-teal p-5 text-white shadow-hard min-w-[160px]">
            <div className="flex items-start justify-between">
              <p className="display text-4xl">50+</p>
              <span className="grid size-8 place-items-center rounded-full bg-white text-ink">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
              </span>
            </div>
            <p className="mt-2 text-xs font-bold opacity-80">Design partners<br />on the waitlist</p>
          </div>
          <div className="cut-corner rounded-[14px] bg-lime p-5 text-ink shadow-hard min-w-[160px]">
            <div className="flex items-start justify-between">
              <p className="display text-4xl">99%</p>
              <span className="grid size-8 place-items-center rounded-full bg-white text-ink">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
              </span>
            </div>
            <p className="mt-2 text-xs font-bold opacity-80">Admin tasks<br />eliminated</p>
          </div>
        </div>
      </div>

      {/* Sticker decorations */}
      <div className="sticker absolute -left-4 top-[40%] rounded-full bg-coral px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block">
        No wallet drama
      </div>
      <div className="sticker absolute -right-4 top-[25%] rounded-full bg-violet px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block" style={{ transform: "rotate(6deg)" }}>
        Soroban powered
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/Hero.tsx
git commit -m "feat: extract Hero section component"
```

---

### Task 4: Create `ProblemCards.tsx`

**Files:**
- Create: `frontend/components/ProblemCards.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `export default function ProblemCards()`

- [ ] **Step 1: Create `frontend/components/ProblemCards.tsx`** (copy lines 277–291 verbatim)

```tsx
export default function ProblemCards() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        {[
          ["Admin tax", "Manual scope, contracts, payment chasing, invoices, and tax records eat the margin."],
          ["Global friction", "Bank wires, PayPal fees, currency delays, and trust gaps slow down international work."],
          ["ORKA shift", "AI coordinates the work lifecycle while programmable escrow executes the money layer."]
        ].map(([title, copy], index) => (
          <article key={title} className={`cut-corner border-2 border-ink p-6 ${index === 1 ? "bg-coral text-white" : index === 2 ? "bg-lime text-ink" : "bg-white text-ink"}`}>
            <p className="display text-5xl uppercase">{title}</p>
            <p className="mt-4 text-sm font-bold leading-6">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/ProblemCards.tsx
git commit -m "feat: extract ProblemCards section component"
```

---

### Task 5: Create `Engines.tsx`

**Files:**
- Create: `frontend/components/Engines.tsx`

**Interfaces:**
- Consumes: `engines` from `@/lib/content` (or `../lib/content`)
- Produces: `export default function Engines()`

- [ ] **Step 1: Create `frontend/components/Engines.tsx`** (copy lines 293–333, replacing inline `engines` array with import)

```tsx
import { engines } from "../lib/content";

export default function Engines() {
  return (
    <section id="engines" className="px-4 py-10 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="section-label">Our Engines!</p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="display max-w-2xl text-6xl uppercase md:text-7xl">Services designed to drive real results.</h2>
          <p className="max-w-md text-sm font-bold leading-6 text-ink/70">
            ORKA combines AI workflow automation with Stellar settlement rails, so the work and money move together.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {engines.map((engine) => (
            <article
              key={engine.title}
              className={`cut-corner relative min-h-[220px] rounded-[14px] border-2 border-ink p-6 text-white shadow-hard ${engine.color}`}
            >
              <h3 className="display text-3xl uppercase">{engine.title}</h3>
              <p className="mt-4 max-w-[80%] text-sm font-bold leading-6">{engine.copy}</p>
              <span className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full bg-white text-xl font-black text-ink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/Engines.tsx
git commit -m "feat: extract Engines section component"
```

---

### Task 6: Create `WhyChooseUs.tsx`

**Files:**
- Create: `frontend/components/WhyChooseUs.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `export default function WhyChooseUs()`

- [ ] **Step 1: Create `frontend/components/WhyChooseUs.tsx`** (copy lines 335–360 verbatim)

```tsx
export default function WhyChooseUs() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="section-label">Why Choose Us!</p>
          <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Why ORKA is the trusted choice.</h2>
          <p className="mt-5 text-base font-bold leading-7 text-ink/70">
            Clients get familiar links, email access, and simple approvals. Under the hood, ORKA manages
            smart-contract escrow, sponsored transactions, path payments, verification trails, and ledgers.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Guaranteed trust", "Funds are locked before work starts and released against milestone rules."],
            ["Zero-touch ops", "AI handles project administration that usually needs managers and accountants."],
            ["Borderless payouts", "Stellar routing supports fast, low-cost settlement across currencies."],
            ["Data flywheel", "Every verified delivery teaches ORKA what good work looks like."]
          ].map(([title, copy]) => (
            <div key={title} className="cut-corner rounded-[14px] border-2 border-ink bg-white p-6">
              <h3 className="display text-3xl uppercase">{title}</h3>
              <p className="mt-3 text-sm font-bold leading-6 text-ink/68">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/WhyChooseUs.tsx
git commit -m "feat: extract WhyChooseUs section component"
```

---

### Task 7: Create `HowItWorks.tsx`

**Files:**
- Create: `frontend/components/HowItWorks.tsx`

**Interfaces:**
- Consumes: `steps` from `../lib/content`
- Produces: `export default function HowItWorks()`

- [ ] **Step 1: Create `frontend/components/HowItWorks.tsx`** (copy lines 362–412, replacing inline `steps` with import)

```tsx
import { steps } from "../lib/content";

export default function HowItWorks() {
  return (
    <section id="method" className="bg-bone px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="section-label">How We Work</p>
        <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Our working method.</h2>

        {/* Step 1 — expanded */}
        <div className="mt-8 cut-corner rounded-[20px] bg-orange p-6 text-white md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="flex items-start gap-4">
              <span className="display text-7xl">1.</span>
              <div>
                <h3 className="display text-4xl uppercase">Proposal is generated</h3>
                <p className="mt-2 max-w-md text-sm font-bold leading-6 opacity-80">
                  The service brief becomes a clear scope, timeline, agreement, and milestone schedule.
                </p>
              </div>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-ink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps[0][3]?.map((group, gi) => (
              <div key={gi} className="rounded-[12px] bg-white p-4 text-ink">
                <p className="text-xs font-black uppercase opacity-60">Phase {gi + 1}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {group.map((tag) => (
                    <span key={tag} className="rounded-full bg-ink/10 px-3 py-1 text-xs font-bold">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps 2–4 */}
        {steps.slice(1).map(([number, title, copy]) => (
          <div key={title} className="flex items-center gap-4 border-b-2 border-ink/12 py-7 md:gap-6">
            <span className="display text-6xl">{number}.</span>
            <div className="flex-1">
              <h3 className="display text-3xl uppercase">{title}</h3>
              <p className="mt-1 text-sm font-bold leading-6 text-ink/70">{copy}</p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/HowItWorks.tsx
git commit -m "feat: extract HowItWorks section component"
```

---

### Task 8: Update `Navbar.tsx` to import `productLinks` from `lib/content`

**Files:**
- Modify: `frontend/components/Navbar.tsx` (lines 7–11)

**Interfaces:**
- Consumes: `productLinks` from `../lib/content`
- Produces: unchanged `Navbar` default export

- [ ] **Step 1: Replace the inline `productLinks` array with an import**

In `frontend/components/Navbar.tsx`, remove these lines (7–11):

```tsx
const productLinks = [
  { label: "Engines", href: "#engines" },
  { label: "Method", href: "#method" },
  { label: "FAQ", href: "#faq" },
];
```

Add at the top with the other imports (after the react import):

```tsx
import { productLinks } from "../lib/content";
```

- [ ] **Step 2: Verify build**

```bash
cd frontend && pnpm build 2>&1 | grep -iE "error|✓|compiled" | head
```

Expected: compiled successfully, no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/Navbar.tsx
git commit -m "refactor: source productLinks from content module"
```

---

### Task 9: Create `Audience.tsx`

**Files:**
- Create: `frontend/components/Audience.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `export default function Audience()`

- [ ] **Step 1: Create `frontend/components/Audience.tsx`** (copy lines 414–430 verbatim)

```tsx
export default function Audience() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-[24px] bg-violet p-6 text-white md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <h2 className="display text-6xl uppercase md:text-7xl">
            Built for the people already moving global work.
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {["Agencies managing cross-border teams", "Freelancers shipping milestone projects", "Remote startups paying contractors", "Marketplaces needing escrow APIs"].map((item) => (
              <div key={item} className="rounded-[12px] border-2 border-white/70 bg-white/12 p-4 text-sm font-black uppercase">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/Audience.tsx
git commit -m "feat: extract Audience section component"
```

---

### Task 10: Create `Dogfooding.tsx`

**Files:**
- Create: `frontend/components/Dogfooding.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `export default function Dogfooding()`

- [ ] **Step 1: Create `frontend/components/Dogfooding.tsx`** (copy lines 432–447 verbatim)

```tsx
export default function Dogfooding() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="section-label">Dogfooded from day one</p>
          <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Oreenza becomes the first proving ground.</h2>
        </div>
        <div className="grid gap-4">
          {["Migrate real agency projects into ORKA.", "Log every time the team leaves ORKA for Notion, Gmail, Wise, or spreadsheets.", "Use real transaction volume to harden escrow, verification, and ledger workflows.", "Open the product to agencies, then clients, then marketplaces."].map((item) => (
            <div key={item} className="cut-corner rounded-[14px] border-2 border-ink bg-white p-5 text-base font-black">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/Dogfooding.tsx
git commit -m "feat: extract Dogfooding section component"
```

---

### Task 11: Create `Faq.tsx`

**Files:**
- Create: `frontend/components/Faq.tsx`

**Interfaces:**
- Consumes: `faqs` from `../lib/content`
- Produces: `export default function Faq()` (server component — native `<details>`)

- [ ] **Step 1: Create `frontend/components/Faq.tsx`** (copy lines 449–474, replacing inline `faqs` with import)

```tsx
import { faqs } from "../lib/content";

export default function Faq() {
  return (
    <section id="faq" className="bg-white px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="section-label">FAQ</p>
          <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Your questions answered.</h2>
          <p className="mt-5 text-sm font-bold leading-6 text-ink/70">
            Everything you need to know about ORKA. We have answers to your questions about our services and approach.
          </p>
        </div>
        <div className="grid gap-4">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group border-b-2 border-ink/12 pb-4">
              <summary className="flex cursor-pointer list-none items-center gap-4 text-base font-black uppercase">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white">
                  <span className="group-open:hidden text-lg leading-none">+</span>
                  <span className="hidden group-open:inline text-lg leading-none">−</span>
                </span>
                <span>{question}</span>
              </summary>
              <p className="mt-3 ml-12 max-w-3xl text-sm font-bold leading-6 text-ink/70">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/Faq.tsx
git commit -m "feat: extract Faq section component"
```

---

### Task 12: Create `WaitlistCta.tsx`

**Files:**
- Create: `frontend/components/WaitlistCta.tsx`

**Interfaces:**
- Consumes: `WaitlistForm` from `./WaitlistForm`
- Produces: `export default function WaitlistCta()`

- [ ] **Step 1: Create `frontend/components/WaitlistCta.tsx`** (copy lines 476–504 verbatim)

```tsx
import WaitlistForm from "./WaitlistForm";

export default function WaitlistCta() {
  return (
    <section id="waitlist" className="px-4 py-16 md:px-8 lg:px-12">
      <div className=" relative overflow-hidden mx-auto max-w-7xl rounded-[28px] bg-ink p-6 text-white md:p-10 lg:rounded-[36px]">
        {/* Floating stickers */}
        <span className="sticker absolute right-[10%] top-[15%] rounded-full bg-coral px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block">
          Brand Strategy
        </span>
        <span className="sticker absolute right-[15%] top-[25%] rounded-full bg-lime px-4 py-2 text-xs font-black uppercase text-ink shadow-hard hidden lg:block" style={{ transform: "rotate(5deg)" }}>
          Performance Metrics
        </span>
        <span className="sticker absolute right-[5%] bottom-[15%] rounded-full bg-violet px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block" style={{ transform: "rotate(-3deg)" }}>
          Business Growth
        </span>
        <span className="absolute right-[8%] bottom-[20%] text-4xl text-orange opacity-50 select-none hidden lg:block">*</span>
        <span className="absolute left-[5%] top-[50%] text-2xl text-lime opacity-40 select-none hidden lg:block">+</span>

        <div className="relative z-10 gap-8">
          <div className=" text-center">
            <h2 className="display mt-2 text-5xl uppercase md:text-6xl lg:text-7xl">
              Ready to partner with ORKA &amp; unlock the{" "}
              <span className="text-orange">full</span> potential?
            </h2>
          </div>
          <div className="rounded-[18px] bg-white p-5 text-ink md:p-6">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/WaitlistCta.tsx
git commit -m "feat: extract WaitlistCta section component"
```

---

### Task 13: Create `Footer.tsx`

**Files:**
- Create: `frontend/components/Footer.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `export default function Footer()`

- [ ] **Step 1: Create `frontend/components/Footer.tsx`** (copy lines 506–539 verbatim)

```tsx
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="px-4 pb-10 pt-16 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 border-t-2 border-ink/15 pt-8 md:flex-row">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full">
              <Image src="/Logo/LOGO.svg" alt="ORKA" width={48} height={48} className="size-full object-contain" />
            </span>
            <span className="display text-[32px] uppercase">ORKA</span>
          </div>
          <p className="mt-4 text-sm font-bold leading-6 text-ink/60">
            Autonomous financial operations for the global service economy. AI-powered proposals, escrow, verification, and payouts.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {[
            ["Engines", "#engines"],
            ["Method", "#method"],
            ["FAQ", "#faq"],
            ["Waitlist", "#waitlist"],
          ].map(([label, href]) => (
            <a key={label} href={href} className="flex items-center gap-3 text-sm font-black uppercase text-ink transition hover:text-violet">
              <span className="grid size-8 place-items-center rounded-full bg-violet text-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
              </span>
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-ink/10 pt-6 text-center text-xs font-bold text-ink/40">
        Copyright © 2026 ORKA. All rights reserved.
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/components/Footer.tsx
git commit -m "feat: extract Footer component"
```

---

### Task 14: Rewrite `page.tsx` as composition root

**Files:**
- Modify: `frontend/app/page.tsx` (full rewrite — remove all section markup + `WaitlistForm` definition, keep only `Home()` composing the 10 section components)

**Interfaces:**
- Consumes: `Hero`, `ProblemCards`, `Engines`, `WhyChooseUs`, `HowItWorks`, `Audience`, `Dogfooding`, `Faq`, `WaitlistCta`, `Footer` (all from `../components/...`)
- Produces: `export default function Home()`

- [ ] **Step 1: Replace entire `page.tsx` content with the composition root**

The full new `frontend/app/page.tsx`:

```tsx
import Hero from "../components/Hero";
import ProblemCards from "../components/ProblemCards";
import Engines from "../components/Engines";
import WhyChooseUs from "../components/WhyChooseUs";
import HowItWorks from "../components/HowItWorks";
import Audience from "../components/Audience";
import Dogfooding from "../components/Dogfooding";
import Faq from "../components/Faq";
import WaitlistCta from "../components/WaitlistCta";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="overflow-hidden bg-paper">
      <Hero />
      <ProblemCards />
      <Engines />
      <WhyChooseUs />
      <HowItWorks />
      <Audience />
      <Dogfooding />
      <Faq />
      <WaitlistCta />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Verify build + lint**

```bash
cd frontend && pnpm build 2>&1 | grep -iE "error|✓|compiled" | head && pnpm lint 2>&1 | tail -5
```

Expected: build compiled successfully; lint clean (no errors).

- [ ] **Step 3: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "refactor: rewrite page.tsx as composition root"
```

---

## Self-Review Checklist

- [x] `lib/content.ts` holds `engines`, `steps`, `faqs`, `productLinks` with types
- [x] `WaitlistForm` relocated to its own client component
- [x] 10 section components created, each `export default function X()` with no props
- [x] `page.tsx` is a thin composition root, no inline sections
- [x] `Navbar` imports `productLinks` from `lib/content`
- [x] Only `Navbar` + `WaitlistForm` are `"use client"`; `Faq` is server (native `<details>`)
- [x] All Tailwind classes / copy copied verbatim (pure refactor)
- [x] Build + lint pass

---

## Execution Notes

- Tasks 1–13 are independent file creations (safe to dispatch sequentially; each commits its own file).
- Task 14 depends on all prior tasks (it imports them).
- Task 8 modifies `Navbar.tsx` but is independent of the section creations.
- After all tasks: run `pnpm build` + `pnpm lint`, then a final whole-branch code review.
