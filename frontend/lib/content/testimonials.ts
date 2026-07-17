export type TweetTestimonial = {
  type: "tweet"
  id: string
  handle?: string
}

export type QuoteTestimonial = {
  type: "quote"
  quote: string
  name: string
  role: string
  avatarColor?: string
}

export type Testimonial = TweetTestimonial | QuoteTestimonial

// Curated social proof for the landing page.
// Replace the `id` values with real ORKA tweets (the numeric ID from the tweet URL).
export const testimonials: Testimonial[] = [
  {
    type: "tweet",
    id: "2073820124415742461",
    handle: "@buildwithorka",
  },
  {
    type: "quote",
    quote:
      "Orka has completely transformed how we manage client work and get paid. The escrow feature gives our clients so much confidence.",
    name: "Sarah Chen",
    role: "Founder, PixelCraft",
    avatarColor: "from-violet to-orange",
  },
  {
    type: "tweet",
    id: "2073809072605069678",
    handle: "@buildwithorka",
  },
  {
    type: "tweet",
    id: "2074015365450096980",
    handle: "@buildwithorka",
  },
  {
    type: "quote",
    quote:
      "We closed three agency deals in our first week on Orka. Milestone payments mean we never chase invoices again.",
    name: "Marcus Reid",
    role: "Studio Lead, Northbound",
    avatarColor: "from-orange to-violet",
  },
  {
    type: "quote",
    quote:
      "Borderless payouts on Stellar were the dealbreaker for our international clients. Setup took minutes, not weeks.",
    name: "Lina Okafor",
    role: "Freelance Product Designer",
    avatarColor: "from-violet to-orange",
  },
];
