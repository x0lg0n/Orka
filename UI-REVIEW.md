# UI-REVIEW — ORKA Marketing Pages
**Audit date:** 2026-07-22  
**Scope:** All marketing pages — `/` (home), `/about`, `/pricing`, `/services`, `/blog`, `/contact`, `/docs`, `/terms`  
**Overall:** 17 / 24

---

## Score Summary

| Pillar | Score |
|--------|-------|
| Copywriting | 3/4 |
| Visuals | 2/4 |
| Color | 3/4 |
| Typography | 3/4 |
| Spacing | 3/4 |
| Experience Design | 3/4 |

---

## Pillar 1 — Copywriting · 3/4

### What's working

- **Hero headline is sharp.** "Autonomous financial OS for global service work." — clear category claim, no jargon overload.
- **Section copy is tightly edited.** The `HowItWorks` before/after blocks ("You email 'done', the client goes silent…") are concrete and credible. The `content.ts` data shows disciplined editing throughout.
- **The FAQ is honest.** "This landing page is for the early waitlist and design partners while the hackathon/pre-seed foundation is built." — admirable transparency; builds trust for early adopters.
- **Services page works editorially.** The numbered service areas each state a clear outcome, not just a feature.
- **WaitlistCta headline is direct.** Punchy enough for a CTA section.

### Problems

**P1 — Hero tag cloud copy is off-brand and misleading**  
`components/Hero.tsx:101-105`

```tsx
<p className="mt-3 w-full text-[24px] font-medium uppercase ...">
  5X achieved ROI on ad spend consistently! Average{" "}
  <span className="text-white/50">increase in ROI for our clients.</span>
</p>
```
This is a marketing agency claim ("ROI on ad spend"), but ORKA is a B2B ops tool. It sounds disconnected from the product category and is unverified at this stage. The exclamation mark reads desperate. The tag cloud labels ("Business Growth", "Performance Metrics", "AI Automation") are generic MBA buzzwords that contradict the product-led precision of the rest of the page.

**P2 — Hero badge uses an emoji**  
`components/Hero.tsx:56`
```tsx
❤️ #1 Financial OS for Service Work
```
`#1` is an unsupported claim. The ❤️ emoji is a casual choice for a B2B financial product. The "Financial OS" label is actually the best descriptor ORKA has — no need to gild it.

**P3 — Hero stat cards carry unrelated copy**  
`components/Hero.tsx:132-134`
```
Helping brands thrive with strategic campaigns, creative content, and results-focused marketing precision marketing.
```
This paragraph reads like it was pasted from a marketing agency template ("results-focused marketing precision marketing" is grammatically broken). It contradicts the entire product narrative and appears in the stat card row, where it has no visual anchor.

**P4 — WaitlistCta stickers use wrong domain vocabulary**  
`components/WaitlistCta.tsx:9-15`
```
Brand Strategy / Performance Metrics / Business Growth
```
These are advertising-agency concepts. They should reference ORKA's actual pillars: "Milestone Escrow", "Verified Payouts", "AI Operations".

**P5 — About page reads as an internal engineering document**  
`app/(marketing)/about/page.tsx` — The "Guiding Principles" section exposes implementation details (`applyChainEvent()`, KMS, Soroban, multi-sig) that mean nothing to a prospective agency client. These are valid engineering principles but belong in `/docs`, not the marketing About page.

**P6 — Blog page is a placeholder with zero content**  
`app/(marketing)/blog/page.tsx` — Three mock posts with `lorem-ipsum`-style titles and no links. This is visible to public users and damages credibility. It should either be removed from navigation or replaced with a "Coming Soon" treatment.

**P7 — Section labels end with exclamation marks inconsistently**  
- "Our Engines!" (Engines.tsx) — has `!`  
- "Why Choose Us!" (WhyChooseUs.tsx) — has `!`  
- "How It Works" — no `!`  
- "Why ORKA is the trusted choice." — different tone entirely  

This inconsistency reads as editing noise.

### Top fixes

1. Rewrite the Hero "5X ROI" paragraph with actual ORKA user outcomes or remove it.
2. Replace WaitlistCta sticker labels with product-domain vocabulary.
3. Remove the blog link from the Navbar and Footer until there's real content, or add a "Coming soon" page.

---

## Pillar 2 — Visuals · 2/4

### What's working

