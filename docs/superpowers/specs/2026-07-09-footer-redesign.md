# Footer Redesign — ORKA Frontend

**Date:** 2026-07-09
**Status:** Approved

---

## Goal

Replace the current `frontend/components/Footer.tsx` with a modern, minimal editorial SaaS footer: white background, two-column layout (brand left, vertical nav right), social icons, and a bottom-right copyright. Premium startup aesthetic with purple (`violet`) accent and smooth hover transitions.

---

## Design Spec

### Container

- White background (`bg-white`), generous vertical padding, `max-w-7xl` centered, horizontal padding matching site (`px-4 md:px-8 lg:px-12`)
- 12-column responsive grid feel via flex/grid; stacks to single column on mobile

### Left — Brand

- **Logo**: inline horizontal — `LOGO.svg` icon (size ~48) on the left + "ORKA" in large uppercase bold sans typography (`DM_Sans`, `font-black`, `text-ink`). Do NOT use the `.display` (Anton) class here — spec asks for clean geometric sans, and ORKA wordmark should match brand. Use `text-3xl`/`text-4xl` uppercase.
- **Description**: 2-line brand description in light gray (`text-ink/60`), small, below the logo.
  > "Autonomous financial operations for the global service economy. AI-powered proposals, escrow, verification, and payouts."
- **Social row**: monochrome icons — X (Twitter), Facebook, LinkedIn — using `lucide-react` (`Twitter`, `Facebook`, `Linkedin`). Subtle hover: color shifts to `violet`, slight scale/translate, `transition` 200–300ms.

### Right — Navigation

- Vertical menu, right-aligned, generous spacing between items (`gap-5`/`gap-6`)
- Each item: small **circular arrow icon** on the left (lucide `ArrowUpRight` or `ArrowRight` inside a `rounded-full` circle with border), then bold uppercase label (`font-black uppercase`, `text-ink`)
- Links: **About, Services, Pricing, Contact** (href `#` placeholders for now)
- **Hover**: arrow + text slide slightly right (`translate-x-1`), accent color → `violet`, 200–300ms transition

### Bottom

- Small copyright text, aligned bottom-**right**
- "© 2026 ORKA. All Rights Reserved." (light gray, `text-xs`)

---

## Technical Notes

- Server component (no state) — no `"use client"` needed (lucide icons are fine in server components)
- Icons: `lucide-react` (`Twitter`, `Facebook`, `Linkedin`, `ArrowUpRight`) — already a dependency
- Typography: `DM_Sans` is the body font (already loaded + set as default in `globals.css`); no extra font load needed
- Colors: `ink` (#061a2b) for text, `violet` (#9474ff) for accent, `bg-white` background
- Responsive: `flex-col` on mobile, `md:flex-row md:items-start md:justify-between` on desktop; nav right-aligned on desktop
- Pure visual change to the Footer only — other components untouched

---

## Verification

- `pnpm build` passes, `pnpm lint` clean
- Visual: white footer, ORKA logo + description + socials on left, vertical arrow-list nav on right, copyright bottom-right, hover animations work
- Responsive: stacks on mobile (brand above nav)
