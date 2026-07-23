import type { BlogPost } from "@/app/(marketing)/blog/components/types";

export const categories = [
  "All",
  "Product Updates",
  "Blockchain",
  "Tutorials",
  "Company",
  "Industry Insights",
] as const;

export type Category = (typeof categories)[number];

export const blogPosts: BlogPost[] = [
  {
    id: "blog-001",
    slug: "introducing-orka-v2",
    title: "Introducing ORKA v2: Project Management Reimagined",
    excerpt:
      "We're thrilled to announce ORKA v2 with a completely redesigned interface, faster performance, and powerful new features for Stellar-based project management.",
    content: "",
    author: { name: "Sarah Chen", initials: "SC", role: "CEO & Co-founder" },
    category: "Product Updates",
    tags: ["launch", "product", "stellar"],
    publishedAt: "2026-07-15",
    readTime: 5,
    featured: true,
  },
  {
    id: "blog-002",
    slug: "smart-contracts-for-projects",
    title: "How Smart Contracts Are Transforming Project Management",
    excerpt:
      "Discover how Soroban smart contracts bring trustless automation to project escrow, milestone payments, and team collaboration on Stellar.",
    content: "",
    author: { name: "Marcus Rivera", initials: "MR", role: "Head of Product" },
    category: "Blockchain",
    tags: ["smart-contracts", "soroban", "escrow"],
    publishedAt: "2026-07-10",
    readTime: 8,
    featured: false,
  },
  {
    id: "blog-003",
    slug: "setting-up-workspace",
    title: "Getting Started: Setting Up Your First Workspace",
    excerpt:
      "A step-by-step guide to creating your ORKA workspace, inviting team members, and configuring your first project with blockchain-powered tools.",
    content: "",
    author: { name: "Aisha Patel", initials: "AP", role: "Developer Advocate" },
    category: "Tutorials",
    tags: ["getting-started", "workspace", "tutorial"],
    publishedAt: "2026-07-05",
    readTime: 6,
    featured: false,
  },
  {
    id: "blog-004",
    slug: "why-decentralized-matters",
    title: "Why Decentralized Project Management Matters",
    excerpt:
      "Traditional project management tools keep your data locked in centralized silos. Here's why ORKA's decentralized approach changes everything.",
    content: "",
    author: { name: "Sarah Chen", initials: "SC", role: "CEO & Co-founder" },
    category: "Industry Insights",
    tags: ["decentralization", "web3", "philosophy"],
    publishedAt: "2026-06-28",
    readTime: 7,
    featured: false,
  },
  {
    id: "blog-005",
    slug: "q2-2026-recap",
    title: "ORKA Q2 2026 Recap: Milestones and What's Next",
    excerpt:
      "A look back at our Q2 achievements — from mainnet launch to 500 workspaces created — and a preview of what's coming in Q3.",
    content: "",
    author: { name: "Marcus Rivera", initials: "MR", role: "Head of Product" },
    category: "Company",
    tags: ["recap", "company", "milestones"],
    publishedAt: "2026-06-20",
    readTime: 4,
    featured: false,
  },
  {
    id: "blog-006",
    slug: "escrow-deep-dive",
    title: "Deep Dive: ORKA Escrow System Architecture",
    excerpt:
      "A technical walkthrough of how ORKA's escrow system uses Soroban contracts to ensure trustless, transparent fund management for project teams.",
    content: "",
    author: { name: "Dev Team", initials: "DT", role: "Engineering" },
    category: "Blockchain",
    tags: ["escrow", "architecture", "soroban"],
    publishedAt: "2026-06-15",
    readTime: 12,
    featured: false,
  },
  {
    id: "blog-007",
    slug: "mastering-proposals",
    title: "Mastering Proposals: Win More Clients with ORKA",
    excerpt:
      "Learn how to create compelling proposals using ORKA's proposal builder, track client interactions, and convert leads into paid projects.",
    content: "",
    author: { name: "Aisha Patel", initials: "AP", role: "Developer Advocate" },
    category: "Tutorials",
    tags: ["proposals", "clients", "tutorial"],
    publishedAt: "2026-06-10",
    readTime: 6,
    featured: false,
  },
  {
    id: "blog-008",
    slug: "freighter-integration",
    title: "Seamless Wallet Integration with Freighter",
    excerpt:
      "How ORKA connects with Freighter wallet for one-click authentication and secure blockchain transactions without leaving your project dashboard.",
    content: "",
    author: { name: "Dev Team", initials: "DT", role: "Engineering" },
    category: "Product Updates",
    tags: ["freighter", "wallet", "integration"],
    publishedAt: "2026-06-05",
    readTime: 5,
    featured: false,
  },
  {
    id: "blog-009",
    slug: "future-of-work-web3",
    title: "The Future of Work Meets Web3: ORKA's Vision",
    excerpt:
      "How blockchain technology is reshaping team collaboration, payments, and project governance — and ORKA's role in this transformation.",
    content: "",
    author: { name: "Sarah Chen", initials: "SC", role: "CEO & Co-founder" },
    category: "Industry Insights",
    tags: ["vision", "web3", "future-of-work"],
    publishedAt: "2026-05-28",
    readTime: 9,
    featured: false,
  },
];

export const featuredPost = blogPosts.find((p) => p.featured) ?? blogPosts[0];
