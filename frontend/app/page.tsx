"use client";

import { FormEvent, useState } from "react";

const engines = [
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

const steps: [string, string, string, string[][]?][] = [
  ["01", "Proposal is generated", "The service brief becomes a clear scope, timeline, agreement, and milestone schedule.", [["Scope", "Timeline", "Agreement"], ["Milestones", "Pricing", "Deliverables"], ["Review", "Approve", "Sign"]]],
  ["02", "Escrow is funded", "Clients pay in a familiar flow while ORKA handles Stellar infrastructure underneath."],
  ["03", "Work is verified", "AI reviews delivery evidence and gives the client a clean review trail."],
  ["04", "Payouts execute", "Funds release, currency routes, invoices send, and the ledger updates automatically."],
];

const faqs = [
  ["Is ORKA a marketplace?", "No. ORKA starts after the sale, helping agencies and freelancers operate projects, escrow, verification, payouts, and finance."],
  ["Do users need crypto wallets?", "No. ORKA is designed as a Web2 product experience, using Stellar and Soroban under the hood."],
  ["Who is it for first?", "Mid-sized digital agencies, global freelancers, remote startups, and niche service marketplaces."],
  ["Is the product live?", "This landing page is for the early waitlist and design partners while the hackathon/pre-seed foundation is built."],
];

function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email to join the waitlist.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      formElement.reset();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[14px] border-2 border-ink bg-lime p-5 text-ink shadow-hard">
        <p className="display text-2xl uppercase">You&apos;re on the list!</p>
        <p className="mt-2 text-sm font-bold">
          We&apos;ll reach out when design partner slots open.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={compact ? "flex flex-col gap-3 sm:flex-row" : "flex flex-col gap-3 md:flex-row md:items-end"}>
      <div className="flex-1">
        <input
          name="name"
          placeholder="Your name"
          className="min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20"
        />
      </div>
      <div className="flex-[1.5]">
        <input
          name="email"
          type="email"
          placeholder="Email address"
          className="min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Joining..." : (
          <>
            Join waitlist
            <span className="grid size-6 place-items-center rounded-full bg-ink text-white transition group-hover:bg-white group-hover:text-ink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
            </span>
          </>
        )}
      </button>
      {error ? <p className="text-sm font-bold text-coral">{error}</p> : null}
    </form>
  );
}

