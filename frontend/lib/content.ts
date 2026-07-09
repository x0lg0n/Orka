export type Engine = {
  title: string;
  copy: string;
  color: string;
};

export type Step = [string, string, string, string[][]?];

export type Faq = [string, string];

export const engines: Engine[] = [
  {
    title: "Agreement Engine",
    copy: "AI turns rough client briefs into scoped proposals, contracts, pricing, and fundable milestones.",
    color: "bg-orange",
  },
  {
    title: "Escrow & Settlement",
    copy: "Soroban smart contracts lock client funds and release them only when milestone conditions are met.",
    color: "bg-violet",
  },
  {
    title: "Verification Engine",
    copy: "AI checks GitHub, Figma, content, links, and delivery evidence before triggering payment release.",
    color: "bg-coral",
  },
  {
    title: "Email & Payouts",
    copy: "Automated invoices, multi-currency records, tax categories, and back-office reporting workflows.",
    color: "bg-coral",
  },
  {
    title: "Financial Ledger",
    copy: "Every transaction tracked, categorized, and ready for reporting — no spreadsheets needed.",
    color: "bg-teal",
  },
  {
    title: "Analytics & Reporting",
    copy: "Real-time dashboards for project health, cash flow, and team performance across borders.",
    color: "bg-ink",
  },
];

export const steps: Step[] = [
  ["01", "Proposal is generated", "The service brief becomes a clear scope, timeline, agreement, and milestone schedule.", [["Scope", "Timeline", "Agreement"], ["Milestones", "Pricing", "Deliverables"], ["Review", "Approve", "Sign"]]],
  ["02", "Escrow is funded", "Clients pay in a familiar flow while ORKA handles Stellar infrastructure underneath."],
  ["03", "Work is verified", "AI reviews delivery evidence and gives the client a clean review trail."],
  ["04", "Payouts execute", "Funds release, currency routes, invoices send, and the ledger updates automatically."],
];

export const faqs: Faq[] = [
  ["Is ORKA a marketplace?", "No. ORKA starts after the sale, helping agencies and freelancers operate projects, escrow, verification, payouts, and finance."],
  ["Do users need crypto wallets?", "No. ORKA is designed as a Web2 product experience, using Stellar and Soroban under the hood."],
  ["Who is it for first?", "Mid-sized digital agencies, global freelancers, remote startups, and niche service marketplaces."],
  ["Is the product live?", "This landing page is for the early waitlist and design partners while the hackathon/pre-seed foundation is built."],
];

export const productLinks = [
  { label: "Engines", href: "#engines" },
  { label: "Method", href: "#method" },
  { label: "FAQ", href: "#faq" },
];
