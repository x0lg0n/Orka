import type { Metadata } from "next";
import WaitlistCta from "@/components/WaitlistCta";

export const metadata: Metadata = {
  title: "About ORKA",
  description:
    "ORKA is the autonomous financial operating system for the global service economy — Web2 UX, AI-driven operations, and Stellar/Soroban infrastructure underneath.",
};

const principles: [string, string][] = [
  [
    "On-chain = money truth",
    "Only enforcement-critical state — who funded, how much, milestone released or disputed — lives in the Soroban contract. Everything else lives in Postgres.",
  ],
  [
    "One sync bridge",
    "A single applyChainEvent() reconciles Soroban state into Supabase, so the UI and the chain can never disagree.",
  ],
  [
    "Defense in depth",
    "Contract-enforced money rules, KMS-protected keys, multi-sig release, and session-gated signing protect custody at every layer.",
  ],
  [
    "Conservative autonomy",
    "AI may advise and verify, but funds only release after a human client approves — until dogfooding data proves the rules are safe.",
  ],
  [
    "Real-user gates",
    "No phase is done until it passes a defined gate with real Oreenza volume on testnet or mainnet.",
  ],
  [
    "Compliance is a feature",
    "Escrow is regulated. KYC and licensing checks are built before real money ever moves — not bolted on later.",
  ],
];

const custody: {
  mode: string;
  tag: string;
  color: string;
  text: string;
  rows: [string, string][];
}[] = [
  {
    mode: "Mode A — Orka-managed",
    tag: "Easy",
    color: "bg-violet",
    text: "text-white",
    rows: [
      ["Sign-in", "Email / Google (Supabase JWT)"],
      ["Chain key", "ORKA-provisioned Stellar key, encrypted in KMS"],
      ["Who signs", "Rust backend, after verifying JWT + session"],
      ["Gas", "ORKA operator-sponsored — zero for the user"],
      ["Recovery", "Reset password → re-grant KMS access"],
      ["Custody", "Custodial (ORKA is custodian)"],
    ],
  },
  {
    mode: "Mode B — Self-custody",
    tag: "Expert",
    color: "bg-teal",
    text: "text-night",
    rows: [
      ["Sign-in", "Freighter wallet connect"],
      ["Chain key", "The user's own Freighter key"],
      ["Who signs", "Freighter, in-browser"],
      ["Gas", "ORKA operator-sponsored — zero for the user"],
      ["Recovery", "The user's own seed phrase"],
      ["Custody", "Non-custodial"],
    ],
  },
];

const phases: {
  tag: string;
  title: string;
  goal: string;
  gate: string;
  color: string;
}[] = [
  {
    tag: "Phase 0",
    title: "Foundation Cleanup",
    goal: "A repo and dev environment a real engineer can clone and ship in.",
    gate: "A new contributor clones, runs one command, and sees the landing page + waitlist working locally.",
    color: "bg-white text-night",
  },
  {
    tag: "Phase 1",
    title: "Core Workspace + Escrow MVP",
    goal: "Create a project, fund USDC escrow on Stellar, approve a milestone, and pay the freelancer — without anyone touching crypto.",
    gate: "Oreenza runs 3 real projects end-to-end on testnet in both custody modes, with multi-sig enforced.",
    color: "bg-orange text-white",
  },
  {
    tag: "Phase 2",
    title: "Payments Realism",
    goal: "Real money can enter and leave the system, and users get the records they need for taxes.",
    gate: "At least $1k of real volume processed through a real ramp with correct invoices emitted.",
    color: "bg-coral text-white",
  },
  {
    tag: "Phase 3",
    title: "Compliance & Trust",
    goal: "The product is safe and legal to put real users' money through.",
    gate: "Clean audit of contract + custody service, KYC live, zero critical vulns, incident runbook documented.",
    color: "bg-lime text-night",
  },
  {
    tag: "Phase 4",
    title: "AI Operations",
    goal: "Cut the administrative tax in half. AI advises; humans approve.",
    gate: "Oreenza admin time per project drops measurably; verification accuracy validated on historical projects.",
    color: "bg-violet text-white",
  },
  {
    tag: "Phase 5",
    title: "Developer Platform & Scale",
    goal: "Become the “Stripe for Web3 marketplaces” — public API, SDKs, and an embeddable escrow widget.",
    gate: "$1M+ annualized volume, 100+ agencies, 5+ marketplace partners.",
    color: "bg-teal text-night",
  },
];

const standard: [string, string][] = [
  ["Sign up", "Email or Google. No wallet, no seed phrase."],
  ["Create & invite", "Spin up a project and invite the client by email."],
  ["Fund", "Client pays in USD via card/bank → USDC locked in Soroban, ORKA pays the gas."],
  ["Verify", "Freelancer delivers → AI verifies GitHub/Figma → client gets “verified, approve?”"],
  ["Release", "USDC released via client + operator multi-sig → off-ramped to the freelancer's bank → invoice emailed."],
  ["Resolve", "Any dispute is split by a human arbiter according to the contract."],
  ["Report", "Year-end tax report exported per jurisdiction."],
];

