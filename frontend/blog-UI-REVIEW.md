# ORKA Blog — UI Review

**Audited:** 2026-07-24
**Baseline:** Abstract 6-pillar standards (no formal UI-SPEC.md found for blog-specific design contract)
**Screenshots:** Captured — blog-desktop.png, blog-mobile.png, blog-tablet.png, article-desktop.png, article-mobile.png

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | Strong CTAs and benefit-driven headlines, but dead-end links, nonfunctional "popular" sort, and mismatched CTA messaging |
| 2. Visuals | 4/4 | Polished hero with animated decorative elements, consistent card aesthetic, logical layout rhythm |
| 3. Color | 4/4 | Violet accent use is consistent throughout; dark hero / white card contrast works; warm paper background feels premium |
| 4. Typography | 3/4 | Anton display and DM Sans product fonts create strong personality, but 6+ hardcoded font sizes outside the declared scale |
| 5. Spacing | 4/4 | Consistent padding, balanced grid gaps, generous section separation, adequate article gutters |
| 6. Experience Design | 3/4 | Sticky sidebars, TOC IntersectionObserver, reading progress bar all work correctly; but dead-end links, nonfunctional sort option, missing loading/error boundaries |

**Overall: 21/24**

---

## Top 5 Priority Fixes

1. **Fix "View all articles →" and "View all posts →" links** — These point to `/blog` which is the same page, causing unnecessary navigation. Change to filter-reset behavior or remove. **Files:** `BlogSidebar.tsx:78`, `BlogSidebar.tsx:106`, `AuthorCard.tsx:20`

2. **Fix "popular" sort — it is nonfunctional** — The popular sort (`page.tsx:22`) relies on `post.featured` being truthy, but **zero of 28 posts** have `featured: true` in `blog-data.ts`. Either implement a proper popularity sort (by read count, engagement) or remove this sort option. **Files:** `page.tsx:22`, `blog-data.ts`

3. **Replace hardcoded font sizes with theme tokens** — 6+ arbitrary font-size values (`text-[2.6rem]`, `text-[10px]`, `text-[12px]`, `text-[14px]`, `text-[72px]`, `md:text-[2.8rem]`) exist outside the declared `2xs/ xs/ sm/ base/ md/ lead` scale. Use the defined tokens or extend the scale properly. **Files:** `BlogHero.tsx:64`, `TableOfContents.tsx:31,39`, `PrevNextNav.tsx:20,23,35,38`, `BlogCta.tsx:36`, `ArticleHeader.tsx:30`

4. **Make "Save" bookmark persistent** — The `handleSave` in `ShareButtons.tsx:25-27` toggles client-only state that resets on refresh. Either wire to localStorage, a backend endpoint, or add a note that saves are session-only. **File:** `ShareButtons.tsx`

5. **Paragraph text size in `prose-orka` is 15px (0.9375rem)** — This is small for extended article reading. Consider bumping to 16–17px (1rem–1.0625rem) for better readability. **File:** `globals.css:779`

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)

**What's done well:**
- Benefit-driven headlines: "How AI Writes Better Proposals (That Clients Actually Accept)", "7 Client Management Mistakes That Cost Agencies Thousands Every Year" — specific, outcome-oriented
- Excerpts are concise and compelling (25–35 words avg)
- CTA labels are action-oriented: "Subscribe", "Explore Platform", "Get started", "Read Article", "Clear search"
- Tone is consistent: expert, educational, slightly aspirational
- Social proof in NewsletterWidget: "Join 2,000+ founders getting one actionable tip every week."
- Empty states are well-handled: "No articles found matching "{query}"" with "Clear search" reset button

**Issues:**
- **BLOCKER:** "View all articles →" link (`BlogSidebar.tsx:78`) and "View all resources →" link (`BlogSidebar.tsx:106`) both hardcode `href="/blog"` which navigates to the same page, causing a full re-render with no state change. Similarly "View all posts →" (`AuthorCard.tsx:20`) goes to `/blog`.
- **WARNING:** "popular" sort option (`page.tsx:22`) sorts by `post.featured ? -1 : 1`, but zero of 28 posts have `featured: true` (`blog-data.ts`). This makes "Most Popular" functionally identical to other sorts, misleading users.
- **WARNING:** The bottom CTA "Stop losing revenue to broken client processes" (`ArticleFooterCta.tsx:9`) uses different framing from the listing CTA "Ready to run your agency on autopilot?" (`BlogCta.tsx:38`) — slightly inconsistent messaging across the two CTAs.
- **MINOR:** LeadCaptureCard CTA button says "Explore Platform" but onSubmit calls `/api/waitlist` — the CTA label implies product exploration but the action is email capture. Mismatch between promise and action.
- **MINOR:** BlogGrid empty state text "No articles found in this category" (`BlogGrid.tsx:8`) — this code path is shadowed by the empty state in `page.tsx:86-100` and will never render (page.tsx checks `filtered.length === 0` and renders its own empty state before reaching BlogGrid).