- **Floating SVG decorations in the hero** add energy and brand personality without overwhelming content.
- **The `.cut-corner` chamfer** is a cohesive, repeatable visual motif that provides brand character across all cards.
- **`shadow-hard`** (8px hard-offset drop shadow) gives cards depth and a print-inspired feel consistent with the Anton/display type personality.
- **Social icon mask technique** in the footer is clever — pure CSS, no extra icon packs.
- **Actor icons in HowItWorks** (User/Briefcase/Sparkles/Coins) are well-chosen and color-coded clearly.

### Problems

**P1 — Hero has no product screenshot or visual proof**  
The hero shows a waitlist form inside a white card — but nothing that communicates what the product actually looks like. At this stage, even a single wireframe mockup or dashboard screenshot would anchor the value proposition and make the page feel more credible. Competitors in the "financial OS" category (Mercury, Pilot, Stripe) all lead with product visuals in the hero.

**P2 — Engine cards use only text on color blocks**  
`components/Engines.tsx` — Six engine cards (`Agreement Engine`, `Escrow & Settlement`, etc.) show only a title and copy on a colored background. They have an `ArrowUpRight` button that links nowhere — it's a decoration with the appearance of interactivity. No icon, no illustration, no visual differentiation between cards beyond color.

**P3 — Two Coral/Coral engine cards**  
`lib/content.ts:35-42` — "Verification Engine" and "Email & Payouts" both use `bg-coral`. When rendered in the 3-column grid, two adjacent coral cards look like a mistake, not a design decision.

**P4 — Footer logo treatment is disproportionate on mobile**  
`components/Footer.tsx:17-26` — The circular logo container is `size-28` (7rem) on mobile, scaling up to `size-40` (10rem) on `lg`. At 28rem, the `ORKA` display text beside it is `text-7xl` — this combination creates a very heavy footer element that can feel more imposing than the hero on small screens.

**P5 — Audience section cards have no visual differentiation**  
`components/Audience.tsx:10-14` — Four audience cards (`Agencies managing cross-border teams`, etc.) are identical white-on-violet boxes. No icon, no illustration, no variation. They convey list items, not audience personas.

**P6 — About page Roadmap is purely text-based**  
Six phase cards with only color differentiation. A timeline indicator, progress dots, or even a simple horizontal connector line would communicate "roadmap" more intuitively.

**P7 — Pricing page has no visual hierarchy indicator for the highlighted tier**  
`app/(marketing)/pricing/page.tsx` — The "Studio" plan has `border-lime shadow-hard` but no "Most Popular" badge, no visual crown, no emphasis beyond the border. This is a missed conversion opportunity.

### Top fixes

1. Add a product screenshot or dashboard mockup to the hero section.
2. Assign unique icons to each Engine card and fix the double-coral collision.
3. Add a "Most Popular" badge to the Studio pricing tier.

---

## Pillar 3 — Color · 3/4

### What's working

- **Palette is strong and unconventional.** `#fffaf2` warm paper background + Anton display type + lime/orange/coral/violet/teal accents is a distinctive combination that stands out in B2B SaaS. It avoids the cold grey-and-blue generic SaaS palette.
- **Semantic color usage is consistent.** Coral = problems/alerts. Lime = success/CTA. Violet = brand/interactive. Teal = positive states/Mode B. Night = deep containers. This system is applied correctly and predictably throughout.
- **`text-white/78` and `text-night/80` opacity layering** creates comfortable reading contrast without harsh black-on-white.
- **Color-coded actor system in HowItWorks** (violet=Client, teal=Freelancer, orange=ORKA AI, night=Stellar) is the best use of the palette in the entire codebase.

### Problems

**P1 — Double coral in Engines grid is a system error**  
Already noted in Visuals. `bg-coral` appears twice in 6 consecutive engine cards. In a palette system this deliberate, this reads as a bug, not a choice.

**P2 — Pricing page breaks the design-system palette**  
`app/(marketing)/pricing/page.tsx:59-63`
```tsx
className="... border-night/10 bg-white/60"
```
`bg-white/60` (semi-transparent white) and `border-night/10` (extremely subtle) are dashboard UI tokens being used on a marketing card. The pricing page feels visually softer and less confident than the rest of the site. The non-highlighted cards look almost invisible against `bg-paper`.

**P3 — Services hero doesn't use `rounded-b` treatment**  
The home page hero uses `rounded-b-[72px]` to create a distinctive dark rounded-bottom shape. The Services page hero (`bg-night px-4 pb-14`) is a flat rectangle that cuts off abruptly. Inconsistent; the services page feels like a different site.

