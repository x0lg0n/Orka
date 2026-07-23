import type { BlogArticle } from "../types";

export const article: BlogArticle = {
  slug: "agency-onboarding-checklist",
  title: "The Ultimate Agency Onboarding Checklist",
  excerpt:
    "A step-by-step system to onboard clients smoothly and reduce churn.",
  description:
    "A complete agency client onboarding checklist to reduce churn, set expectations, and start every project on the right foot.",
  category: "Agency",
  author: { name: "Janvi Singhal", initials: "JS", role: "Founder, ORKA" },
  readingTime: "6 min read",
  publishedAt: "May 6, 2026",
  coverGradient: "from-lime/12 via-lime/6 to-teal/5",
  featured: false,
  sections: [
    {
      id: "introduction",
      heading: "Introduction",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "The first 7 days of a client relationship determine whether that client stays for months or churns within weeks. Yet most agencies have no structured onboarding process.",
        },
        {
          type: "callout",
          variant: "insight",
          text: "Agencies with a structured onboarding process see 50% higher client retention rates compared to those that wing it.",
        },
      ],
    },
    {
      id: "pre-kickoff",
      heading: "Pre-Kickoff Preparation",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "Before the first call with a new client, complete these steps:",
        },
        {
          type: "ordered-list",
          items: [
            "Send a welcome email with next steps and timeline",
            "Create the project workspace in your project management tool",
            "Prepare the contract and send for e-signature",
            "Set up the payment structure (milestones + escrow)",
            "Research the client's business and competitors",
            "Prepare a kickoff agenda and share it in advance",
          ],
        },
      ],
    },
    {
      id: "kickoff-meeting",
      heading: "The Kickoff Meeting",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "The kickoff meeting sets the tone for the entire relationship. Cover these essentials:",
        },
        {
          type: "list",
          items: [
            "Confirm project goals and success metrics",
            "Align on communication preferences and cadence",
            "Review milestones and payment schedule",
            "Introduce the team and establish points of contact",
            "Set expectations for feedback rounds and turnaround times",
          ],
        },
        {
          type: "callout",
          variant: "best-practice",
          text: "Record the kickoff meeting and share a summary with the client. This creates a reference point both parties can return to if questions arise later.",
        },
      ],
    },
    {
      id: "first-week",
      heading: "First Week Deliverables",
      level: 2,
      blocks: [
        {
          type: "paragraph",
          text: "In the first week, deliver something tangible. Even a small win builds confidence and momentum:",
        },
        {
          type: "list",
          items: [
            "Share a project timeline with specific dates",
            "Deliver the first milestone (even if it's a draft or outline)",
            "Send a weekly status update",
            "Resolve any blockers or questions from the kickoff",
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
          text: "Onboarding isn't just about getting started — it's about building the trust and clarity that sustains the entire relationship.",
        },
        {
          type: "paragraph",
          text: "ORKA automates much of this checklist: contracts are generated from proposals, milestones are funded automatically, and both parties have a clear view of progress from day one.",
        },
      ],
    },
  ],
};