---

### Pillar 2: Visuals (4/4)

**What's done well:**
- Hero is visually rich: dark night background (`#082033`) with 6 floating SVG decorative elements (Star-Violet, Plus-Teal, Star-Blue, Plus-Lime, Asterics-Orange, Star.png) each using distinct animation classes (`float-1` through `float-5` with `float-y`, `float-bob`, `float-spin` keyframes)
- Four color-coded stickers (Proposals→violet, Escrow→teal, Payments→orange, Milestones→lime) with brand-colored shadows and subtle rotation for playfulness
- Card design is consistent: `rounded-[18px]`, `border-2 border-night`, white background, gradient covers on top, hover lift (`-translate-y-1`) with shadow
- Layout rhythm is logical: hero → two-column (sidebar + grid) → CTA
- FeaturedCard uses `md:grid-cols-[1.2fr_1fr]` layout for visual variety
- TOC active item uses `border-l-2 border-violet` for clear visual tracking
- Share buttons are compact and accessible with icon+text labels
- Callout boxes are visually distinct per variant (violet/teal/orange/coral backgrounds with matching icons)
- Premium rounded corners throughout: `rounded-b-[42px]` on hero, `rounded-[28px]` on CTA, `rounded-[18px]` on cards
- `prefers-reduced-motion` media query disables all animations for accessibility (globals.css:352-362)

**PASS — standout detail:** The hero sticker shadows match the sticker accent color (violet shadow for Proposals, teal for Escrow, orange for Payments, lime for Milestones). This is a premium touch that visually connects each sticker to its brand color without requiring border or heavy background.

**Issues:**
- **MINOR:** The `aspect-[16/10]` on card gradient containers is not a standard aspect ratio (16:9 or 4:3 are conventional). This is intentional and works, but slightly unusual.
- **MINOR:** Bento-grid sticker layout uses absolute positioning at specific percentages (`left-[10%] top-[5%]`, etc.) — this is rigid and could break at intermediate breakpoints between `lg` and full width. Verified margins: `left-[0%]` for Escrow sticker is flush against left container edge.

---

### Pillar 3: Color (4/4)

**What's done well:**
- Violet (`#9474ff`) accent is used 52 times across blog components: buttons (`bg-violet`), links (`text-violet`), TOC active (`border-violet text-violet`), category filter active (`bg-violet/10 text-violet border-l-violet`), pagination active (`bg-violet`), callout "insight" and "example" variants
- Dark night (`bg-night` = `#082033`) hero provides strong contrast with white card elements
- Paper background (`bg-paper` = `#fffaf2`) is warm and distinct from pure white
- Gradient card covers use diverse combinations: `from-violet/15 via-info/10 to-violet/5`, `from-teal/15 via-teal/8 to-lime/5`, `from-orange/12 via-orange/6 to-coral/5` — each card has a unique gradient
- Orange/teal/lime/coral accent colors are used sparingly for playful sticker pops
- Color tokens are properly namespaced (globals.css:25-47) and not just inline hex values
- Prose link color consistently uses `#9474ff` with proper hover state (`#7c5ce0`)

**Issues:**
- **WARNING:** Hardcoded colors in SVG elements (`BlogCta.tsx:25`: `stroke="#ff8a22"`, `:30`: `stroke="#eaff35"`) — minor inconsistency with the token system, should use `currentColor` with text color classes
- **MINOR:** Category filter active state uses `border-l-[3px]` and `pl-[9px]` — the 9px left padding is an arbitrary value that compensates for the 3px border. The standard approach would be `border-l-2` (2px) or `border-l-4` (4px) to match Tailwind's scale, avoiding the need for manual pixel compensation.

---

### Pillar 4: Typography (3/4)

**What's done well:**
- Dual font system: Anton (Impact-like) for `.display` headings, DM Sans for product/prose — creates strong personality contrast
- Font weight hierarchy is logical: `font-black` (900) for headings and CTAs, `font-bold` (700) for body text, `font-normal` (400) for paragraph prose
- Hero heading cascades across breakpoints: `text-[2.6rem]` → `text-[4rem]` → `text-[5rem]` (mobile → sm → md)
- Custom type scale is tightly controlled at 6 sizes: `2xs(10px)`, `xs(11px)`, `sm(12px)`, `base(13px)`, `md(15px)`, `lead(18px)` — keeps variance minimal
- `prose-orka` class provides structured typography for article content with clear h2 (`1.6rem, 900 weight, uppercase`), h3 (`1.15rem, 800`), and paragraph (`0.9375rem, 600 weight`) hierarchy
- Uppercase + tracking-wider pattern on category badges, section labels, and sidebar headings creates a consistent label system
- Backward-compatible `font-heading`/`font-sans` tokens are set (globals.css:58-59)

