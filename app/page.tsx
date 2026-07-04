"use client";

import { FormEvent, useState } from "react";

const engines = [
  {
    title: "Agreement Engine",
    copy: "AI turns rough client briefs into scoped proposals, contracts, pricing, and fundable milestones.",
    color: "bg-orange"
  },
  {
    title: "Escrow & Settlement",
    copy: "Soroban smart contracts lock client funds and release them only when milestone conditions are met.",
    color: "bg-violet"
  },
  {
    title: "Verification Engine",
    copy: "AI checks GitHub, Figma, content, links, and delivery evidence before triggering payment release.",
    color: "bg-coral"
  },
  {
    title: "Financial Ledger",
    copy: "Invoices, multi-currency records, tax categories, and back-office reporting are created automatically.",
    color: "bg-teal"
  }
];

const steps = [
  ["01", "Proposal is generated", "The service brief becomes a clear scope, timeline, agreement, and milestone schedule."],
  ["02", "Escrow is funded", "Clients pay in a familiar flow while ORKA handles Stellar infrastructure underneath."],
  ["03", "Work is verified", "AI reviews delivery evidence and gives the client a clean review trail."],
  ["04", "Payouts execute", "Funds release, currency routes, invoices send, and the ledger updates automatically."]
];

const faqs = [
  ["Is ORKA a marketplace?", "No. ORKA starts after the sale, helping agencies and freelancers operate projects, escrow, verification, payouts, and finance."],
  ["Do users need crypto wallets?", "No. ORKA is designed as a Web2 product experience, using Stellar and Soroban under the hood."],
  ["Who is it for first?", "Mid-sized digital agencies, global freelancers, remote startups, and niche service marketplaces."],
  ["Is the product live?", "This landing page is for the early waitlist and design partners while the hackathon/pre-seed foundation is built."]
];

function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email to join the waitlist.");
      return;
    }

    setError("");
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      formElement.reset();
    }, 650);
  }

  if (submitted) {
    return (
      <div className="rounded-[8px] border-2 border-ink bg-lime p-4 text-ink shadow-hard">
        <p className="text-sm font-black uppercase">You are on the ORKA waitlist.</p>
        <p className="mt-1 text-sm font-semibold">
          We will reach out when design partner slots open.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "space-y-3" : "grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]"}>
      <input
        name="name"
        placeholder="Name"
        className="min-h-12 w-full rounded-[8px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-lime"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="min-h-12 w-full rounded-[8px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-lime"
        required
      />
      <input
        name="role"
        placeholder="Role / company"
        className="min-h-12 w-full rounded-[8px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none focus:ring-4 focus:ring-lime"
      />
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 w-full rounded-[999px] border-2 border-ink bg-lime px-6 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Joining..." : "Join waitlist"}
      </button>
      {error ? <p className="text-sm font-bold text-coral md:col-span-4">{error}</p> : null}
    </form>
  );
}

