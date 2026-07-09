import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import WaitlistCta from "../../components/WaitlistCta";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "Docs — ORKA",
  description:
    "A plain-language guide to how ORKA works: escrow, milestones, custody modes, verification, payouts, and disputes — no crypto knowledge required.",
};

const toc: [string, string][] = [
  ["what-is-orka", "What is ORKA?"],
  ["key-terms", "Key terms"],
  ["who-is-who", "Who's who"],
  ["getting-started", "Getting started"],
  ["how-it-works", "How a project works"],
  ["when-things-go-wrong", "When things go wrong"],
  ["your-money-is-safe", "Why your money is safe"],
  ["where-things-live", "Where everything lives"],
  ["faq", "FAQ"],
];

const terms: [string, string][] = [
  [
    "Escrow",
    "A secure holding account. The client's money is locked here before work starts, and can only be released when the agreed rules are met.",
  ],
  [
    "Milestone",
    "A chunk of a project with its own price — e.g. \u201cDesign $2,000\u201d. Each milestone is funded, delivered, and paid out independently.",
  ],
  [
    "Managed mode (Mode A)",
    "The easy default. You sign in with email or Google. ORKA safely holds the keys for you — no wallet, no seed phrase, nothing to lose.",
  ],
  [
    "Self-custody (Mode B)",
    "For crypto-native users. You connect your own Freighter wallet and sign in your browser. Same product, you hold your own keys.",
  ],
  [
    "Sponsored transaction",
    "ORKA pays the network fees for you. You never buy or hold \u201cgas\u201d — payments feel like any normal web app.",
  ],
  [
    "Multi-sig release",
    "Money only leaves escrow when both the client and ORKA approve. No single person — not even ORKA alone — can move your funds.",
  ],
  [
    "Verification",
    "Before a client approves, ORKA's AI can check the delivery (GitHub, Figma, content) and give a confidence score with source links.",
  ],
  [
    "Arbiter",
    "A neutral human who steps in if there's a dispute, reviews the evidence, and decides a fair split of the escrowed funds.",
  ],
];

const roles: [string, string][] = [
  ["The Agency", "Owns the ORKA workspace and runs client projects (in our examples, \u201cOreenza\u201d)."],
  ["The Client", "The company paying for the work. They fund escrow and approve milestones."],
  ["The Freelancer", "The person delivering the work and getting paid per milestone."],
  ["ORKA", "The invisible operator — signs transactions, pays the gas, and co-signs every release."],
];

const startSteps: [string, string][] = [
  ["Sign up", "Create an account with email or Google. No wallet or seed phrase needed."],
  ["Create a project", "Add the client and freelancer, set the scope, and break it into priced milestones."],
  ["Invite the client", "Your client joins by email — no crypto onboarding, ever."],
];

const flow: [string, string][] = [
  [
    "The project is created",
    "The agency sets up the project and its milestones (e.g. Discovery $2k, Design $2k, Dev $3k, Launch $1k). Nothing is charged yet.",
  ],
  [
    "Everyone agrees",
    "The client and agency accept the scope and contract with a click. It's a binding, recorded agreement.",
  ],
  [
    "The client funds escrow",
    "The client pays in normal currency by card or bank. ORKA converts it and locks the full amount safely in escrow — the client pays $0 in network fees.",
  ],
  [
    "The freelancer delivers",
    "Work happens in the freelancer's own tools. When a milestone is done, they submit it and attach evidence (GitHub, Figma links).",
  ],
  [
    "The work is verified",
    "ORKA's AI reviews the delivery and shows the client a \u201cverified — approve?\u201d summary with source links. The client always makes the final call.",
  ],
  [
    "The client approves & the freelancer is paid",
    "One click releases that milestone's funds to the freelancer, an invoice is emailed automatically, and the payout can be sent to their bank.",
  ],
  [
    "Repeat, then wrap up",
    "Every milestone repeats the same loop independently. At year-end, ORKA compiles a tax report from the full record.",
  ],
];

const trouble: [string, string][] = [
  [
    "The client goes silent",
    "If the client never approves, the funds simply stay locked — the freelancer isn't paid and the client can't pull the money back. ORKA sends reminders, and after a set time it escalates to mediation.",
  ],
  [
    "The client rejects the work",
    "The client can reject a milestone with a reason. The funds stay in escrow. The freelancer can revise and resubmit, or either party can open a dispute.",
  ],
  [
    "A formal dispute",
    "Both release and refund pause. A neutral human arbiter reviews the agreement, the deliverables, the rejection reason, and the AI evidence — then decides a fair split (e.g. 70% to the freelancer, 30% refunded).",
  ],
];

