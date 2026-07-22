export type Engine = {
  title: string;
  copy: string;
  color: string;
};

export type FlowActor = "Client" | "Freelancer" | "ORKA AI" | "Stellar";

export type MethodStep = {
  number: string;
  title: string;
  summary: string;
  phases?: string[][];
  flow: { actor: FlowActor; text: string }[];
  traditional: string;
  orka: string;
};

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
    color: "bg-violet",
  },
  {
    title: "Financial Ledger",
    copy: "Every transaction tracked, categorized, and ready for reporting — no spreadsheets needed.",
    color: "bg-teal",
  },
  {
    title: "Analytics & Reporting",
    copy: "Real-time dashboards for project health, cash flow, and team performance across borders.",
    color: "bg-night",
  },
];

export const steps: MethodStep[] = [
  {
    number: "01",
    title: "Proposal is generated",
    summary:
      "The service brief becomes a clear scope, timeline, agreement, and milestone schedule — ready for the client to approve.",
    phases: [
      ["Scope", "Timeline", "Agreement"],
      ["Milestones", "Pricing", "Deliverables"],
      ["Review", "Approve", "Sign"],
    ],
    flow: [
      {
        actor: "Freelancer",
        text: "Paste the client's rough brief or email into ORKA — no template required.",
      },
      {
        actor: "ORKA AI",
        text: "Drafts a scoped proposal, pricing, and fundable milestones in seconds.",
      },
      {
        actor: "Client",
        text: "Reviews, edits if needed, and approves from one link — no document ping-pong.",
      },
      {
        actor: "ORKA AI",
        text: "Generates a signed agreement and locks the milestone schedule.",
      },
    ],
    traditional:
      "You write the proposal in docs, chase approvals over email, price by gut, and hope the scope is clear. Weeks of back-and-forth before any work starts.",
    orka: "One brief in, a polished proposal and contract out in minutes. The client approves from a link, and scope, price, and milestones are agreed and locked.",
  },
  {
    number: "02",
    title: "Escrow is funded",
    summary:
      "Clients pay in a familiar checkout while ORKA handles the Stellar escrow infrastructure underneath.",
    flow: [
      {
        actor: "Client",
        text: "Pays by card or bank transfer in a normal checkout — no wallet, no crypto.",
      },
      {
        actor: "ORKA AI",
        text: "Locks the funds in a Soroban smart-contract escrow on Stellar.",
      },
      {
        actor: "Freelancer",
        text: "Sees a 'Funded' status and can start work with full confidence.",
      },
      {
        actor: "Stellar",
        text: "Holds the funds securely — nothing moves until the milestone rules are met.",
      },
    ],
    traditional:
      "You request a deposit over an invoice, trust the client to pay, or start work unpaid and hope. Chargebacks and non-payment are constant risks.",
    orka: "Money is locked the moment the client checks out. You start work knowing funds are secured on-chain and released only by rules — not by trust.",
  },
  {
    number: "03",
    title: "Work is verified",
    summary:
      "AI reviews the delivery evidence against each milestone and gives the client a clean, itemized review trail.",
    flow: [
      {
        actor: "Freelancer",
        text: "Connect GitHub or Figma, or drop links and files as milestones complete.",
      },
      {
        actor: "ORKA AI",
        text: "Checks the evidence against the agreed milestones automatically.",
      },
      {
        actor: "Client",
        text: "Gets a clear, itemized verification report and approves in one tap.",
      },
      {
        actor: "ORKA AI",
        text: "Records an immutable trail of what was delivered and approved.",
      },
    ],
    traditional:
      "You email 'done', the client goes silent, and you wait to get paid. Proof of work is scattered across a dozen tools.",
    orka: "Every delivery is checked against its milestone and shown to the client as clean evidence. Approval is one tap and the trail is automatic.",
  },
  {
    number: "04",
    title: "Payouts execute",
    summary:
      "Funds release, currency routes, invoices send, and the ledger updates — without a spreadsheet in sight.",
    flow: [
      {
        actor: "Stellar",
        text: "Releases escrow funds the instant the milestone is approved.",
      },
      {
        actor: "ORKA AI",
        text: "Routes the right currency to the freelancer — low-cost and cross-border.",
      },
      {
        actor: "ORKA AI",
        text: "Sends the invoice and writes the transaction to the ledger.",
      },
      {
        actor: "Freelancer",
        text: "Gets paid and receives a clean record — no manual bookkeeping.",
      },
    ],
    traditional:
      "You send an invoice, wait 30–60 days, reconcile payments across currencies in a spreadsheet, and do your own accounting.",
    orka: "Funds land the moment work is approved. Invoices and ledger entries are written for you, in every currency, automatically.",
  },
];

export const faqs: Faq[] = [
  ["Is ORKA a marketplace?", "No. ORKA starts after the sale, helping agencies and freelancers operate projects, escrow, verification, payouts, and finance."],
  ["Do users need crypto wallets?", "No. ORKA is designed as a Web2 product experience, using Stellar and Soroban under the hood."],
  ["Who is it for first?", "Mid-sized digital agencies, global freelancers, remote startups, and niche service marketplaces."],
  ["Is the product live?", "This landing page is for the early waitlist and design partners while the hackathon/pre-seed foundation is built."],
];

export const productLinks = [
  { label: "Engines", href: "/#engines" },
  { label: "Method", href: "/#method" },
  { label: "FAQ", href: "/#faq" },
];

export const resourcesLinks = [
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
];

export const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];
