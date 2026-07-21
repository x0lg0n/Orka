# Auth Split-Panel Design

**Date:** 2026-07-21
**Status:** Approved design

## Objective

Redesign all auth pages (signup, signin, forgot-password, reset-password, verify-email) with a two-panel split layout that builds trust and drives signups, while fixing the broken `/login` → `/signin` route mismatch.

## Layout

Full-viewport-height, two-panel split:

```
┌──────────────────────────┬──────────────────────────────┐
│     Left panel (dark)    │   Right panel (light)        │
│     ~45% width           │   ~55% width                 │
│                          │                              │
│  [ORKA logo]             │  ← Back to orka.io           │
│                          │                              │
│  Headline ──────────►    │  ┌────────────────────────┐  │
│  "Ship work. Get         │  │  Existing form content │  │
│   paid. On Stellar."     │  │  (unchanged)           │  │
│                          │  │                        │  │
│  Feature bullets ▸       │  │  [ORKA logo small]     │  │
│  • Milestone escrow      │  │  Terms & Privacy text  │  │
│  • Smart contracts       │  └────────────────────────┘  │
│  • Client portal         │                              │
│                          │                              │
│  Testimonial quotes      │                              │
│  from @buildwithorka     │                              │
│                          │                              │
│  [subtle glow bg]        │                              │
└──────────────────────────┴──────────────────────────────┘
```

## Pages Affected

All pages in `app/(auth)/`:
- `signup/page.tsx` — signup form
- `signin/page.tsx` — signin form (also fixes the broken `/login` → `/signin` route)
- `forgot-password/page.tsx` — forgot password form
- `reset-password/page.tsx` — reset password form
- `verify-email/page.tsx` — email verification prompt

## Components

### `AuthSplitLayout` (new)
- Two-column flex container: `lg:flex-row` (side-by-side), `flex-col` (stacked on mobile)
- Left panel: dark background (`bg-night`), padded, content centered vertically
- Right panel: light background (`bg-paper`), padded, content centered vertically
- No Navbar, no Footer rendered
- Accepts `children` for the right panel content
- Left panel content is shared across all auth pages (same value prop)

### `AuthMarketingPanel` (new)
- Left panel content component
- ORKA logo (small, top area)
- Headline: "Ship work. Get paid. On Stellar."
- Three feature bullets with icons:
  - **Milestone escrow** — Funds release on approval, not promises
  - **Smart contracts** — Proposals & agreements on Stellar
  - **Client portal** — Share, sign, and get paid
- 2–3 testimonial quotes from `@buildwithorka` Twitter feed (hardcoded quote text + handle, not Twitter embeds)
- Subtle ambient gradient/glow effect behind content

### `AuthFormCard` (refactored, optional)
- Wraps the existing form content in a consistent container
- "Back to orka.io" link top-left
- Small ORKA logo at the bottom of the card
- "By signing up you agree to our Terms & Privacy" legal text

## Route Fix

- Current: all internal links point to `/login`, but the file is at `app/(auth)/signin/page.tsx`
- Fix: create `app/(auth)/login/page.tsx` that re-exports the signin page (`export { default } from "../signin/page"`) so both `/login` and `/signin` resolve

## What Stays Unchanged

- Form components (`SignupForm`, `WalletSignIn`, forgot/reset password forms) — same logic, same fields
- Auth logic — no changes to authentication flow
- Marketing pages (`app/(marketing)/`) — untouched
- Dashboard/app pages — untouched

## Mobile

On screens below `lg` breakpoint:
- Panels stack vertically (left panel on top, form below)
- Left panel shows headline + 1 testimonial only (feature bullets hidden)
- Form panel takes full width below

## Dependencies

- Uses existing brand colors: `bg-night`, `bg-paper`, `text-lime`, `text-violet`, `text-coral`
- Uses existing `ORKA` logo from `public/Logo/LOGO.svg`
- Uses existing testimonial data from `lib/content/testimonials.ts`
- No new npm packages
