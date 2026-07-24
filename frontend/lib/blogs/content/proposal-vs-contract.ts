import type { BlogArticle } from "../types";

export const article: BlogArticle = {
  slug: "proposal-vs-contract-vs-invoice",
  title: "Proposal vs Contract vs Invoice: What's the Difference?",
  excerpt:
    "A simple breakdown every service business owner should know.",
  description:
    "Understand the key differences between proposals, contracts, and invoices — and how each one fits into your client workflow.",
  category: "Guides",
  author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
  readingTime: "4 min read",
  publishedAt: "May 3, 2026",
  coverGradient: "from-violet/10 via-coral/8 to-orange/5",
  featured: false,
  sections: [
    {
      id: "introduction",
      heading: "Introduction",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "Proposals, contracts, and invoices are three different documents that serve three different purposes. Confusing them — or skipping any of them — leads to confusion and lost revenue.",
        },
        {
          type: "paragraph",
          text: "Here's a clear breakdown of what each one does and when to use it.",
        },
      ],
    },
    {
      id: "proposal",
      heading: "The Proposal",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "A proposal is your pitch. It tells the client what you'll do, how you'll do it, and what it costs. It's persuasive, visual, and designed to win the project.",
        },
        {
          type: "list",
          items: [
            "Purpose: Win the client",
            "Timing: Before any work begins",
            "Content: Scope, approach, timeline, pricing",
            "Binding: No — it's an offer, not an agreement",
            "Outcome: Client accepts or negotiates",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          text: "A great proposal focuses on the client's problem, not your process. Lead with outcomes, not activities.",
        },
      ],
    },
    {
      id: "contract",
      heading: "The Contract",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "A contract is the legal agreement. Once both parties sign, it's binding. It protects both you and the client by defining expectations, responsibilities, and remedies.",
        },
        {
          type: "list",
          items: [
            "Purpose: Protect both parties",
            "Timing: After proposal acceptance, before work begins",
            "Content: Legal terms, scope, payment schedule, IP, termination",
            "Binding: Yes — legally enforceable",
            "Outcome: Work begins",
          ],
        },
      ],
    },
    {
      id: "invoice",
      heading: "The Invoice",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "An invoice is a request for payment. It's sent after work is delivered (or according to the payment schedule in the contract).",
        },
        {
          type: "list",
          items: [
            "Purpose: Get paid",
            "Timing: After deliverable is approved (or on schedule)",
            "Content: Amount due, payment terms, bank details",
            "Binding: No — but non-payment can trigger contract remedies",
            "Outcome: Client pays",
          ],
        },
        {
          type: "callout",
          variant: "best-practice",
          text: "With ORKA, invoices are generated automatically when a milestone is approved. No manual invoicing, no chasing payments.",
        },
      ],
    },
    {
      id: "conclusion",
      heading: "Conclusion",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "Proposal → Contract → Invoice. Three documents, three purposes, one smooth workflow.",
        },
        {
          type: "paragraph",
          text: "ORKA handles all three in a single flow. Write a proposal, convert it to a contract with one click, and invoice automatically when milestones are approved.",
        },
      ],
    },
  ],
};