**P4 — About page hero uses `rounded-b-[72px]`; Services does not**  
About has `rounded-b-[42px] md:rounded-b-[72px]`. Services has no rounding. This inconsistency across secondary pages signals different authorship.

**P5 — Contact page form uses color tokens inconsistently**  
`app/(marketing)/contact/page.tsx` — Uses `focus:border-lime` (matching the main site CTA color) for form focus states. But the main WaitlistForm uses `focus:border-violet focus:ring-4 focus:ring-violet/20`. Two different focus colors for similar input patterns on the same site.

**P6 — WaitlistCta asterisk/plus decorations use raw text characters**  
```tsx
<span className="absolute right-[58%] bottom-[30%] text-4xl text-orange select-none hidden lg:block">*</span>
<span className="absolute left-[10%] top-[20%] text-2xl text-lime select-none hidden lg:block">+</span>
```
Using raw `*` and `+` characters as decorative elements is fragile — they render differently per font/OS and don't match the SVG quality of the hero decorators (Star-Violet.svg, Plus-Teal.svg, etc.).

### Top fixes

1. Fix the double-coral engine card collision (assign `bg-teal` or `bg-violet` to one).
2. Make the Services and About hero treatments consistent — both should use the rounded-bottom dark hero.
3. Replace raw `*` and `+` decorator characters in WaitlistCta with the same SVG elements used in the Hero.

---

## Pillar 4 — Typography · 3/4

### What's working

- **The Anton + DM Sans pairing is excellent.** Bold display for identity/headings, clean humanist for body — a high-contrast pairing that scales well across the marketing page hierarchy.
- **JetBrains Mono reserved for financial/code data** is the right call — it signals precision when used for amounts, addresses, or technical terms.
- **Section labels use a distinct treatment** (`. section-label` = Anton 28px uppercase) that clearly delineates sections without needing decorative dividers.
- **Hero h1 responsive scaling** (`text-[2.6rem]` → `sm:text-[4.4rem]` → `md:text-[6.4rem]` → `lg:text-[7.3rem]`) is well-considered and avoids the jagged jumps common in responsive type rigs.
- **`leading-[1.05]` on display heads** is correct for tight, impactful Anton uppercase — no excess leading.

### Problems

**P1 — Pricing page h2 abandons the display system**  
`app/(marketing)/pricing/page.tsx:65`
```tsx
<h2 className="text-xl font-extrabold text-night">{t.name}</h2>
```
Pricing tier names are styled with `text-xl font-extrabold` (DM Sans) instead of `.display` (Anton). This is the only major heading on any marketing page that doesn't use the brand display font. It creates a disconnected, SaaS-generic feel on the pricing page.

**P2 — Body font weight is "bold" everywhere, even for body paragraphs**  
Throughout: `text-sm font-bold leading-6` is the default body text style. Bold weight is being used for:
- Card descriptors (`WhyChooseUs.tsx:22`)
- Feature list items (`pricing/page.tsx:75`)
- FAQ answers (`Faq.tsx:32` renders at `text-base leading-7` — this is correct)
- Hero stat card labels (`Hero.tsx:115`)

`font-bold` for explanatory body copy creates an over-emphasized, "shout-y" reading experience. Body copy should be `font-normal` or `font-medium`. Bold should be reserved for key terms within copy.

**P3 — `text-m` is an invalid Tailwind class**  
`components/WaitlistForm.tsx:114`
```tsx
className="... text-m font-black uppercase ..."
```
`text-m` is not a valid Tailwind size class (`text-base` = medium). This likely falls back to the browser default font size. Because it happens to look correct in context, it's easy to miss — but it's a class typo.

**P4 — FAQ heading grows too large at desktop**  
`components/Faq.tsx:11`
```tsx
<h2 className="display mt-2 text-4xl uppercase sm:text-5xl md:text-6xl lg:text-[80px]">
  Your questions answered.
```
At `lg:text-[80px]` (80px = 5rem), a 5-word non-hero heading is extremely large. The FAQ heading competes with the hero h1 and the Engines h2 for visual dominance at lg breakpoints. The `lg:text-7xl` cap used in Engines seems more appropriate.