**Issues:**
- **WARNING:** 6+ hardcoded font sizes outside the declared scale:
  - `text-[2.6rem]` — BlogHero.tsx:64 (hero title mobile)
  - `text-[10px]` — TableOfContents.tsx:31 (TOC heading), PrevNextNav.tsx:20,35 (prev/next labels)
  - `text-[12px]` — TableOfContents.tsx:39 (TOC link text)
  - `text-[14px]` — PrevNextNav.tsx:23,38 (prev/next title text)
  - `text-[72px]` — BlogCta.tsx:36 (CTA heading large desktop)
  - `md:text-[2.8rem]` — ArticleHeader.tsx:30 (article title medium breakpoint)
- **WARNING:** `text-2xs` is 10px — used for category tags, reading time, sidebar "Free" labels. This is very small and may fail WCAG AA at standard zoom levels (guideline: minimum 10px for essential text, but 10px is borderline)
- **MINOR:** TOC line height (`py-1` on `text-[12px]`) is cramped — 12px text with minimal padding may cause tight touch targets on mobile

---

### Pillar 5: Spacing (4/4)

**What's done well:**
- Card content padding is consistent at `p-5` across BlogCard, FeaturedCard, RelatedPosts, and sidebar sections
- Grid system uses balanced gaps: `gap-x-6 gap-y-8` — adequate horizontal breathing room with generous vertical spacing
- Sidebar sections use `space-y-6` for consistent 24px vertical rhythm
- Hero uses `mt-6` between title, description, and content elements — 24px on the 4px/8px grid
- Section padding: `py-12` on main content section, `py-16` on CTA sections — generous separation
- Article 3-column layout: `gap-8` (32px) gutters between columns — sufficient for clear separation
- `max-w-7xl` constrains content to 1280px, `max-w-[1400px]` on article page for slightly wider reading
- Reading progress bar uses `py-2` — compact but functional
- Newsletter/LeadCapture form elements use `py-2.5` with proper icon placement (`pl-9`)

**Issues:**
- **MINOR:** Category filter active state uses `pl-[9px]` and `border-l-[3px]` (CategoryFilter.tsx:31-32) — these are arbitrary pixel values outside the design scale. Should be `border-l-2` (2px) or `pl-3` (12px) to align with standard spacing
- **MINOR:** Sidebar width is `w-[280px]` (BlogSidebar.tsx:32) — an arbitrary value, though likely intentional for design precision

---

### Pillar 6: Experience Design (3/4)

**What's done well:**
- **Sidebar sticky behavior:** `sticky top-24` + `self-start` on BlogSidebar (BlogSidebar.tsx:32-33) correctly implements scroll-locked sidebar
- **Article sticky columns:** Both TOC (`.sticky top-28` at line 75) and right sidebar (`.sticky top-28 space-y-6` at line 89) are properly sticky on scroll
- **Reading progress bar:** `sticky top-0 z-50` with `backdrop-blur-md` — scroll listener calculates `article` element scroll percentage with proper edge case handling (0% and 100% clamping, `totalScrollable <= 0` → 100%)
- **TOC active tracking:** Uses `IntersectionObserver` with `rootMargin: "-80px 0px -70% 0px"` (TableOfContents.tsx:18) — correct implementation with offset for sticky header
- **Pagination:** Handles edge cases — returns `null` for 1 page, smart ellipsis logic (`currentPage > 3` / `currentPage < totalPages - 2`), proper disabled states on prev/next
- **Search:** Filters by title, excerpt, and category — covers all relevant search dimensions
- **Loading states:** NewsletterWidget and LeadCaptureCard both show spinners (`Loader2 animate-spin`) and disable inputs during async operations
- **Form validation:** Both forms have client-side validation with error display, `aria-invalid` attribute, and error-border styling
- **Sort dropdown:** Click-outside-to-close via `mousedown` listener, proper `aria-expanded` attribute
- **Focus states:** Every interactive element has `focus-visible:outline-2` with violet styling
- **Accessibility:** All icon-only buttons have `aria-label`, decorative SVGs have `aria-hidden`, form inputs have `aria-label`
- **550+ lines of text content** across 28 articles — substantial content investment

