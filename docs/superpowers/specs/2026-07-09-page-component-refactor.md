# Landing Page Component Refactor — ORKA Frontend

**Date:** 2026-07-09  
**Status:** Approved

---

## Goal

Refactor the monolithic `frontend/app/page.tsx` (currently ~527 lines, a single default-export `Home` component containing all sections inline) into a production-grade, component-based architecture. The page becomes a thin composition root; each section is a dedicated, presentational component; all copy/data lives in a single typed content module.

This is a **pure refactor** — no visual, copy, or behavioral changes. The rendered output must be pixel-identical to the current page.

---

## Architecture

```
app/
  page.tsx          → composition root (imports + renders sections, ~15 lines)
  layout.tsx        → unchanged
  globals.css       → unchanged
components/
  Navbar.tsx        → already exists (client); will import productLinks from lib/content
  Hero.tsx          → server component (contains <Navbar/>, decorations, copy, stats, tags)
  ProblemCards.tsx  → server component
  Engines.tsx       → server component (reads engines from content)
  WhyChooseUs.tsx   → server component
  HowItWorks.tsx    → server component (reads steps from content)
  Audience.tsx      → server component
  Dogfooding.tsx    → server component
  Faq.tsx           → server component (native <details> accordion, reads faqs)
  WaitlistCta.tsx   → server component (renders <WaitlistForm/>)
  Footer.tsx        → server component
  WaitlistForm.tsx  → client component (relocated from page.tsx)
lib/
  content.ts        → typed content: engines, steps, faqs, productLinks, plus section copy constants
```

---

## Component Contract (production rules)

1. **Composition root**: `page.tsx` default-exports `Home()` which returns `<main className="overflow-hidden bg-paper">` wrapping the section components in document order. No props, no data, no logic.
2. **Presentational sections**: each section component is `export default function X()` with **no props**. They import their data from `lib/content.ts`. Most are **server components** (no `"use client"`).
3. **Client components** (only where state/events exist):
   - `Navbar.tsx` (dropdown + mobile menu state) — already `"use client"`
   - `WaitlistForm.tsx` (form state) — `"use client"`
   - `Faq.tsx` uses native `<details>` — **server component**, no JS needed
4. **Single source of truth**: all arrays (`engines`, `steps`, `faqs`, `productLinks`) and repeated copy strings live in `lib/content.ts` with exported TypeScript types. `productLinks` moves OUT of `Navbar.tsx` into `lib/content.ts`; `Navbar.tsx` imports it.
5. **No prop-drilling**: sections read content directly from `lib/content.ts`.
6. **Class names preserved**: every Tailwind class, decoration, and arbitrary value (`text-[4.2rem]`, `rotate-[-3deg]`, etc.) is copied verbatim. Output must be identical.

---

## `lib/content.ts` shape

```ts
export type Engine = {
  title: string;
  copy: string;
  color: string;
};

export type Step = [string, string, string, string[][]?];

export type Faq = [string, string];

export const engines: Engine[] = [ /* exact current array */ ];
export const steps: Step[] = [ /* exact current array */ ];
export const faqs: Faq[] = [ /* exact current array */ ];
export const productLinks = [
  { label: "Engines", href: "#engines" },
  { label: "Method", href: "#method" },
  { label: "FAQ", href: "#faq" },
];
```

---

## Section → source mapping (verbatim copy)

| Component | Source lines in current `page.tsx` |
|-----------|-------------------------------------|
| `Hero.tsx` | 182–275 (includes `<Navbar />`, floating `+`/`✦`/`★` decorations, hero h1/p, waitlist form wrapper, stats + tag cloud, "No wallet drama"/"Soroban powered" stickers) |
| `ProblemCards.tsx` | 277–291 |
| `Engines.tsx` | 293–333 |
| `WhyChooseUs.tsx` | 335–360 |
| `HowItWorks.tsx` | 362–412 |
| `Audience.tsx` | 414–430 |
| `Dogfooding.tsx` | 432–447 |
| `Faq.tsx` | 449–474 |
| `WaitlistCta.tsx` | 476–504 |
| `Footer.tsx` | 506–539 |
| `WaitlistForm.tsx` | 71–176 (relocated, unchanged logic) |

---

## Verification

- `pnpm build` passes with zero TypeScript errors
- `pnpm lint` clean
- Rendered DOM is identical: compare a production build's HTML output before/after, or visually confirm in dev server that all sections appear in order with unchanged styling
- No `"use client"` added to static sections (bundle hygiene)

---

## Out of Scope

- Adding routing / new pages (About, Docs) — only structure for them
- Changing any copy, colors, layout, or behavior
- Sticky navbar, animations beyond what exists