const guarantees: string[] = [
  "The client cannot secretly pull escrowed funds back once a milestone is in dispute.",
  "The client cannot force the money to themselves — releases need client + ORKA multi-sig.",
  "The freelancer cannot pay themselves — the same multi-sig rule applies.",
  "Funds move only by the agreed rules or an arbiter's decision — never by one party alone.",
];

const artifacts: [string, string, string][] = [
  ["Legal agreement (scope & terms)", "ORKA database", "Both parties click Accept"],
  ["Escrow rules (the money program)", "Stellar/Soroban contract", "Deployed & enforced by ORKA"],
  ["Fund / approve / release", "Stellar transactions", "Signed by the right party each time"],
  ["Audit trail", "ORKA database", "Mirrored from the blockchain automatically"],
  ["Invoice", "Emailed + stored", "Auto-generated when a milestone releases"],
];

const faqs: [string, string][] = [
  ["Do I need a crypto wallet?", "No. Managed mode uses email or Google login. Stellar runs silently underneath. Crypto-native users can optionally connect Freighter."],
  ["Who pays the network fees?", "ORKA does. Every transaction is sponsored, so it costs you nothing extra."],
  ["Can ORKA run off with my money?", "No. Releasing escrow requires both the client and ORKA to approve. A single leaked key can never drain your funds."],
  ["What if I lose access to my account?", "In managed mode, reset your password to regain access. In self-custody mode, your seed phrase is yours to protect."],
  ["What currencies can I use?", "Clients can pay in normal currency by card or bank; ORKA handles the conversion to USDC and payout back to fiat."],
];

