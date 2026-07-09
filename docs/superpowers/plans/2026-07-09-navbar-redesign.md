# Navbar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract and redesign the ORKA landing page navbar into `frontend/components/Navbar.tsx` — big/bold, with a Product dropdown, About + Docs standalone links, a "Star on GitHub" CTA, and a full mobile hamburger menu.

**Architecture:** Create a single `"use client"` component `Navbar.tsx` that manages its own open/close state for the hamburger and Product dropdown. Remove the existing inline `<nav>` from `page.tsx` and replace it with `<Navbar />`. No new dependencies — pure Tailwind + React.

**Tech Stack:** Next.js 15 App Router, React 18, Tailwind CSS v3, TypeScript strict mode

## Global Constraints

- Package manager: `pnpm` (never `npm` or `yarn`)
- Working directory for all commands: `frontend/`
- Logo path: `/Logo/LOGO.svg` (NOT `/LOGO.svg` — the file lives in `public/Logo/`)
- GitHub URL: `https://github.com/x0lg0n/Orka`
- Tailwind color tokens: `orange` = `#ff8a22`, `ink` = `#061a2b`, `violet` = `#9474ff`, `lime` = `#eaff35`
- Font class `.display` = Impact stack, defined in `globals.css`
- TypeScript `strict: true` — no implicit `any`, no type errors
- Build check: `pnpm build` must pass with zero errors after all tasks

---

### Task 1: Create `components/Navbar.tsx`

**Files:**
- Create: `frontend/components/Navbar.tsx`

**Interfaces:**
- Consumes: nothing (self-contained)
- Produces: `export default function Navbar()` — a React component with no props

- [ ] **Step 1: Create the file with full implementation**

Create `frontend/components/Navbar.tsx` with this exact content:

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const productLinks = [
  { label: "Engines", href: "#engines" },
  { label: "Method", href: "#method" },
  { label: "FAQ", href: "#faq" },
];

