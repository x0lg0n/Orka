# Navbar Redesign — ORKA Landing Page

**Date:** 2026-07-09  
**Status:** Approved

---

## Goal

Redesign the existing inline navbar in `frontend/app/page.tsx` into a standalone `frontend/components/Navbar.tsx` component. The new navbar is big, bold, future-ready (dropdown for growing link list), mobile-responsive with a hamburger menu, and has a "Star on GitHub" CTA.

---

## Layout

### Desktop (`md` and above)

```
[ LOGO.svg  ORKA ]  [ Product ▾ ]  [ About ]  [ Docs ]  ··flex-1 spacer··  [ ★ Star on GitHub ]
```

- Max width: `max-w-7xl`, horizontally centered, `px-4 md:px-8 lg:px-12`
- Vertical padding: `py-5` (tall, bold feel)
- All text: `font-black uppercase`

### Mobile (below `md`)

```
[ LOGO  ORKA ]                              [ ☰ / ✕ ]
────────────────────────────────────────────────────
  Product  ▾
    └ Engines
    └ Method
    └ FAQ
  About
  Docs
  ★ Star on GitHub   (full-width pill button)
────────────────────────────────────────────────────
```

---

## Components / Structure

### File: `frontend/components/Navbar.tsx`

- `"use client"` — needs `useState` for hamburger + Product dropdown
- Imported in `frontend/app/page.tsx`, placed above the hero section content (inside the existing dark `bg-ink` hero `<section>`)

### Logo

- Image: `/Logo/LOGO.svg`, `width={48} height={48}`, `size-12`
- Wordmark: `"ORKA"` in `.display` font class, `text-3xl`, white
- Wrapped in `<a href="/">` 

### Nav Links (desktop)

Placed immediately after the logo group, left-aligned via `flex items-center gap-2`.

| Link | Behaviour |
|------|-----------|
| Product ▾ | Dropdown toggle (click). Chevron rotates when open. |
| About | `href="#"` placeholder |
| Docs | `href="#"` placeholder |

**Link default style:** `text-sm font-black uppercase text-white px-4 py-2 rounded-full transition-all`  
**Link hover style:** `bg-orange text-white` (orange pill)

### Product Dropdown

- Opens on click of "Product" link
- Positioned `absolute` below the Product trigger, `bg-ink border border-white/10 rounded-2xl shadow-hard p-2 min-w-[180px]`
- Items: **Engines** (`#engines`), **Method** (`#method`), **FAQ** (`#faq`)
- Each item: `block px-4 py-2 text-sm font-black uppercase text-white rounded-full hover:bg-orange transition-all`
- Clicking an item closes the dropdown
- Clicking outside closes the dropdown (`useEffect` + `useRef`)
- Future items can be added to a config array

### CTA Button — "Star on GitHub"

- `href="https://github.com/x0lg0n/Orka"`, `target="_blank"`, `rel="noopener noreferrer"`
- Desktop: `rounded-full border-2 border-white bg-white text-ink px-5 py-2.5 text-sm font-black uppercase flex items-center gap-2 hover:bg-orange hover:text-white hover:border-orange transition-all`
- Icon: GitHub star SVG (inline) to the left of text
- Text: `★ Star on GitHub`

### Hamburger Button (mobile only, `md:hidden`)

- `useState<boolean>` `isOpen` controls menu visibility
- Icon: 3-line SVG when closed, ✕ SVG when open
- Color: white

### Mobile Menu

- Shown when `isOpen === true`, hidden otherwise
- `bg-ink w-full flex flex-col gap-1 px-4 pb-5`
- Product section: collapsible sub-list (second `useState<boolean>` `isProductOpen`)
- All links close the mobile menu on click
- CTA appears at the bottom as a full-width pill

---

## Interaction States

| Element | Default | Hover | Active/Open |
|---------|---------|-------|-------------|
| Nav link | white text, no bg | orange pill, white text | — |
| Product trigger | white text, no bg | orange pill | orange pill + chevron rotated 180° |
| Dropdown item | white text, transparent | orange pill, white text | — |
| CTA button | white bg, ink text | orange bg, white text, orange border | — |
| Hamburger | white 3-line icon | — | white ✕ icon |

---

## Integration

1. Create `frontend/components/Navbar.tsx`
2. In `frontend/app/page.tsx`: remove the existing `<nav>` block (lines 190–206)
3. Import and render `<Navbar />` at the top of the hero `<section>`, in its place
4. Fix the footer logo path from `/orka-logo.png` → `/Logo/LOGO.svg` (bonus fix, same file)

---

## Out of Scope

- Sticky/scroll behaviour (deferred to future iteration)
- Real About / Docs page routes (placeholders only)
- Animations beyond CSS transitions