export default function DocsPage() {
  return (
    <main className="overflow-hidden bg-paper">
      {/* ── Header ── */}
      <section className="relative overflow-hidden rounded-b-[42px] bg-ink px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
        <Navbar />
        <div className="relative z-10 mx-auto max-w-5xl pt-16 pb-4 text-center">
          <span className="text-[15px] font-medium text-white sm:text-[18px]">
            📘 Documentation
          </span>
          <h1 className="display mx-auto mt-6 max-w-4xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4.4rem] md:text-[6rem]">
            How <span className="text-orange">ORKA</span> works
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base font-normal leading-7 text-white/78 sm:text-lg sm:leading-8">
            A plain-language guide to escrow, milestones, payouts, and disputes.
            No crypto knowledge required — if you can use a normal web app, you
            can use ORKA.
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[230px_1fr] lg:gap-14">
          {/* Table of contents */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="section-label text-coral">On this page</p>
            <nav className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
              {toc.map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="rounded-full border-2 border-ink/10 px-4 py-1.5 text-sm font-bold text-ink/70 transition hover:border-ink hover:bg-ink hover:text-white lg:border-transparent lg:px-2 lg:py-1">
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="max-w-3xl">
            {/* What is ORKA */}
            <div id="what-is-orka" className="scroll-mt-24">
              <h2 className="display text-4xl uppercase sm:text-5xl">
                What is ORKA?
              </h2>
              <p className="mt-4 text-base leading-8 text-ink/80 sm:text-[18px]">
                ORKA is the financial operating system for service work. It
                handles the annoying parts of running a project across borders —
                proposals, escrow, verifying delivery, payouts, invoices, and
                records — so agencies and freelancers can focus on the actual
                work.
              </p>
              <p className="mt-4 text-base leading-8 text-ink/80 sm:text-[18px]">
                Under the hood it uses the Stellar blockchain to guarantee that
                money moves only by the agreed rules. But you never see any of
                that: you log in with email, pay with a card, and click to
                approve. The blockchain is invisible.
              </p>
            </div>

            {/* Key terms */}
            <div id="key-terms" className="mt-14 scroll-mt-24">
              <h2 className="display text-4xl uppercase sm:text-5xl">Key terms</h2>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                {terms.map(([term, def]) => (
                  <div
                    key={term}
                    className="cut-corner rounded-[14px] border-2 border-ink bg-white p-5">
                    <dt className="display text-xl uppercase">{term}</dt>
                    <dd className="mt-2 text-sm font-bold leading-6 text-ink/68">
                      {def}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Who's who */}
            <div id="who-is-who" className="mt-14 scroll-mt-24">
              <h2 className="display text-4xl uppercase sm:text-5xl">
                Who&apos;s who
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {roles.map(([role, copy]) => (
                  <div
                    key={role}
                    className="rounded-[14px] border-2 border-ink/12 bg-white p-5">
                    <h3 className="display text-2xl uppercase">{role}</h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-ink/68">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Getting started */}
            <div id="getting-started" className="mt-14 scroll-mt-24">
              <h2 className="display text-4xl uppercase sm:text-5xl">
                Getting started
              </h2>
              <div className="mt-6 flex flex-col gap-3">
                {startSteps.map(([title, copy], i) => (
                  <div
                    key={title}
                    className="flex items-start gap-4 rounded-[14px] border-2 border-ink bg-lime p-5 text-ink">
                    <span className="display text-3xl">{i + 1}.</span>
                    <div>
                      <h3 className="display text-xl uppercase">{title}</h3>
                      <p className="mt-1 text-sm font-bold leading-6">{copy}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div id="how-it-works" className="mt-14 scroll-mt-24">
              <h2 className="display text-4xl uppercase sm:text-5xl">
                How a project works
              </h2>
              <p className="mt-4 text-base leading-8 text-ink/80 sm:text-[18px]">
                Here&apos;s the full journey, from kickoff to payout — the
                &quot;happy path&quot; where everything goes smoothly.
              </p>
              <ol className="mt-6 flex flex-col">
                {flow.map(([title, copy], i) => (
                  <li
                    key={title}
                    className="flex items-start gap-4 border-b-2 border-ink/10 py-5">
                    <span className="display shrink-0 text-4xl text-orange sm:text-5xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="display text-2xl uppercase">{title}</h3>
                      <p className="mt-1 text-sm font-bold leading-6 text-ink/70 sm:text-base">
                        {copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* When things go wrong */}
            <div id="when-things-go-wrong" className="mt-14 scroll-mt-24">
              <h2 className="display text-4xl uppercase sm:text-5xl">
                When things go wrong
              </h2>
              <p className="mt-4 text-base leading-8 text-ink/80 sm:text-[18px]">
                Not every project is smooth. ORKA is built so that no one can be
                cheated, whatever happens.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {trouble.map(([title, copy]) => (
                  <div
                    key={title}
                    className="cut-corner rounded-[14px] border-2 border-ink bg-white p-5">
                    <h3 className="display text-xl uppercase">{title}</h3>
                    <p className="mt-2 text-sm font-bold leading-6 text-ink/68">
                      {copy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Your money is safe */}
            <div id="your-money-is-safe" className="mt-14 scroll-mt-24">
              <div className="rounded-[20px] bg-ink p-6 text-white md:p-8">
                <h2 className="display text-4xl uppercase text-lime sm:text-5xl">
                  Why your money is safe
                </h2>
                <ul className="mt-6 flex flex-col gap-3">
                  {guarantees.map((g) => (
                    <li key={g} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-lime text-xs font-black text-ink">
                        ✓
                      </span>
                      <p className="text-sm font-bold leading-6 text-white/85 sm:text-base">
                        {g}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Where things live */}
            <div id="where-things-live" className="mt-14 scroll-mt-24">
              <h2 className="display text-4xl uppercase sm:text-5xl">
                Where everything lives
              </h2>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="border-b-2 border-ink">
                      <th className="display py-3 pr-4 text-sm uppercase">
                        What
                      </th>
                      <th className="display py-3 pr-4 text-sm uppercase">
                        Where
                      </th>
                      <th className="display py-3 text-sm uppercase">
                        How it&apos;s confirmed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {artifacts.map(([what, where, how]) => (
                      <tr key={what} className="border-b border-ink/10">
                        <td className="py-3 pr-4 text-sm font-bold">{what}</td>
                        <td className="py-3 pr-4 text-sm font-bold text-ink/70">
                          {where}
                        </td>
                        <td className="py-3 text-sm font-bold text-ink/70">
                          {how}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FAQ */}
            <div id="faq" className="mt-14 scroll-mt-24">
              <h2 className="display text-4xl uppercase sm:text-5xl">FAQ</h2>
              <div className="mt-4 flex flex-col">
                {faqs.map(([q, a]) => (
                  <details key={q} className="group border-b-2 border-ink/10 py-5">
                    <summary className="flex cursor-pointer items-start gap-3">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-ink text-white transition-all duration-300 group-open:rotate-45 group-open:bg-violet">
                        +
                      </span>
                      <span className="display text-xl uppercase leading-7 text-ink transition-colors group-open:text-violet sm:text-2xl">
                        {q}
                      </span>
                    </summary>
                    <p className="ml-10 mt-3 text-sm font-bold leading-7 text-ink/70 sm:text-base">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <WaitlistCta />
      <Footer />
    </main>
  );
}
