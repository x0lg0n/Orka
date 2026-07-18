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
    id: "2078172336541548921",
    handle: "@buildwithorka",
  },
  {
    type: "tweet",
    id: "2078171437479997872",
    handle: "@buildwithorka",
  },
  {
    type: "tweet",
    id: "2073809072605069678",
    handle: "@buildwithorka",
  },
  {
    type: "tweet",
    id: "2073833852246634540",
    handle: "@buildwithorka",
  },
  {
    type: "tweet",
    id: "2078177499545207157",
    handle: "@buildwithorka",
  },
  {
    type: "tweet",
    id: "2076166965513863632",
    handle: "@buildwithorka",
  },
  {
    type: "tweet",
    id: "2074015365450096980",
    handle: "@buildwithorka",
  },
  {
    type: "tweet",
    id: "2075884782664442266",
    handle: "@buildwithorka",
  },
  {
    type: "tweet",
    id: "2073827235858153748",
    handle: "@buildwithorka",
  },
];
