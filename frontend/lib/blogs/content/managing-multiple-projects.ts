import type { BlogArticle } from "../types";

export const article: BlogArticle = {
  slug: "managing-multiple-projects",
  title: "Managing Multiple Projects Without Losing Your Mind",
  excerpt:
    "Workflows, tools and systems that keep your projects on track.",
  description:
    "Proven workflows and systems for agencies managing multiple client projects simultaneously without burnout or missed deadlines.",
  category: "Productivity",
  author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
  readingTime: "8 min read",
  publishedAt: "May 5, 2026",
  coverGradient: "from-info/12 via-info/6 to-violet/5",
  featured: false,
  sections: [
    {
      id: "introduction",
      heading: "Introduction",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "Running multiple projects simultaneously is the reality for most agencies. But without the right systems, it quickly becomes overwhelming — missed deadlines, scope creep, and burned-out teams.",
        },
        {
          type: "paragraph",
          text: "Here's how to manage multiple projects without sacrificing quality or your sanity.",
        },
      ],
    },
    {
      id: "the-visibility-problem",
      heading: "The Visibility Problem",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "The biggest challenge with multiple projects isn't the work itself — it's knowing where everything stands at any given moment. When project data is scattered across tools, you're always guessing.",
        },
        {
          type: "callout",
          variant: "insight",
          text: "Agency owners spend an average of 5 hours per week just checking the status of different projects across different tools.",
        },
      ],
    },
    {
      id: "system-1",
      heading: "System 1: Centralized Project View",
      level: 3,
      blocks: [
        {
          type: "paragraph",
          text: "Everything should live in one place. Every project, every milestone, every payment — visible at a glance.",
        },
        {
          type: "list",
          items: [
            "Single dashboard showing all active projects",
            "Milestone progress for each project",
            "Upcoming deadlines and deliverables",
            "Payment status and outstanding invoices",
          ],
        },
      ],
    },
    {
      id: "system-2",
      heading: "System 2: Milestone-Based Workflow",
      level: 3,
      blocks: [
        {
          type: "paragraph",
          text: "Break every project into milestones. This gives you natural checkpoints to assess progress, get client feedback, and adjust scope if needed.",
        },
        {
          type: "paragraph",
          text: "With ORKA, each milestone is a funded unit of work. The client pays upfront, you deliver, they approve, and payment is released. Simple.",
        },
      ],
    },
    {
      id: "system-3",
      heading: "System 3: Weekly Review Ritual",
      level: 3,
      blocks: [
        {
          type: "paragraph",
          text: "Every week, spend 30 minutes reviewing:",
        },
        {
          type: "ordered-list",
          items: [
            "What's due this week across all projects",
            "What's at risk of slipping",
            "What needs client input to move forward",
            "What can be delegated or automated",
          ],
        },
        {
          type: "callout",
          variant: "tip",
          text: "Block this time on your calendar every Friday afternoon. Treat it like a client meeting — non-negotiable.",
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
          text: "Managing multiple projects doesn't have to mean managing chaos. With the right systems — centralized visibility, milestone-based workflows, and weekly reviews — you can scale without burning out.",
        },
        {
          type: "paragraph",
          text: "ORKA gives you all three systems in one platform. Every project, every milestone, every payment — one view, zero chaos.",
        },
      ],
    },
  ],
};
