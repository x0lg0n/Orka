import type { BlogArticle } from "../types";

export const article: BlogArticle = {
  slug: "pricing-strategies-agencies",
  title: "5 Pricing Strategies for Agencies That Actually Work",
  excerpt:
    "Value-based, retainer, hybrid — pick the right model for your stage.",
  description:
    "Compare the top pricing strategies for agencies — value-based, retainer, project-based, hybrid, and performance models — and choose the right one for your business.",
  category: "Agency",
  author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
  readingTime: "7 min read",
  publishedAt: "Apr 22, 2026",
  coverGradient: "from-lime/10 via-orange/8 to-violet/5",
  featured: false,
  sections: [
    {
      id: "introduction",
      heading: "Introduction",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "Pricing is the most leveraged decision an agency owner makes. The right model can double your revenue without adding a single client. The wrong one keeps you stuck trading time for money.",
        },
        {
          type: "paragraph",
          text: "Here are five pricing strategies that actually work, and when to use each one.",
        },
      ],
    },
    {
      id: "model-1",
      heading: "1. Project-Based Pricing",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "You charge a fixed price for a defined scope of work. The client knows exactly what they'll pay, and you know exactly what you'll earn.",
        },
        {
          type: "list",
          items: [
            "Best for: Well-defined projects with clear deliverables",
            "Pros: Predictable revenue, easy to sell",
            "Cons: Risk of scope creep, profit capped per project",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          text: "Always include a change order process in your contract. Scope creep kills project-based pricing.",
        },
      ],
    },
    {
      id: "model-2",
      heading: "2. Retainer Pricing",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "The client pays a fixed monthly fee for ongoing access to your services. This is the gold standard for agencies because it creates predictable, recurring revenue.",
        },
        {
          type: "list",
          items: [
            "Best for: Ongoing relationships (marketing, design, development)",
            "Pros: Predictable cash flow, deeper client relationships",
            "Cons: Can lead to scope creep if boundaries aren't clear",
          ],
        },
      ],
    },
    {
      id: "model-3",
      heading: "3. Value-Based Pricing",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "You price based on the value you deliver, not the time you spend. If your work generates $1M in revenue, charging $100K is a bargain — even if it only took 40 hours.",
        },
        {
          type: "list",
          items: [
            "Best for: High-impact work (strategy, consulting, growth)",
            "Pros: Uncapped revenue potential, aligns incentives",
            "Cons: Hard to sell without strong track record",
          ],
        },
        {
          type: "callout",
          variant: "insight",
          text: "Value-based pricing requires you to understand the client's business deeply. The more you know about their revenue, costs, and goals, the easier it is to justify your price.",
        },
      ],
    },
    {
      id: "model-4",
      heading: "4. Hybrid Pricing",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "Combine elements of different models. For example: a monthly retainer plus project-based fees for additional work. This gives you the stability of recurring revenue with the upside of project work.",
        },
        {
          type: "list",
          items: [
            "Best for: Agencies with both ongoing and project-based work",
            "Pros: Flexible, maximizes revenue per client",
            "Cons: More complex to manage and communicate",
          ],
        },
      ],
    },
    {
      id: "model-5",
      heading: "5. Performance-Based Pricing",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "You charge based on results. A percentage of revenue generated, cost savings achieved, or other measurable outcomes. This is high-risk, high-reward.",
        },
        {
          type: "list",
          items: [
            "Best for: Marketing, sales, and growth agencies",
            "Pros: Aligns incentives perfectly, easy to sell",
            "Cons: Revenue depends on client's execution, not just your work",
          ],
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
          text: "The best pricing model depends on your stage, your clients, and the value you deliver. Most successful agencies use a combination of models — retainers for stability, project pricing for growth, and value-based pricing for high-impact work.",
        },
        {
          type: "paragraph",
          text: "ORKA makes every pricing model easy to implement. Set up milestone-based payments, recurring retainers, or custom structures — all tracked in one place.",
        },
      ],
    },
  ],
};
