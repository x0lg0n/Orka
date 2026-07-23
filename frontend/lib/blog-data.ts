import type { BlogPost } from "@/app/(marketing)/blog/components/types";

export interface TocHeading {
  id: string;
  title: string;
  level: 2 | 3;
}

export interface BlogPostDetail extends BlogPost {
  headings: TocHeading[];
  relatedSlugs: string[];
}

export const categories = [
  "All",
  "Agency",
  "Freelancers",
  "Client Management",
  "Payments",
  "Escrow",
  "Contracts",
  "Proposals",
  "Productivity",
  "AI",
  "Guides",
  "Templates",
  "News",
] as const;

export type Category = (typeof categories)[number];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "agencies-lose-revenue-bad-client-management",
    title: "How Agencies Lose 40% Revenue Because of Bad Client Management",
    excerpt:
      "From scattered proposals to delayed payments, learn the 5 biggest leaks in your agency operations (and how to fix them).",
    coverGradient: "from-violet/20 via-violet/10 to-teal/10",
    category: "Agency",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "8 min read",
    publishedAt: "May 12, 2026",
    featured: true,
  },
  {
    id: "2",
    slug: "ai-writes-better-proposals",
    title: "How AI Writes Better Proposals (That Clients Actually Accept)",
    excerpt:
      "Prompt strategies, structure,, and real examples from winning proposals.",
    coverGradient: "from-violet/15 via-info/10 to-violet/5",
    category: "AI",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "6 min read",
    publishedAt: "May 10, 2026",
    featured: false,
  },
  {
    id: "3",
    slug: "escrow-future-of-client-payments",
    title: "Why Escrow Is the Future of Client Payments",
    excerpt:
      "Build trust, reduce risk, and get paid on time with milestone-based escrow.",
    coverGradient: "from-teal/15 via-teal/8 to-lime/5",
    category: "Escrow",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "7 min read",
    publishedAt: "May 9, 2026",
    featured: false,
  },
  {
    id: "4",
    slug: "freelancer-contracts-protect-you",
    title: "Freelancer Contracts That Protect You (And Your Clients)",
    excerpt:
      "Key clauses every freelancer and agency should include in 2026.",
    coverGradient: "from-orange/12 via-orange/6 to-coral/5",
    category: "Contracts",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "5 min read",
    publishedAt: "May 8, 2026",
    featured: false,
  },
  {
    id: "5",
    slug: "agency-onboarding-checklist",
    title: "The Ultimate Agency Onboarding Checklist",
    excerpt:
      "A step-by-step system to onboard clients smoothly and reduce churn.",
    coverGradient: "from-lime/12 via-lime/6 to-teal/5",
    category: "Agency",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "6 min read",
    publishedAt: "May 6, 2026",
    featured: false,
  },
  {
    id: "6",
    slug: "managing-multiple-projects",
    title: "Managing Multiple Projects Without Losing Your Mind",
    excerpt:
      "Workflows, tools and systems that keep your projects on track.",
    coverGradient: "from-info/12 via-info/6 to-violet/5",
    category: "Productivity",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "8 min read",
    publishedAt: "May 5, 2026",
    featured: false,
  },
  {
    id: "7",
    slug: "proposal-vs-contract-vs-invoice",
    title: "Proposal vs Contract vs Invoice: What's the Difference?",
    excerpt:
      "A simple breakdown every service business owner should know.",
    coverGradient: "from-violet/10 via-coral/8 to-orange/5",
    category: "Guides",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "4 min read",
    publishedAt: "May 3, 2026",
    featured: false,
  },
  {
    id: "8",
    slug: "milestone-payments-client-trust",
    title: "Why Milestone-Based Payments Build 10x More Client Trust",
    excerpt:
      "Stop chasing invoices. Start approving milestones.",
    coverGradient: "from-teal/12 via-violet/8 to-teal/5",
    category: "Payments",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "6 min read",
    publishedAt: "May 1, 2026",
    featured: false,
  },
  {
    id: "9",
    slug: "freelancer-to-agency-owner",
    title: "From Freelancer to Agency Owner: A Complete Guide",
    excerpt:
      "The systems, mindset, and tools you need to make the leap.",
    coverGradient: "from-orange/10 via-lime/8 to-teal/5",
    category: "Agency",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "9 min read",
    publishedAt: "Apr 28, 2026",
    featured: false,
  },
  {
    id: "10",
    slug: "ai-helps-agencies-win-clients",
    title: "How AI Helps Agencies Win More Clients in Less Time",
    excerpt:
      "From proposal generation to client research — AI tools that actually work.",
    coverGradient: "from-violet/15 via-violet/10 to-info/5",
    category: "AI",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "5 min read",
    publishedAt: "Apr 25, 2026",
    featured: false,
  },
  {
    id: "11",
    slug: "pricing-strategies-agencies",
    title: "5 Pricing Strategies for Agencies That Actually Work",
    excerpt:
      "Value-based, retainer, hybrid — pick the right model for your stage.",
    coverGradient: "from-lime/10 via-orange/8 to-violet/5",
    category: "Agency",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "7 min read",
    publishedAt: "Apr 22, 2026",
    featured: false,
  },
  {
    id: "12",
    slug: "client-portal-benefits",
    title: "Why Every Agency Needs a Client Portal in 2026",
    excerpt:
      "Reduce back-and-forth, build trust, and look professional overnight.",
    coverGradient: "from-info/12 via-violet/8 to-teal/5",
    category: "Client Management",
    author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
    readingTime: "5 min read",
    publishedAt: "Apr 18, 2026",
    featured: false,
  },

];