export default function Home() {
  return (
    <main className="overflow-hidden bg-paper">
      <section className="noise relative rounded-b-[42px] bg-ink px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="#" className="flex items-center gap-2" aria-label="ORKA home">
            <span className="grid size-8 place-items-center rounded-[8px] bg-violet text-xl font-black text-lime">O</span>
            <span className="display text-2xl">ORKA</span>
          </a>
          <div className="hidden items-center gap-7 text-xs font-black uppercase md:flex">
            <a href="#engines" className="hover:text-lime">Engines</a>
            <a href="#method" className="hover:text-lime">Method</a>
            <a href="#faq" className="hover:text-lime">FAQ</a>
          </div>
          <a href="#waitlist" className="rounded-full bg-white px-5 py-3 text-xs font-black uppercase text-ink transition hover:bg-lime">
            Get early access
          </a>
        </nav>

        <div className="mx-auto grid max-w-7xl gap-10 pb-8 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="section-label">AI operations + programmable finance</p>
            <h1 className="display mt-4 max-w-4xl text-[4.2rem] uppercase text-white sm:text-[6.4rem] lg:text-[7.3rem]">
              Autonomous financial OS for global service work.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/78">
              ORKA eliminates the admin tax of proposals, escrow, milestone verification, payouts,
              invoices, and financial records for agencies and freelancers working across borders.
            </p>
            <div className="mt-8 max-w-4xl rounded-[14px] bg-white p-3 text-ink">
              <WaitlistForm />
            </div>
          </div>

          <div className="relative">
            <div className="speech rounded-[28px] bg-violet p-5 text-violet shadow-glow">
              <div className="rounded-[20px] bg-paper p-5 text-ink">
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-full bg-lime px-3 py-1 text-xs font-black uppercase">Live flow</span>
                  <span className="rounded-full bg-ink px-3 py-1 text-xs font-black uppercase text-white">Soroban escrow</span>
                </div>
                <div className="grid gap-3">
                  {["Scope approved", "USDC escrow funded", "AI verified milestone", "Payout + invoice sent"].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 rounded-[12px] border-2 border-ink bg-white p-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-orange text-sm font-black">
                        {index + 1}
                      </span>
                      <span className="text-sm font-black uppercase">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="sticker absolute -left-2 -top-7 rounded-full bg-coral px-5 py-3 text-sm font-black uppercase text-white shadow-hard md:-left-8">
              No wallet drama
            </div>
            <div className="absolute -bottom-8 right-4 rounded-[12px] border-2 border-ink bg-lime p-5 text-ink shadow-hard">
              <p className="display text-5xl">1%</p>
              <p className="max-w-32 text-xs font-black uppercase">Target payout fee, capped for service teams</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[
            ["Admin tax", "Manual scope, contracts, payment chasing, invoices, and tax records eat the margin."],
            ["Global friction", "Bank wires, PayPal fees, currency delays, and trust gaps slow down international work."],
            ["ORKA shift", "AI coordinates the work lifecycle while programmable escrow executes the money layer."]
          ].map(([title, copy], index) => (
            <article key={title} className={`cut-corner border-2 border-ink p-6 ${index === 1 ? "bg-coral text-white" : index === 2 ? "bg-lime text-ink" : "bg-white text-ink"}`}>
              <p className="display text-5xl uppercase">{title}</p>
              <p className="mt-4 text-sm font-bold leading-6">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="engines" className="px-4 py-10 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="section-label">The operating stack</p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 className="display max-w-2xl text-6xl uppercase md:text-7xl">Four engines replacing the old SaaS pile.</h2>
            <p className="max-w-md text-sm font-bold leading-6 text-ink/70">
              ORKA combines AI workflow automation with Stellar settlement rails, so the work and money move together.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {engines.map((engine) => (
              <article key={engine.title} className={`${engine.color} min-h-64 rounded-[14px] border-2 border-ink p-6 text-white shadow-hard`}>
                <h3 className="display text-4xl uppercase">{engine.title}</h3>
                <p className="mt-5 text-sm font-bold leading-6">{engine.copy}</p>
                <span className="mt-8 grid size-11 place-items-center rounded-full bg-white text-xl font-black text-ink">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="section-label">Why ORKA</p>
            <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Web2 calm. AI muscle. Web3 rails.</h2>
            <p className="mt-5 text-base font-bold leading-7 text-ink/70">
              Clients get familiar links, email access, and simple approvals. Under the hood, ORKA manages
              smart-contract escrow, sponsored transactions, path payments, verification trails, and ledgers.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Guaranteed trust", "Funds are locked before work starts and released against milestone rules."],
              ["Zero-touch ops", "AI handles project administration that usually needs managers and accountants."],
              ["Borderless payouts", "Stellar routing supports fast, low-cost settlement across currencies."],
              ["Data flywheel", "Every verified delivery teaches ORKA what good work looks like."]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[14px] border-2 border-ink bg-white p-6">
                <h3 className="display text-4xl uppercase">{title}</h3>
                <p className="mt-3 text-sm font-bold leading-6 text-ink/68">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="method" className="bg-bone px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="section-label">How it works</p>
          <h2 className="display mt-2 text-6xl uppercase md:text-7xl">From proposal to payout without the paperwork maze.</h2>
          <div className="mt-8 divide-y-2 divide-ink/12 border-y-2 border-ink/12">
            {steps.map(([number, title, copy], index) => (
              <div key={title} className={`grid gap-4 py-7 md:grid-cols-[120px_0.8fr_1.1fr_56px] md:items-center ${index === 0 ? "rounded-[18px] bg-orange px-5 text-white md:px-7" : ""}`}>
                <span className="display text-6xl">{number}</span>
                <h3 className="display text-4xl uppercase">{title}</h3>
                <p className="text-sm font-bold leading-6 opacity-80">{copy}</p>
                <span className="grid size-11 place-items-center rounded-full bg-ink text-lg font-black text-white">⌄</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[24px] bg-violet p-6 text-white md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <h2 className="display text-6xl uppercase md:text-7xl">
              Built for the people already moving global work.
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {["Agencies managing cross-border teams", "Freelancers shipping milestone projects", "Remote startups paying contractors", "Marketplaces needing escrow APIs"].map((item) => (
                <div key={item} className="rounded-[12px] border-2 border-white/70 bg-white/12 p-4 text-sm font-black uppercase">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="section-label">Dogfooded from day one</p>
            <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Oreenza becomes the first proving ground.</h2>
          </div>
          <div className="grid gap-4">
            {["Migrate real agency projects into ORKA.", "Log every time the team leaves ORKA for Notion, Gmail, Wise, or spreadsheets.", "Use real transaction volume to harden escrow, verification, and ledger workflows.", "Open the product to agencies, then clients, then marketplaces."].map((item) => (
              <div key={item} className="rounded-[14px] border-2 border-ink bg-white p-5 text-base font-black">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="section-label">FAQ</p>
            <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Your questions answered.</h2>
          </div>
          <div className="grid gap-4">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group rounded-[12px] border-2 border-ink bg-paper p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-black uppercase">
                  <span>{question}</span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white group-open:rotate-180">⌄</span>
                </summary>
                <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-ink/70">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist" className="px-4 py-16 md:px-8 lg:px-12">
        <div className="noise mx-auto max-w-7xl rounded-[28px] bg-ink p-6 text-white md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="section-label">Early access</p>
              <h2 className="display mt-2 text-6xl uppercase md:text-7xl">
                Ready to unlock autonomous project finance?
              </h2>
              <p className="mt-5 max-w-xl text-sm font-bold leading-6 text-white/70">
                Join the waitlist for agency design partner slots, hackathon updates, and the first ORKA workflow previews.
              </p>
            </div>
            <div className="rounded-[18px] bg-white p-4 text-ink md:p-6">
              <WaitlistForm compact />
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 pb-10 pt-4 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 border-t-2 border-ink/15 pt-8 md:flex-row md:items-center">
          <div>
            <p className="display text-5xl uppercase">ORKA</p>
            <p className="mt-2 max-w-md text-xs font-bold uppercase text-ink/60">
              Autonomous financial operations for the global service economy.
            </p>
          </div>
          <div className="flex gap-3 text-xs font-black uppercase">
            <a href="#engines" className="rounded-full bg-bone px-4 py-2">Engines</a>
            <a href="#method" className="rounded-full bg-bone px-4 py-2">Method</a>
            <a href="#waitlist" className="rounded-full bg-lime px-4 py-2">Waitlist</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