const GITHUB_URL = "https://github.com/x0lg0n/Orka";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);

  // Close desktop product dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (productRef.current && !productRef.current.contains(e.target as Node)) {
        setProductOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
        setMobileProductOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function closeMobileMenu() {
    setMenuOpen(false);
    setMobileProductOpen(false);
  }

  return (
    <div className="relative z-20">
      {/* ── Main bar ── */}
      <nav className="mx-auto flex max-w-7xl items-center gap-6 py-5">
        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-2.5" aria-label="ORKA home">
          <Image
            src="/Logo/LOGO.svg"
            alt="ORKA"
            width={48}
            height={48}
            className="size-12 object-contain"
          />
          <span className="display text-3xl text-white">ORKA</span>
        </a>

        {/* Desktop nav links — left of spacer */}
        <div className="hidden items-center gap-1 md:flex">
          {/* Product dropdown */}
          <div ref={productRef} className="relative">
            <button
              onClick={() => setProductOpen((v) => !v)}
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-black uppercase text-white transition-all ${
                productOpen ? "bg-orange" : "hover:bg-orange"
              }`}
              aria-expanded={productOpen}
              aria-haspopup="true"
            >
              Product
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${productOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Dropdown panel */}
            {productOpen && (
              <div className="absolute left-0 top-full mt-2 min-w-[180px] rounded-2xl border border-white/10 bg-ink p-2 shadow-hard">
                {productLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setProductOpen(false)}
                    className="block rounded-full px-4 py-2 text-sm font-black uppercase text-white transition-all hover:bg-orange"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* About */}
          <a
            href="#"
            className="rounded-full px-4 py-2 text-sm font-black uppercase text-white transition-all hover:bg-orange"
          >
            About
          </a>

          {/* Docs */}
          <a
            href="#"
            className="rounded-full px-4 py-2 text-sm font-black uppercase text-white transition-all hover:bg-orange"
          >
            Docs
          </a>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA — Star on GitHub (desktop) */}
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-full border-2 border-white bg-white px-5 py-2.5 text-sm font-black uppercase text-ink transition-all hover:border-orange hover:bg-orange hover:text-white md:flex"
        >
          {/* Star icon */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="shrink-0"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Star on GitHub
        </a>

        {/* Hamburger (mobile) */}
        <button
          className="ml-auto flex size-10 items-center justify-center rounded-full text-white transition-all hover:bg-white/10 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            /* ✕ icon */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            /* ☰ icon */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="md:hidden">
          <div className="flex flex-col gap-1 px-4 pb-6">
            {/* Product accordion */}
            <button
              onClick={() => setMobileProductOpen((v) => !v)}
              className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-sm font-black uppercase text-white transition-all ${
                mobileProductOpen ? "bg-orange" : "hover:bg-orange"
              }`}
            >
              Product
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-200 ${mobileProductOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {mobileProductOpen && (
              <div className="ml-4 flex flex-col gap-1">
                {productLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="block rounded-full px-4 py-2.5 text-sm font-black uppercase text-white/80 transition-all hover:bg-orange hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            {/* About */}
            <a
              href="#"
              onClick={closeMobileMenu}
              className="rounded-full px-4 py-3 text-sm font-black uppercase text-white transition-all hover:bg-orange"
            >
              About
            </a>

            {/* Docs */}
            <a
              href="#"
              onClick={closeMobileMenu}
              className="rounded-full px-4 py-3 text-sm font-black uppercase text-white transition-all hover:bg-orange"
            >
              Docs
            </a>

            {/* CTA */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMobileMenu}
              className="mt-2 flex items-center justify-center gap-2 rounded-full border-2 border-white bg-white px-5 py-3 text-sm font-black uppercase text-ink transition-all hover:border-orange hover:bg-orange hover:text-white"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="shrink-0"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Star on GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify the file exists**

```bash
ls frontend/components/Navbar.tsx
```

Expected: file listed with no error.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/Navbar.tsx
git commit -m "feat: add Navbar component with dropdown, mobile menu, GitHub CTA"
```

---

### Task 2: Integrate `Navbar` into `page.tsx` and fix footer logo

**Files:**
- Modify: `frontend/app/page.tsx` lines 190–206 (existing `<nav>`) and line 512 (footer logo)

**Interfaces:**
- Consumes: `Navbar` default export from `../components/Navbar` (or `@/components/Navbar` if path alias is set)
- Produces: updated `page.tsx` with `<Navbar />` in place of the old inline nav

- [ ] **Step 1: Add the import at the top of `page.tsx`**

Open `frontend/app/page.tsx`. After the existing imports (around line 4), add:

```tsx
import Navbar from "@/components/Navbar";
```

> Note: `tsconfig.json` has `"moduleResolution": "bundler"` and Next.js sets up the `@` alias to the project root by default. If the alias doesn't resolve, use `"../components/Navbar"` — but `@/components/Navbar` is standard for Next.js App Router projects.

- [ ] **Step 2: Replace the inline `<nav>` block with `<Navbar />`**

Find and remove lines 190–206 in `page.tsx` (the existing `<nav>` element):

```tsx
        {/* Nav */}
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
          <a href="#" className="flex items-center gap-2.5" aria-label="ORKA home">
            <Image src="/LOGO.svg" alt="ORKA" width={48} height={48} className="size-12 object-contain" />
            <span className="display text-3xl">ORKA</span>
          </a>
          <div className="hidden items-center gap-7 text-xs font-black uppercase md:flex">
            <a href="#engines" className="hover:text-lime">Engines</a>
            <a href="#method" className="hover:text-lime">Method</a>
            <a href="#faq" className="hover:text-lime">FAQ</a>
          </div>
          <a href="#waitlist" className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black uppercase text-ink transition hover:bg-lime">
            Get early access
            <span className="grid size-5 place-items-center rounded-full bg-ink text-white">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
            </span>
          </a>
        </nav>
```

Replace with:

```tsx
        {/* Nav */}
        <Navbar />
```

- [ ] **Step 3: Fix the footer logo path**

Find line ~512 in `page.tsx`:

```tsx
<Image src="/orka-logo.png" alt="ORKA" width={48} height={48} className="size-full object-contain" />
```

Replace with:

```tsx
<Image src="/Logo/LOGO.svg" alt="ORKA" width={48} height={48} className="size-full object-contain" />
```

- [ ] **Step 4: Run the build to check for type errors**

```bash
pnpm build
```

Expected: build completes with no TypeScript errors. If there's a path alias error on `@/components/Navbar`, change the import to a relative path: `import Navbar from "../components/Navbar";`

- [ ] **Step 5: Verify in the dev server**

```bash
pnpm dev
```

Open `http://localhost:3000` and check:
- Desktop: logo + wordmark, Product dropdown (orange pill on hover, opens sub-links), About, Docs (all orange pill on hover), Star on GitHub CTA (white → orange on hover)
- Mobile (resize to < 768px): hamburger appears, clicking it opens the mobile menu, Product accordion expands/collapses, all links close the menu on click

- [ ] **Step 6: Commit**

```bash
git add frontend/app/page.tsx
git commit -m "feat: integrate Navbar component, fix footer logo path"
```

---

## Self-Review Checklist

- [x] Spec: Product dropdown with Engines/Method/FAQ ✓
- [x] Spec: About + Docs standalone links ✓
- [x] Spec: "Star on GitHub" CTA → `https://github.com/x0lg0n/Orka` ✓
- [x] Spec: Orange pill on hover (all links) ✓
- [x] Spec: White text on hover ✓
- [x] Spec: Logo uses `/Logo/LOGO.svg` ✓
- [x] Spec: Mobile hamburger + collapsible mobile menu ✓
- [x] Spec: Product accordion in mobile menu ✓
- [x] Spec: Clicking link closes mobile menu ✓
- [x] Spec: No sticky behaviour (out of scope) ✓
- [x] No placeholders — all code is complete ✓
- [x] Type consistency — `menuOpen`, `productOpen`, `mobileProductOpen` are all `boolean` ✓