const postDetails: Record<string, Omit<BlogPostDetail, keyof BlogPost>> = {
  "agencies-lose-revenue-bad-client-management": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "why-agencies-lose-revenue-to-poor-client-management", title: "Why Agencies Lose Revenue to Poor Client Management", level: 2 },
      { id: "the-proposal-problem-that-kills-deals", title: "The Proposal Problem That Kills Deals", level: 3 },
      { id: "why-most-contracts-fail-to-protect-you", title: "Why Most Contracts Fail to Protect You", level: 3 },
      { id: "5-client-management-mistakes-costing-you-money", title: "5 Client Management Mistakes Costing You Money", level: 2 },
      { id: "how-orka-eliminates-these-revenue-leaks", title: "How ORKA Eliminates These Revenue Leaks", level: 2 },
      { id: "the-orka-workflow", title: "The ORKA Workflow", level: 2 },
      { id: "what-agencies-report-after-switching-to-orka", title: "What Agencies Report After Switching to ORKA", level: 2 },
      { id: "best-practices-for-agency-client-management", title: "Best Practices for Agency Client Management", level: 2 },
      { id: "conclusion", title: "Conclusion", level: 2 },
      { id: "faq", title: "FAQ", level: 2 },
    ],
    relatedSlugs: [
      "milestone-payments-client-trust",
      "proposal-vs-contract-vs-invoice",
      "ai-helps-agencies-win-clients",
    ],
  },
  "ai-writes-better-proposals": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "3-ways-ai-proposal-tools-save-hours-every-week", title: "3 Ways AI Proposal Tools Save Hours Every Week", level: 2 },
      { id: "eliminate-blank-page-paralysis", title: "Eliminate Blank-Page Paralysis", level: 3 },
      { id: "personalize-at-scale", title: "Personalize at Scale", level: 3 },
      { id: "optimize-for-close-rates", title: "Optimize for Close Rates", level: 3 },
      { id: "what-makes-an-ai-proposal-effective", title: "What Makes an AI Proposal Effective?", level: 2 },
      { id: "how-proposal-quality-improves-client-trust", title: "How Proposal Quality Improves Client Trust", level: 2 },
      { id: "ai-proposals-and-the-orka-platform", title: "AI Proposals and the ORKA Platform", level: 2 },
      { id: "when-ai-cant-replace-the-personal-touch", title: "When AI Can't Replace the Personal Touch", level: 2 },
      { id: "conclusion", title: "Conclusion", level: 2 },
      { id: "faq", title: "FAQ", level: 2 },
    ],
    relatedSlugs: [
      "agencies-lose-revenue-bad-client-management",
      "proposal-vs-contract-vs-invoice",
      "freelancer-contracts-protect-you",
    ],
  },
  "escrow-future-of-client-payments": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "the-trust-problem-in-client-payments", title: "The Trust Problem in Client Payments", level: 2 },
      { id: "how-escrow-protects-both-parties", title: "How Escrow Protects Both Parties", level: 2 },
      { id: "why-traditional-milestone-payments-fall-short", title: "Why Traditional Milestone Payments Fall Short", level: 2 },
      { id: "setting-up-smart-escrow-milestones", title: "Setting Up Smart Escrow Milestones", level: 2 },
      { id: "orkas-escrow-how-it-works", title: "ORKA's Escrow: How It Works", level: 2 },
      { id: "is-escrow-right-for-every-project", title: "Is Escrow Right for Every Project?", level: 2 },
      { id: "conclusion", title: "Conclusion", level: 2 },
      { id: "faq", title: "FAQ", level: 2 },
    ],
    relatedSlugs: [
      "milestone-payments-client-trust",
      "freelancer-contracts-protect-you",
      "agencies-lose-revenue-bad-client-management",
    ],
  },
  "freelancer-contracts-protect-you": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "what-a-strong-freelancer-contract-includes", title: "What a Strong Freelancer Contract Includes", level: 2 },
      { id: "why-most-freelancers-skip-contracts", title: "Why Most Freelancers Skip Contracts", level: 2 },
    ],
    relatedSlugs: [
      "proposal-vs-contract-vs-invoice",
      "agencies-lose-revenue-bad-client-management",
      "milestone-payments-client-trust",
    ],
  },
  "agency-onboarding-checklist": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "the-agency-onboarding-checklist-preview", title: "The Agency Onboarding Checklist Preview", level: 2 },
      { id: "why-onboarding-matters-for-retention", title: "Why Onboarding Matters for Retention", level: 2 },
    ],
    relatedSlugs: [
      "client-portal-benefits",
      "managing-multiple-projects",
      "agencies-lose-revenue-bad-client-management",
    ],
  },
  "managing-multiple-projects": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "managing-multiple-projects-without-losing-your-mind", title: "Managing Multiple Projects Without Losing Your Mind", level: 2 },
      { id: "why-scattered-projects-fail", title: "Why Scattered Projects Fail", level: 2 },
    ],
    relatedSlugs: [
      "agency-onboarding-checklist",
      "pricing-strategies-agencies",
      "ai-helps-agencies-win-clients",
    ],
  },
  "proposal-vs-contract-vs-invoice": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "proposal-vs-contract-vs-invoice-the-relationship", title: "Proposal vs Contract vs Invoice: The Relationship", level: 2 },
      { id: "why-they-should-be-connected", title: "Why They Should Be Connected", level: 2 },
    ],
    relatedSlugs: [
      "agencies-lose-revenue-bad-client-management",
      "freelancer-contracts-protect-you",
      "milestone-payments-client-trust",
    ],
  },
  "milestone-payments-client-trust": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "why-milestone-payments-build-client-trust", title: "Why Milestone Payments Build Client Trust", level: 2 },
      { id: "how-to-structure-milestone-payments", title: "How to Structure Milestone Payments", level: 2 },
    ],
    relatedSlugs: [
      "escrow-future-of-client-payments",
      "agencies-lose-revenue-bad-client-management",
      "proposal-vs-contract-vs-invoice",
    ],
  },
  "freelancer-to-agency-owner": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "the-freelancer-to-agency-owner-transition", title: "The Freelancer to Agency Owner Transition", level: 2 },
      { id: "operations", title: "Operations", level: 3 },
      { id: "pricing", title: "Pricing", level: 3 },
      { id: "client-management", title: "Client Management", level: 3 },
    ],
    relatedSlugs: [
      "pricing-strategies-agencies",
      "agency-onboarding-checklist",
      "client-portal-benefits",
    ],
  },
  "ai-helps-agencies-win-clients": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "how-ai-helps-agencies-win-clients", title: "How AI Helps Agencies Win Clients", level: 2 },
      { id: "the-ai-workflow-for-client-acquisition", title: "The AI Workflow for Client Acquisition", level: 2 },
    ],
    relatedSlugs: [
      "ai-writes-better-proposals",
      "agencies-lose-revenue-bad-client-management",
      "pricing-strategies-agencies",
    ],
  },
  "pricing-strategies-agencies": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "5-pricing-strategies-for-agencies", title: "5 Pricing Strategies for Agencies", level: 2 },
      { id: "why-hourly-billing-hurts-your-agency", title: "Why Hourly Billing Hurts Your Agency", level: 2 },
    ],
    relatedSlugs: [
      "freelancer-to-agency-owner",
      "proposal-vs-contract-vs-invoice",
      "agencies-lose-revenue-bad-client-management",
    ],
  },
  "client-portal-benefits": {
    headings: [
      { id: "introduction", title: "Introduction", level: 2 },
      { id: "why-every-agency-needs-a-client-portal-in-2025", title: "Why Every Agency Needs a Client Portal in 2025", level: 2 },
      { id: "what-to-look-for-in-a-client-portal", title: "What to Look for in a Client Portal", level: 2 },
    ],
    relatedSlugs: [
      "agency-onboarding-checklist",
      "milestone-payments-client-trust",
      "proposal-vs-contract-vs-invoice",
    ],
  },
};