export default function Home() {
  return (
    <main className="overflow-hidden bg-paper">
      {/* ─── HERO ─── */}
      <section className="noise relative overflow-hidden rounded-b-[42px] bg-ink px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
        {/* Floating decorations */}
        <span className="absolute left-[8%] top-[18%] text-3xl text-lime opacity-60 select-none">+</span>
        <span className="absolute right-[12%] top-[10%] text-2xl text-orange opacity-50 select-none">✦</span>
        <span className="absolute left-[4%] bottom-[30%] text-xl text-violet opacity-40 select-none">★</span>
        <span className="absolute right-[6%] bottom-[20%] text-3xl text-coral opacity-40 select-none">+</span>

        {/* Nav */}
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between">
          <a href="#" className="flex items-center gap-2.5" aria-label="ORKA home">
            <span className="grid size-10 place-items-center rounded-full bg-white  shadow-[0_0_0_2px_rgba(255,255,255,0.22)]">
              <img
                className="size-full object-contain"
                src="/orka-logo.png"
                alt="ORKA"
              />
            </span>
            <span className="display text-3xl">ORKA</span>
          </a>
          <div className="hidden items-center gap-7 text-xs font-black uppercase md:flex">
            <a href="#engines" className="hover:text-lime">Engines</a>
            <a href="#method" className="hover:text-lime">Method</a>
            <a href="#faq" className="hover:text-lime">FAQ</a>
          </div>
          <a href="#waitlist" className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black uppercase text-ink transition hover:bg-lime">
            Get early access
            <span className="grid size-5 place-items-center rounded-full bg-ink text-white">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
            </span>
          </a>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-7xl pt-16 pb-8">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <span className="rounded-full bg-coral/20 border border-coral/40 px-4 py-1.5 text-xs font-black uppercase text-coral">
              AI operations + programmable finance
            </span>
            <span className="sticker rounded-full bg-lime px-4 py-1.5 text-xs font-black uppercase text-ink shadow-hard">
              #1 Financial OS for Service Work
            </span>
          </div>

          <h1 className="display mx-auto max-w-5xl text-center text-[4.2rem] uppercase text-white sm:text-[6.4rem] lg:text-[7.3rem]">
            Autonomous financial{" "}
            <span className="text-orange">OS</span> for{" "}
            <span className="text-violet">global</span> service work.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-semibold leading-8 text-white/78">
            ORKA eliminates the admin tax of proposals, escrow, milestone verification, payouts,
            invoices, and financial records for agencies and freelancers working across borders.
          </p>

          <div className="mt-8 flex justify-center ">
            <div className="rounded-[18px] bg-white p-5 text-ink md:p-6">
              <WaitlistForm compact />
            </div>
          </div>
        </div>

        {/* Stats + tag cloud row */}
        <div className="relative z-10 mx-auto mt-12 flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          {/* Tag cloud */}
          <div className="flex flex-wrap gap-2 max-w-md">
            {["Business Growth", "Success", "Performance Metrics", "Global Payments", "AI Automation"].map((tag, i) => (
              <span
                key={tag}
                className={`sticker rounded-full px-4 py-1.5 text-xs font-black uppercase shadow-hard ${
                  i === 0 ? "bg-orange text-white rotate-[-3deg]" :
                  i === 1 ? "bg-coral text-white rotate-[2deg]" :
                  i === 2 ? "bg-lime text-ink rotate-[-1deg]" :
                  i === 3 ? "bg-violet text-white rotate-[3deg]" :
                  "bg-teal text-white rotate-[-2deg]"
                }`}
              >
                {tag}
              </span>
            ))}
            <p className="w-full mt-3 display text-3xl uppercase text-white/90 leading-tight">
              5X achieved ROI on ad spend consistently! Average increase in ROI for our clients.
            </p>
          </div>

          {/* Stat cards */}
          <div className="flex gap-4">
            <div className="cut-corner rounded-[14px] bg-teal p-5 text-white shadow-hard min-w-[160px]">
              <div className="flex items-start justify-between">
                <p className="display text-4xl">50+</p>
                <span className="grid size-8 place-items-center rounded-full bg-white text-ink">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
                </span>
              </div>
              <p className="mt-2 text-xs font-bold opacity-80">Design partners<br />on the waitlist</p>
            </div>
            <div className="cut-corner rounded-[14px] bg-lime p-5 text-ink shadow-hard min-w-[160px]">
              <div className="flex items-start justify-between">
                <p className="display text-4xl">99%</p>
                <span className="grid size-8 place-items-center rounded-full bg-white text-ink">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
                </span>
              </div>
              <p className="mt-2 text-xs font-bold opacity-80">Admin tasks<br />eliminated</p>
            </div>
          </div>
        </div>

        {/* Sticker decorations */}
        <div className="sticker absolute -left-4 top-[40%] rounded-full bg-coral px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block">
          No wallet drama
        </div>
        <div className="sticker absolute -right-4 top-[25%] rounded-full bg-violet px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block" style={{ transform: "rotate(6deg)" }}>
          Soroban powered
        </div>
      </section>

      {/* ─── PROBLEM CARDS ─── */}
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

      {/* ─── SERVICES / ENGINES ── */}
      <section id="engines" className="px-4 py-10 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="section-label">Our Engines!</p>
          <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <h2 className="display max-w-2xl text-6xl uppercase md:text-7xl">Services designed to drive real results.</h2>
            <p className="max-w-md text-sm font-bold leading-6 text-ink/70">
              ORKA combines AI workflow automation with Stellar settlement rails, so the work and money move together.
            </p>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {engines.map((engine) => (
              <article
                key={engine.title}
                className={`cut-corner relative min-h-[220px] rounded-[14px] border-2 border-ink p-6 text-white shadow-hard ${engine.color}`}
              >
                <h3 className="display text-3xl uppercase">{engine.title}</h3>
                <p className="mt-4 max-w-[80%] text-sm font-bold leading-6">{engine.copy}</p>
                <span className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full bg-white text-xl font-black text-ink">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY ORKA ─── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="section-label">Why Choose Us!</p>
            <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Why ORKA is the trusted choice.</h2>
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
              <div key={title} className="cut-corner rounded-[14px] border-2 border-ink bg-white p-6">
                <h3 className="display text-3xl uppercase">{title}</h3>
                <p className="mt-3 text-sm font-bold leading-6 text-ink/68">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="method" className="bg-bone px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="section-label">How We Work</p>
          <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Our working method.</h2>

          {/* Step 1 — expanded */}
          <div className="mt-8 cut-corner rounded-[20px] bg-orange p-6 text-white md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="flex items-start gap-4">
                <span className="display text-7xl">1.</span>
                <div>
                  <h3 className="display text-4xl uppercase">Proposal is generated</h3>
                  <p className="mt-2 max-w-md text-sm font-bold leading-6 opacity-80">
                    The service brief becomes a clear scope, timeline, agreement, and milestone schedule.
                  </p>
                </div>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-ink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
              </span>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {steps[0][3]?.map((group, gi) => (
                <div key={gi} className="rounded-[12px] bg-white p-4 text-ink">
                  <p className="text-xs font-black uppercase opacity-60">Phase {gi + 1}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {group.map((tag) => (
                      <span key={tag} className="rounded-full bg-ink/10 px-3 py-1 text-xs font-bold">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Steps 2–4 */}
          {steps.slice(1).map(([number, title, copy], index) => (
            <div key={title} className="flex items-center gap-4 border-b-2 border-ink/12 py-7 md:gap-6">
              <span className="display text-6xl">{number}.</span>
              <div className="flex-1">
                <h3 className="display text-3xl uppercase">{title}</h3>
                <p className="mt-1 text-sm font-bold leading-6 text-ink/70">{copy}</p>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── AUDIENCE ─── */}
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

      {/* ── DOGFOODING ─── */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="section-label">Dogfooded from day one</p>
            <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Oreenza becomes the first proving ground.</h2>
          </div>
          <div className="grid gap-4">
            {["Migrate real agency projects into ORKA.", "Log every time the team leaves ORKA for Notion, Gmail, Wise, or spreadsheets.", "Use real transaction volume to harden escrow, verification, and ledger workflows.", "Open the product to agencies, then clients, then marketplaces."].map((item) => (
              <div key={item} className="cut-corner rounded-[14px] border-2 border-ink bg-white p-5 text-base font-black">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ── */}
      <section id="faq" className="bg-white px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="section-label">FAQ</p>
            <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Your questions answered.</h2>
            <p className="mt-5 text-sm font-bold leading-6 text-ink/70">
              Everything you need to know about ORKA. We have answers to your questions about our services and approach.
            </p>
          </div>
          <div className="grid gap-4">
            {faqs.map(([question, answer], index) => (
              <details key={question} className="group border-b-2 border-ink/12 pb-4">
                <summary className="flex cursor-pointer list-none items-center gap-4 text-base font-black uppercase">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white">
                    <span className="group-open:hidden text-lg leading-none">+</span>
                    <span className="hidden group-open:inline text-lg leading-none">−</span>
                  </span>
                  <span>{question}</span>
                </summary>
                <p className="mt-3 ml-12 max-w-3xl text-sm font-bold leading-6 text-ink/70">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / WAITLIST ─── */}
      <section id="waitlist" className="px-4 py-16 md:px-8 lg:px-12">
        <div className=" relative overflow-hidden mx-auto max-w-7xl rounded-[28px] bg-ink p-6 text-white md:p-10 lg:rounded-[36px]">
          {/* Floating stickers */}
          <span className="sticker absolute right-[10%] top-[15%] rounded-full bg-coral px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block">
            Brand Strategy
          </span>
          <span className="sticker absolute right-[15%] top-[25%] rounded-full bg-lime px-4 py-2 text-xs font-black uppercase text-ink shadow-hard hidden lg:block" style={{ transform: "rotate(5deg)" }}>
            Performance Metrics
          </span>
          <span className="sticker absolute right-[5%] bottom-[15%] rounded-full bg-violet px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block" style={{ transform: "rotate(-3deg)" }}>
            Business Growth
          </span>
          <span className="absolute right-[8%] bottom-[20%] text-4xl text-orange opacity-50 select-none hidden lg:block">*</span>
          <span className="absolute left-[5%] top-[50%] text-2xl text-lime opacity-40 select-none hidden lg:block">+</span>

          <div className="relative z-10 gap-8">
            <div className=" text-center">
              <h2 className="display mt-2 text-5xl uppercase md:text-6xl lg:text-7xl">
                Ready to partner with ORKA & unlock the{" "}
                <span className="text-orange">full</span> potential?
              </h2>
            </div>
            <div className="rounded-[18px] bg-white p-5 text-ink md:p-6">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ── */}
      <footer className="px-4 pb-10 pt-16 md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 border-t-2 border-ink/15 pt-8 md:flex-row">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full">
                <img src="/orka-logo.png" alt="ORKA" className="size-full object-contain" />
              </span>
              <span className="display text-[32px] uppercase">ORKA</span>
            </div>
            <p className="mt-4 text-sm font-bold leading-6 text-ink/60">
              Autonomous financial operations for the global service economy. AI-powered proposals, escrow, verification, and payouts.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              ["Engines", "#engines"],
              ["Method", "#method"],
              ["FAQ", "#faq"],
              ["Waitlist", "#waitlist"],
            ].map(([label, href]) => (
              <a key={label} href={href} className="flex items-center gap-3 text-sm font-black uppercase text-ink transition hover:text-violet">
                <span className="grid size-8 place-items-center rounded-full bg-violet text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
                </span>
                {label}
              </a>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-ink/10 pt-6 text-center text-xs font-bold text-ink/40">
          Copyright © 2026 ORKA. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