export default function AboutPage() {
  return (
    <div className="overflow-hidden">
      {/* ── Header / hero ── */}
      <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
        <div className="relative z-10 mx-auto max-w-5xl pt-16 pb-4 text-center">
          <span className="text-[15px] font-medium text-white sm:text-[18px]">
            ❤️ The Autonomous Financial OS
          </span>
          <h1 className="display mx-auto mt-6 max-w-4xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4.4rem] md:text-[6rem]">
            About <span className="text-orange">ORKA</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-normal leading-7 text-white/78 sm:text-lg sm:leading-8">
            Web2 user experience. AI-driven operations. Stellar and Soroban
            financial infrastructure underneath. ORKA eliminates the admin tax
            of running service work across borders.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 text-center lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:text-left">
          <div>
            <p className="section-label text-coral">Our Mission</p>
            <h2 className="display mt-2 text-4xl uppercase sm:text-5xl md:text-6xl lg:text-7xl">
              The financial OS for the global service economy.
            </h2>
          </div>
          <p className="mx-auto max-w-xl text-base font-normal leading-8 text-night/80 sm:text-[18px] lg:mx-0">
            Stellar runs silently. Normal users never touch a seed phrase or gas —
            ORKA pays for sponsored transactions. Crypto-native users may bring
            their own Freighter wallet for self-custody. Both modes drive the same
            audited Soroban contract, so the blockchain is invisible unless you
            want it.
          </p>
        </div>
      </section>

      {/* ── Custody model ── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl text-center md:text-left">
          <p className="section-label text-coral">Dual-Mode Custody</p>
          <h2 className="display mt-2 text-4xl uppercase sm:text-5xl md:text-6xl">
            One contract, two ways to sign.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {custody.map(({ mode, tag, color, text, rows }) => (
              <article
                key={mode}
                className={`cut-corner rounded-[14px] border-2 border-night p-6 text-left shadow-hard ${color} ${text}`}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="display text-3xl uppercase sm:text-4xl">{mode}</h3>
                  <span className="sticker rounded-full bg-night px-3 py-1 text-xs font-black uppercase text-white shadow-hard">
                    {tag}
                  </span>
                </div>
                <dl className="mt-5 divide-y divide-current/20">
                  {rows.map(([k, v]) => (
                    <div
                      key={k}
                      className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-6">
                      <dt className="text-xs font-black uppercase opacity-70">
                        {k}
                      </dt>
                      <dd className="text-sm font-bold sm:max-w-[62%] sm:text-right">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-3xl text-sm font-bold leading-6 text-night/60 md:mx-0">
            One address, one mode — set once at signup and never both. The
            backend refuses to sign for Freighter users; Freighter refuses to
            sign for managed users. Release requires client + operator multi-sig,
            so a single leaked key can never drain escrow.
          </p>
        </div>
      </section>

      {/* ── Guiding principles ── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl text-center md:text-left">
          <p className="section-label text-coral">Guiding Principles</p>
          <h2 className="display mt-2 text-4xl uppercase sm:text-5xl md:text-6xl">
            The rules that never bend.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map(([title, copy], i) => (
              <article
                key={title}
                className="cut-corner rounded-[14px] border-2 border-night bg-white p-6 text-center md:text-left">
                <span className="display text-4xl text-orange">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="display mt-3 text-2xl uppercase">{title}</h3>
                <p className="mt-3 text-sm font-bold leading-6 text-night/68">
                  {copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl text-center md:text-left">
          <p className="section-label text-coral">The Roadmap</p>
          <h2 className="display mt-2 text-4xl uppercase sm:text-5xl md:text-6xl">
            From MVP to invisible infrastructure.
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {phases.map(({ tag, title, goal, gate, color }) => (
              <article
                key={tag}
                className={`cut-corner relative flex min-h-[240px] flex-col rounded-[14px] border-2 border-night p-6 text-left shadow-hard ${color}`}>
                <span className="text-xs font-black uppercase opacity-70">
                  {tag}
                </span>
                <h3 className="display mt-1 text-3xl uppercase">{title}</h3>
                <p className="mt-3 text-sm font-bold leading-6">{goal}</p>
                <p className="mt-auto pt-4 text-xs font-bold uppercase opacity-70">
                  Gate — {gate}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Definition of the final product ── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[24px] bg-night p-6 text-white md:p-10">
          <div className="text-center md:text-left">
            <p className="section-label text-lime">The Standard</p>
            <h2 className="display mt-2 text-4xl uppercase sm:text-5xl md:text-6xl">
              What a finished product looks like.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-7 text-white/70 sm:text-[18px] md:mx-0">
              A real agency owner runs an entire project end-to-end — and the
              blockchain never gets in the way.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {standard.map(([title, copy], i) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-[12px] border-2 border-white/15 bg-white/5 p-4 text-left">
                <span className="display text-3xl text-orange">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="display text-xl uppercase">{title}</h3>
                  <p className="mt-1 text-sm font-bold leading-6 text-white/70">
                    {copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaitlistCta />
    </div>
  );
}