const defaultDetail: Omit<BlogPostDetail, keyof BlogPost> = {
  headings: [
    { id: "introduction", title: "Introduction", level: 2 },
    { id: "main-content", title: "Main Content", level: 2 },
    { id: "key-takeaways", title: "Key Takeaways", level: 2 },
    { id: "conclusion", title: "Conclusion", level: 2 },
  ],
  relatedSlugs: [
    "agencies-lose-revenue-bad-client-management",
    "milestone-payments-client-trust",
    "proposal-vs-contract-vs-invoice",
  ],
};

export function getFeaturedPost(): BlogPost {
  return blogPosts.find((p) => p.featured) || blogPosts[0];
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === "All") return blogPosts.filter((p) => !p.featured);
  return blogPosts.filter((p) => !p.featured && p.category === category);
}

export function getPostBySlug(slug: string): BlogPostDetail | undefined {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return undefined;
  const detail = postDetails[slug] || defaultDetail;
  return { ...post, ...detail };
}

export function getRelatedPosts(slug: string, limit?: number): BlogPost[] {
  const detail = postDetails[slug] || defaultDetail;
  const slugs = limit ? detail.relatedSlugs.slice(0, limit) : detail.relatedSlugs;
  return slugs
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter(Boolean) as BlogPost[];
}

export const tocHeadings: TocHeading[] = [
  { id: "introduction", title: "Introduction", level: 2 },
  { id: "why-agencies-lose-revenue", title: "Why Agencies Lose Revenue", level: 2 },
  { id: "the-proposal-problem", title: "The Proposal Problem", level: 3 },
  { id: "the-contract-gap", title: "The Contract Gap", level: 3 },
  { id: "common-client-management-mistakes", title: "Common Client Management Mistakes", level: 2 },
  { id: "how-orka-solves-this", title: "How ORKA Solves This", level: 2 },
  { id: "the-orka-workflow", title: "The ORKA Workflow", level: 2 },
  { id: "real-impact", title: "Real Impact", level: 2 },
  { id: "best-practices", title: "Best Practices", level: 2 },
  { id: "conclusion", title: "Conclusion", level: 2 },
  { id: "faq", title: "FAQ", level: 2 },
];

export const posts = blogPosts;