**Issues:**
- **WARNING:** Sort "popular" (`page.tsx:22`) sorts by `post.featured ? -1 : 1`, but `blog-data.ts` has zero posts with `featured: true`. This sort option literally does nothing. Either add `featured: true` to some posts or implement a proper popularity metric.
- **WARNING:** "View all articles →" link `href="/blog"` (`BlogSidebar.tsx:106`), "View all resources →" `href="/resources"` (`BlogSidebar.tsx:78`), "View all posts →" `href="/blog"` (`AuthorCard.tsx:20`) — the `/blog` links are self-referential dead ends. They should be removed or pointed to a meaningful route.
- **WARNING:** ShareButtons "Save" feature (`ShareButtons.tsx:25-27`) uses in-memory state only — bookmarks reset on page refresh with no user feedback about ephemerality
- **WARNING:** No loading skeleton for blog grid — while pages are statically rendered, there's no loading UI path if data fetching were dynamic
- **MINOR:** ShareButtons `navigator.share` error catch (`ShareButtons.tsx:36-38`) — error is silently swallowed with no user feedback if share fails
- **MINOR:** Prose paragraph text at `0.9375rem` (15px) with `line-height: 1.75` — at the smaller end for comfortable long-form reading. Consider 16–17px.
- **MINOR:** No confirmation dialog for destructive actions (none present — forms are submissions only, no deletes)

---

## Files Audited

| File | Lines | Role |
|------|-------|------|
| `frontend/app/(marketing)/blog/page.tsx` | 118 | Listing page with state management |
| `frontend/app/(marketing)/blog/components/BlogHero.tsx` | 122 | Dark hero + floating stickers |
| `frontend/app/(marketing)/blog/components/BlogSidebar.tsx` | 115 | Sidebar with search, categories, newsletter, guides, resources |
| `frontend/app/(marketing)/blog/components/BlogSearch.tsx` | 38 | Search input |
| `frontend/app/(marketing)/blog/components/CategoryFilter.tsx` | 45 | Category filter with counts |
| `frontend/app/(marketing)/blog/components/NewsletterWidget.tsx` | 98 | Email subscription form |
| `frontend/app/(marketing)/blog/components/BlogGrid.tsx` | 22 | Blog card grid container |
| `frontend/app/(marketing)/blog/components/BlogCard.tsx` | 60 | Individual blog card |
| `frontend/app/(marketing)/blog/components/FeaturedCard.tsx` | 69 | Hero featured card |
| `frontend/app/(marketing)/blog/components/Pagination.tsx` | 81 | Page navigation with ellipsis |
| `frontend/app/(marketing)/blog/components/SortDropdown.tsx` | 64 | Sort control with click-outside |
| `frontend/app/(marketing)/blog/components/BlogCta.tsx` | 55 | Bottom CTA section |
| `frontend/app/(marketing)/blog/[slug]/page.tsx` | 107 | Article 3-column layout |
| `frontend/app/(marketing)/blog/[slug]/components/ReadingProgress.tsx` | 51 | Top reading progress bar |
| `frontend/app/(marketing)/blog/[slug]/components/ArticleHeader.tsx` | 65 | Breadcrumb, title, meta |
| `frontend/app/(marketing)/blog/[slug]/components/ArticleContent.tsx` | 62 | Section content renderer |
| `frontend/app/(marketing)/blog/[slug]/components/TableOfContents.tsx` | 54 | Sticky TOC with IntersectionObserver |
| `frontend/app/(marketing)/blog/[slug]/components/AuthorCard.tsx` | 27 | Author info card |
| `frontend/app/(marketing)/blog/[slug]/components/LeadCaptureCard.tsx` | 124 | Name/email lead form |
| `frontend/app/(marketing)/blog/[slug]/components/ResourceCard.tsx` | 39 | Resource link card |
| `frontend/app/(marketing)/blog/[slug]/components/RelatedPosts.tsx` | 57 | Related posts grid |
| `frontend/app/(marketing)/blog/[slug]/components/ArticleFooterCta.tsx` | 36 | Bottom CTA card |
| `frontend/app/(marketing)/blog/[slug]/components/PrevNextNav.tsx` | 47 | Previous/next article nav |
| `frontend/app/(marketing)/blog/[slug]/components/ShareButtons.tsx` | 74 | Social share buttons |
| `frontend/app/(marketing)/blog/[slug]/components/Callout.tsx` | 80 | Colored callout boxes (5 variants) |
| `frontend/app/(marketing)/blog/[slug]/components/QuoteBlock.tsx` | 9 | Styled quote block |
| `frontend/lib/blog-data.ts` | 438 | 28 blog posts data layer |
| `frontend/lib/blog-renderer.tsx` | 259 | Content rendering logic |
| `frontend/lib/blogs/types.ts` | 56 | Blog article type definitions |
| `frontend/lib/blogs/index.ts` | 167 | Article lookup, TOC extraction, related/prev-next |
| `frontend/app/globals.css` | 866 | Theme tokens, animations, prose styles |
| `frontend/app/(marketing)/blog/components/types.ts` | 19 | BlogPost type |

---

## Registry Safety Audit

`components.json` — Not applicable. No shadcn third-party registries are involved in the blog page components. All components are custom-built using standard React + Tailwind patterns. Skipped.