**P5 — HowItWorks mobile subtitle is hidden on md+ breakpoints without equivalent fallback**  
`components/HowItWorks.tsx:54-56`
```tsx
<p className="mt-1 text-sm font-medium leading-6 text-night/70 md:hidden">
  {step.summary}
</p>
```
The step summary is shown only on `md:hidden`. On desktop, the summary only appears inside the open accordion panel — meaning collapsed steps have no descriptive text visible. This creates a text hierarchy gap at desktop widths.

### Top fixes

1. Apply `.display` Anton to Pricing tier name headings.
2. Audit body copy `font-bold` usage — downgrade to `font-normal` or `font-medium` for explanatory paragraphs.
3. Fix `text-m` typo → `text-sm` or `text-base` in `WaitlistForm.tsx:114`.

---

## Pillar 5 — Spacing · 3/4

### What's working

- **Section padding rhythm is consistent.** `px-4 py-16 md:px-8 lg:px-12` is used almost universally across sections, creating a predictable, comfortable rhythm.
- **Max-width constraints are well-applied.** `max-w-7xl` for most sections, `max-w-6xl` for the narrower services/terms pages — this distinction feels intentional.
- **Vertical spacing within cards is appropriate.** `p-6` cards with `mt-3` / `mt-4` for sub-items gives adequate breathing room even on dense content like the about page custody tables.
- **Gap system is consistent.** `gap-4`/`gap-6`/`gap-8` for grids throughout — no ad-hoc margins creating ragged spacing.

### Problems

**P1 — WaitlistCta inner grid has no column division**  
`components/WaitlistCta.tsx:20`
```tsx
<div className="grid col-auto gap-10 md:gap-20">
```
`grid col-auto` is an unusual/incorrect Tailwind grid class (should be `grid-cols-1` or a named column definition). The section shows the headline and form stacked vertically with `gap-20` — this creates a large void between the CTA heading and the form that looks unintentional, especially when the heading is large at desktop.

**P2 — Hero bottom stat row has alignment tension at mid-breakpoints**  
`components/Hero.tsx:78`
```tsx
className="relative z-10 mx-auto mt-12 flex max-w-7xl flex-col items-center gap-8 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left"
```
Between `sm` and `lg`, the stat section stacks vertically with `items-center`, creating a centered column of content after a centered hero. The `lg:flex-row lg:items-end` alignment then introduces a bottom-align that looks elegant at large sizes but creates a jarring jump at the transition point around `1024px`.

**P3 — Pricing page is missing a hero section**  
`app/(marketing)/pricing/page.tsx:47`
```tsx
<section className="mx-auto max-w-6xl px-6 py-16">
  <div className="text-center">
    <h1 className="display text-4xl uppercase text-night">Pricing</h1>
```
The pricing page starts directly with `px-6 py-16` on a plain background — no dark hero, no badge, no eyebrow. Every other secondary marketing page (`/about`, `/services`) has a dark hero section that provides visual entry. The pricing page looks like an orphaned component rather than a designed page.

**P4 — Contact page has no visual container structure**  
The contact page (`app/(marketing)/contact/page.tsx`) is a minimal form inside a `div` with a title — no section padding matching the design system, no hero, no context. It's the most visually underdeveloped page on the site.

**P5 — Blog placeholder page lacks the design system entirely**  
Three mock `article` cards with minimal styling and no connection to the established card/cut-corner/shadow system.

**P6 — `py-10` (Engines, Custody) vs `py-16` (most others) inconsistency**  
Some sections use `py-10` (`Engines.tsx`, custody section of about page) while the standard is `py-16`. The visual rhythm between sections on the home page shifts subtly at the Engines section as a result.

### Top fixes

1. Fix `WaitlistCta` grid class (`col-auto` → valid column definition) and reduce the headline-to-form gap.
2. Add a hero section to the Pricing page matching the `/about` and `/services` pattern.
3. Standardize `py-16` across all sections (or intentionally document the exception for compact sections).

---

## Pillar 6 — Experience Design · 3/4

### What's working

