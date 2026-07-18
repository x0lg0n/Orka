# Testimonials Section — ORKA Landing Page

**Date:** 2026-07-17
**Status:** Approved (design)

## Goal

Add a social-proof "testimonials" section to the ORKA marketing landing page
(`frontend/app/page.tsx`) that showcases real Twitter/X posts and curated text
reviews for the product. Each tweet embeds a real post and links out to the
original tweet. The section must look consistent with the existing landing-page
design system and sit immediately before the waitlist CTA.

## Decisions (from brainstorming)

- **Sourcing:** Curated, hardcoded set of testimonials in a data file (no backend,
  no API keys, no live feed). Chosen over a dynamic feed for simplicity and control.
- **Placement:** Inserted between `Faq` and `WaitlistCta` in `app/page.tsx`
  (last thing before the conversion CTA — maximizes "see proof → sign up").
- **Composition:** Balanced mix — 2 real tweet embeds + 2–3 styled text-quote cards.
  Leans into the "real tweets" idea while still looking full and degrading
  gracefully if a tweet fails to load.

## Architecture

- New section component: `frontend/components/Testimonials.tsx`
  (server component; renders client `ClientTweetCard` for tweets).
- New data file: `frontend/lib/content/testimonials.ts`
  (typed array of tweet IDs + text quotes).
- magicui `ClientTweetCard` component added to the repo (not currently present).
- `app/page.tsx`: import `Testimonials` and render between `Faq` and `WaitlistCta`.

## Components

### ClientTweetCard (from magicui registry)
- Added via the magicui registry into `frontend/registry/magicui/client-tweet-card`
  (or the path the registry chooses).
- Client component; renders an embedded tweet for a given `id` and links to the
  original post. We use the **client** variant (`ClientTweetCard`) because the
  landing section needs the embedded/interactive card.
- If the registry/API is unreachable in this environment, fallback is a
  hand-written lightweight tweet card that links out using the tweet ID (still
  opens the real post at `https://twitter.com/i/web/status/<id>`).

### Testimonials section (`components/Testimonials.tsx`)
- Server component.
- Renders a `section-label` + heading matching `WhyChooseUs` style:
  - label uses `text-coral` (or `text-violet`),
  - heading uses `display` font, `uppercase`, large responsive size.
- Responsive card grid containing:
  - 2 `ClientTweetCard` embeds, and
  - 2–3 styled quote cards.
- Quote cards reuse the existing testimonial visual language from
  `components/auth-v2/MarketingPanel.tsx` (rounded border, `Quote` icon from
  lucide-react, name/role footer), adapted to the light landing-page theme
  (`bg-paper`, `border-night`, `cut-corner`).

### Data (`lib/content/testimonials.ts`)
```ts
export type TweetTestimonial = { type: "tweet"; id: string; handle?: string }
export type QuoteTestimonial = {
  type: "quote"
  quote: string
  name: string
  role: string
  avatarColor?: string
}
export type Testimonial = TweetTestimonial | QuoteTestimonial

export const testimonials: Testimonial[] = [ /* 2 tweets + 2-3 quotes */ ]
```
- Tweet IDs are placeholder curated values to be replaced with real ORKA posts.
- Quote entries are real or representative review copy for the product.

## Data flow
Static import — no backend, no API at our layer. Tweet content is fetched by
`ClientTweetCard` at render time from magicui's tweet API. Clicking a tweet card
opens the real tweet (built into the component). Text quotes are hardcoded.

## Styling (on-brand)
- Match surrounding sections: `bg-paper`, `max-w-7xl` centered container,
  `px-4 py-16 md:px-8 lg:px-12` section padding.
- Cards: reuse `cut-corner rounded-[14px] border-2 border-night bg-white` language
  used by `WhyChooseUs`.
- Grid: `grid gap-6 sm:grid-cols-2 lg:grid-cols-3` (tweet cards can span as needed).
- Label/heading color tokens (`coral`, `violet`) already defined in `globals.css`.

## Error handling
- `ClientTweetCard` manages its own loading/empty state; if a tweet fails to load
  the rest of the section still renders.
- Quote cards are pure static markup — section always renders fully.
- Curated tweet IDs avoid runtime errors from bad input.

## Verification
- `pnpm lint` passes in `frontend/`.
- `pnpm build` (Next.js type-check) passes.
- Manual check: section renders in light theme, matches neighbors, tweet cards
  are clickable to source, layout responsive at mobile and desktop widths.

## Out of scope
- No dynamic/live tweet feed, no admin UI for managing testimonials, no analytics
  on clicks. Tweets are not moderated beyond curation at write time.
