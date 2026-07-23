# ORKA Blog Listing Page — Design Spec

> **Date:** 2026-07-23
> **Status:** Approved
> **Scope:** Blog listing page only (`/blog`). No detail pages, MDX, CMS, admin, or rich editor.

## Goal

Create a premium SaaS blog listing page at `/blog` inspired by Stripe/Vercel/Linear/Supabase, while maintaining ORKA's brand identity. The page should educate users while subtly showcasing ORKA.

**Audience:** Agencies, freelancers, consultants, studios, service businesses.

## Architecture

- **Route:** `app/(marketing)/blog/page.tsx` — rewrite in-place
- **Layout:** Reuses `(marketing)/layout.tsx` (existing `Navbar` + `Footer`)
- **Components:** Co-located in `app/(marketing)/blog/components/`
- **Data:** `lib/blog-data.ts` with production-ready `BlogPost` interface
- **No content changes:** Existing pages unaffected

## File Structure

### New Files

| File | Type | Purpose |
|------|------|---------|
| `app/(marketing)/blog/page.tsx` | Server | Main blog listing page |
| `app/(marketing)/blog/components/BlogHero.tsx` | Client | Hero with search + floating UI cards |
| `app/(marketing)/blog/components/FeaturedCard.tsx` | Server | Large featured article card |
| `app/(marketing)/blog/components/CategoryFilter.tsx` | Client | Scrollable filter pills |
| `app/(marketing)/blog/components/BlogCard.tsx` | Server | Individual blog card |
| `app/(marketing)/blog/components/BlogGrid.tsx` | Server | 3-column grid of cards |
| `app/(marketing)/blog/components/BlogSidebar.tsx` | Server | Sticky sidebar with widgets |
| `app/(marketing)/blog/components/NewsletterWidget.tsx` | Client | Email subscribe widget |
| `app/(marketing)/blog/components/Pagination.tsx` | Client | Page navigation |
| `app/(marketing)/blog/components/BlogCta.tsx` | Server | Bottom CTA section |
| `app/(marketing)/blog/components/types.ts` | Shared | TypeScript interfaces |
| `lib/blog-data.ts` | Shared | Mock blog data |

### Modified Files

| File | Change |
|------|--------|
| `components/Navbar.tsx` | Change "Get started" CTA to "Join Waitlist" |

## Constraints

- **Framework:** Next.js 16 App Router, React 19, TypeScript strict
- **Styling:** Tailwind v4 (CSS-first in `globals.css` `@theme inline`)
- **Fonts:** Anton (`.display`), DM Sans (body), JetBrains Mono (`.tabular`)
- **Colors:** night (#082033), paper (#fffaf2), violet (#9474ff), teal (#22bd93), orange (#ff8a22)
- **Package manager:** pnpm
- **No comments** in code
- **Icons:** lucide-react
- **Animations:** CSS-only (globals.css has `float-y`, `dropdown-in` etc.). framer-motion installed but unused — keep CSS-only.
- **Images:** Placeholder gradients with category icons (no external image deps)
- **Responsive:** Mobile-first, breakpoints at sm/md/lg

## Design Sections

### Hero

**Left side:**
- Badge pill: `ORKA JOURNAL` — rounded-full, violet bg, white text, border
- Headline: `Insights for Modern Service Businesses` — `.display`, uppercase, text-[2.6rem] to text-[5.5rem]
- Subtitle: `Actionable insights, templates, and strategies to help agencies and freelancers run smarter and grow faster.`
- Full-width search bar: search icon, placeholder "Search articles...", `⌘K` shortcut badge

**Right side (floating cards):**
- 3-4 small cards positioned absolutely with CSS `float-y` animation
- **Proposals** card: violet icon, "AI Generated" badge
- **Escrow** card: teal icon, "Secured" badge
- **Payments** card: orange icon, "On Track" badge
- **Project card:** milestones with progress bars, dollar amounts
- Background: subtle gradient blur circles
- Mobile: floating cards hidden, hero text-only

**Background:** `bg-night`, rounded-b-[42px] (mobile) / rounded-b-[72px] (md)

### Featured Article

Large horizontal card below hero:
- Left: Gradient placeholder image (category-colored)
- Right: Category badge, title, description, author avatar + name, date, reading time
- "Read Article →" button
- Style: `border-2 border-night rounded-[20px] bg-white`

### Category Filter

Horizontal scrollable pill bar:
- Categories: All, Agency, Freelancers, Client Management, Payments, Escrow, Contracts, Proposals, Productivity, AI, Guides, Templates, News
- Active: `bg-violet text-white`
- Inactive: `border border-night/15 text-night/60 hover:bg-night/5`
- Client component with `useState` — filters grid without page reload

### Blog Grid (70% width on desktop)

3-column grid (lg:grid-cols-3), 2 on tablet (md:grid-cols-2), 1 on mobile.

Each `BlogCard`:
- Gradient placeholder image (top)
- Category badge
- Title (`.display` or font-black)
- Excerpt (2 lines max, line-clamp-2)
- Bottom: reading time, published date, author avatar + name
- Hover: `-translate-y-1`, shadow increase, image `scale-105`
- Entire card is `<Link>` wrapping all content

### Sidebar (30% width on desktop, sticky)

1. **Newsletter Widget**
   - Heading: "Weekly Agency Growth Tips"
   - Subtext: "Join 2,000+ founders getting one actionable tip every week."
   - Email input + "Subscribe" button
   - Privacy text: "No spam. Unsubscribe anytime."

2. **Free Resources**
   - 4 items with icons: Proposal Template, Contract Template, Invoice Template, Agency Onboarding Checklist
   - Each shows "Free" label on right

3. **See ORKA in Action**
   - "Book a 15-min demo and see how Orka can streamline your operations."
   - "Book a Demo →" button

4. **Recommended Reads**
   - 3 small articles: title + reading time
   - "View all articles →" link

**Responsive:** Sidebar moves below blog grid on tablet/mobile.

### Pagination

- Previous/Next arrows + page numbers (1, 2, 3, ... 12)
- Active page: violet bg
- Animated transitions

### Bottom CTA

- Dark bg (`bg-night`), rounded-[24px] to rounded-[36px]
- Subheading: "Still managing clients manually?"
- Heading: `Run your service business on autopilot.` — `.display`, uppercase
- "Join Waitlist" primary button (violet) + "See how it works →" secondary link
- Decorative ORKA branding elements

### Navbar Change

Only change: replace "Get started" button text with "Join Waitlist" in `components/Navbar.tsx`.

## Data Structure

```typescript
interface BlogAuthor {
  name: string;
  avatar: string; // initials or placeholder
  role: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverGradient: string; // CSS gradient for placeholder
  category: string;
  author: BlogAuthor;
  readingTime: string;
  publishedAt: string;
  featured: boolean;
}
```

Mock data: ~12 posts across categories, 1 featured.

## Responsive Behavior

| Breakpoint | Grid | Sidebar | Floating Cards | Filters |
|------------|------|---------|----------------|---------|
| Mobile (<768px) | 1 col | Below content | Hidden | Scroll horizontal |
| Tablet (768-1023px) | 2 col | Below content | Hidden | Scroll horizontal |
| Desktop (≥1024px) | 3 col | Sticky right | Visible | Scroll horizontal |

## Performance

- Lazy-load images (next/image where applicable)
- No layout shift (fixed aspect ratios for placeholders)
- CSS-only animations (no JS animation libraries)
- Minimal client components (only interactive widgets)