- **WaitlistForm is well-engineered.** Loading states, error states, success states, form reset, `aria-invalid`, `aria-describedby`, and Escape-key dismissal on nav — all implemented correctly.
- **Navbar dropdown UX is solid.** Click-to-open, outside-click-to-close, and Escape-key handlers are all wired. Mobile accordion is properly accessible with `aria-expanded`.
- **HowItWorks accordion uses CSS grid animation** (`grid-rows-[1fr]/[0fr]`) for smooth height transitions without JavaScript measurement — this is the right modern approach.
- **FAQ uses native `<details>/<summary>`** which provides free keyboard navigation and accessibility without any JS.
- **Reduced-motion is respected** for all floating animations in `globals.css:338-348`.
- **Focus styles are defined** (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet`) on interactive elements in the Navbar — correct use of `:focus-visible` vs `:focus`.

### Problems

**P1 — Engine card `ArrowUpRight` buttons link nowhere**  
`components/Engines.tsx:23-25`
```tsx
<span className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full bg-white ...">
  <ArrowUpRight size={18} strokeWidth={3} ... />
</span>
```
This is a circular button with a hover animation, inside a card wrapper — but the entire card has no `href`, no `onClick`, and the button is not a link. It's a visual affordance that promises interactivity and delivers nothing. Users who click it get no feedback. This is a deceptive UI pattern.

**P2 — Footer nav links use `<a>` not `<Link>` for internal routes**  
`components/Footer.tsx:65-73`
```tsx
<a key={label} href={href} className="...">
```
All 6 footer nav links (`/services`, `/#engines`, `/#method`, etc.) use HTML `<a>` tags, not Next.js `<Link>`. This causes full-page refreshes on internal navigation instead of client-side transitions. The Navbar correctly uses `<Link>`.

**P3 — No scroll-to-section anchors in Navbar for hash links**  
Hash links (`/#engines`, `/#method`, `/#faq`) in the Footer and Navbar correctly use anchor IDs that match `id="engines"` (Engines.tsx) and `id="method"` (HowItWorks.tsx). However, when navigating from a secondary page (e.g., `/about → /#engines`), users land at the top of the page with no active scroll. Next.js App Router doesn't automatically handle hash scrolling after navigation. There's no client-side scroll handler.

**P4 — Pricing CTA links to `/signup` which likely doesn't exist yet**  
`app/(marketing)/pricing/page.tsx:80-84`
```tsx
<Link href="/signup" className="...">Get started</Link>
```
The Navbar CTA links to `/#waitlist`. The Pricing page CTAs link to `/signup`. If `/signup` is not live, every pricing CTA is a dead link. The Services page CTA also links to `/signup`. Unless signup is live, these should point to `/#waitlist`.

**P5 — HowItWorks step number color changes on open but summary doesn't**  
When a step is open (`isOpen`), the card background becomes `bg-orange text-white`. However, `text-night/70` is hardcoded on the mobile summary paragraph:
```tsx
<p className="mt-1 text-sm font-medium leading-6 text-night/70 md:hidden">
```
`text-night/70` on `bg-orange` produces a very dark text on orange, which may pass contrast but is visually inconsistent with the white text used for other open-state copy.

**P6 — Contact form `onSubmit` has no server endpoint wired**  
`app/(marketing)/contact/page.tsx` — The contact form uses `e.preventDefault()` and sets `submitted` state, but never actually POSTs to any endpoint. The form silently "succeeds" without sending any message. This is a non-functional form presented as functional.

**P7 — Mobile Navbar is missing the mega-menu featured cards**  
`components/Navbar.tsx:190` — Mobile accordion shows only the link labels, not the descriptions or the featured card that appears in the desktop dropdown. For products with complex positioning (3 dropdown groups), losing all descriptive content on mobile reduces the navigation's persuasive value.

### Top fixes

1. Make Engine cards navigable: wrap in `<Link href="/services#engines">` or remove the arrow button.
2. Fix Footer nav to use Next.js `<Link>` for internal routes.
3. Change Pricing and Services CTA from `/signup` to `/#waitlist` until signup is live, or add the signup route.

---

## Cross-Cutting Issues

These issues appear in multiple sections and compound across the site:

| Issue | Affected Files | Severity |
|-------|---------------|----------|
| Copy from wrong domain (ad agency, not financial OS) | Hero.tsx, WaitlistCta.tsx | High |
| Dead/non-functional links (`/signup`, engine cards) | pricing/page, services/page, Engines.tsx | High |
| Footer uses `<a>` instead of `<Link>` | Footer.tsx | Medium |
| `text-m` invalid Tailwind class | WaitlistForm.tsx:114 | Medium |
| Double `bg-coral` in Engines grid | content.ts | Medium |
| Services and Pricing pages lack dark hero treatment | pricing/page, services hero padding | Medium |
| Blog page is public-facing placeholder | blog/page.tsx | Medium |
| Body copy over-uses `font-bold` | WhyChooseUs, Engines, Pricing, WaitlistForm | Low |
| Raw `*` / `+` decorator chars in WaitlistCta | WaitlistCta.tsx | Low |

---

## Prioritized Fix List

### Tier 1 — Fix this week (broken or misleading)

1. **Remove/rewrite "5X ROI on ad spend" copy in Hero** — wrong category claim
   - File: `components/Hero.tsx:101-105`
   - Fix: Replace with ORKA-specific outcome language (e.g., "From rough brief to paid and reconciled in 4 steps.")

2. **Fix Engine card interactivity** — ArrowUpRight button that does nothing
   - File: `components/Engines.tsx:17-26`
   - Fix: Wrap `<article>` in `<Link href="/services">` or remove the button

3. **Fix Pricing/Services `/signup` dead CTA**
   - Files: `app/(marketing)/pricing/page.tsx:80`, `app/(marketing)/services/page.tsx:151`
   - Fix: Change `href="/signup"` → `href="/#waitlist"` until signup route exists

4. **Fix Contact form — wire to API endpoint or show honest copy**
   - File: `app/(marketing)/contact/page.tsx`
   - Fix: POST to `/api/waitlist` or `/api/contact`, or replace with `<WaitlistForm />`

5. **Fix `text-m` typo in WaitlistForm**
   - File: `components/WaitlistForm.tsx:114`
   - Fix: `text-m` → `text-sm`

### Tier 2 — Improve this sprint (visual/copy quality)

6. **Fix double-coral Engine cards** — assign `bg-violet` to "Email & Payouts"
   - File: `lib/content.ts:41`

7. **Replace WaitlistCta sticker labels** — use product vocabulary
   - File: `components/WaitlistCta.tsx:9-15`
   - Fix: "Brand Strategy" → "Milestone Escrow", "Performance Metrics" → "Verified Payouts", "Business Growth" → "AI Operations"

8. **Apply `.display` Anton to Pricing tier headings**
   - File: `app/(marketing)/pricing/page.tsx:65`
   - Fix: `text-xl font-extrabold` → `display text-3xl uppercase`

9. **Add hero section to Pricing page**
   - File: `app/(marketing)/pricing/page.tsx`
   - Fix: Add dark `bg-night rounded-b-[72px]` hero matching About/Services pattern

10. **Fix Footer `<a>` → `<Link>` for internal routes**
    - File: `components/Footer.tsx:65`
    - Fix: Import `Link` from `next/link`, replace `<a>` for internal hrefs

11. **Standardize section vertical padding** — `py-10` → `py-16` in Engines and Custody sections
    - Files: `components/Engines.tsx:6`, `app/(marketing)/about/page.tsx:175`

12. **Replace WaitlistCta raw `*` / `+` decorators with SVGs** matching hero
    - File: `components/WaitlistCta.tsx:17-18`

13. **Hide Blog from navigation or replace with "Coming Soon" page**
    - Files: `components/Navbar.tsx`, `components/Footer.tsx`

### Tier 3 — Polish when bandwidth allows

14. Downgrade body copy from `font-bold` to `font-medium` / `font-normal`
15. Add "Most Popular" badge to Studio pricing tier
16. Add unique icons to each Engine card
17. Make Audience section cards show personas with icons
18. Remove About page engineering internals (KMS, `applyChainEvent()`) from the marketing-facing principles section

---

## Strengths to Preserve

- The Anton + DM Sans + warm paper palette is a genuine brand differentiator — protect it
- The `.cut-corner` + `.shadow-hard` card system gives the site a cohesive, physical feel
- The `content.ts` data layer is clean and well-structured; editing copy is easy
- HowItWorks accordion is technically excellent — the before/after comparison is the best section UX on the site
- The WaitlistForm error/loading/success states are production-quality
- Accessibility foundations (focus-visible, reduced-motion, aria-expanded, semantic HTML) are above average for a startup marketing site

---

*Full audit covers: `app/page.tsx`, `app/(marketing)/{about,pricing,services,blog,contact,docs,terms}/page.tsx`, `app/(marketing)/layout.tsx`, `components/{Hero,Navbar,Footer,ProblemCards,Engines,WhyChooseUs,HowItWorks,Audience,Faq,WaitlistCta,WaitlistForm}.tsx`, `lib/content.ts`, `app/globals.css`*
