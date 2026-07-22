import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Services · ORKA",
  description:
    "ORKA brings proposals, project delivery, secure payments, and client collaboration into one operating workspace.",
};

const serviceAreas = [
  {
    number: "01",
    title: "Project workspace",
    outcome:
      "Keep project scope, owners, dates, files, and the live status in one shared place—so the team always knows what happens next.",
  },
  {
    number: "02",
    title: "Proposals & contracts",
    outcome:
      "Turn a client brief into a clear proposal, agreement, and priced milestones before delivery begins.",
  },
  {
    number: "03",
    title: "Milestone payments & escrow",
    outcome:
      "Fund work by milestone and keep a transparent record of when money is secured, approved, and released.",
  },
  {
    number: "04",
    title: "Client collaboration",
    outcome:
      "Give clients one calm place to review deliverables, approve the next step, and follow the project without email chasing.",
  },
  {
    number: "05",
    title: "AI assistance",
    outcome:
      "Use practical AI help to shape scope, organise work, and prepare delivery evidence—while people remain in control of decisions.",
  },
];

const process = [
  ["01", "Set up", "Create a workspace and map the work into clear milestones."],
  ["02", "Agree", "Share the proposal and record the terms everyone accepts."],
  ["03", "Deliver", "Keep the project, evidence, and client feedback together."],
  ["04", "Get paid", "Move approved work through a clear payment and record trail."],
] as const;

export default function ServicesPage() {
  return (
    <div className="overflow-hidden">
      <section className="bg-night px-4 pb-14 pt-12 text-white md:px-8 md:pb-20 md:pt-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">
            ORKA services
          </p>
          <h1 className="display mt-5 max-w-4xl text-[2.85rem] uppercase leading-[0.95] sm:text-6xl md:text-8xl">
            Services built for <span className="text-orange">client work.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            ORKA gives service teams one dependable operating layer for agreeing work,
            delivering it clearly, and getting paid with less administration.
          </p>
        </div>
      </section>

      <main>
        <section className="px-4 py-14 md:px-8 md:py-20 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="border-b-2 border-night pb-5 sm:flex sm:items-end sm:justify-between sm:gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
                  What ORKA handles
                </p>
                <h2 className="display mt-2 text-4xl uppercase sm:text-5xl">
                  The work around the work.
                </h2>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-night/70 sm:mt-0">
                A practical toolkit for agencies, studios, and independent teams
                running real client engagements.
              </p>
            </div>

            <ol className="mt-2 divide-y divide-night/15">
              {serviceAreas.map((area) => (
                <li
                  key={area.number}
                  className="group grid gap-3 py-7 sm:grid-cols-[5rem_minmax(13rem,0.8fr)_minmax(0,1.2fr)] sm:items-start sm:gap-6"
                >
                  <span className="font-mono text-sm font-bold text-violet">
                    {area.number}
                  </span>
                  <h3 className="display text-2xl uppercase sm:text-3xl">
                    {area.title}
                  </h3>
                  <p className="max-w-xl text-base leading-7 text-night/75">
                    {area.outcome}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-night/10 bg-bone px-4 py-14 md:px-8 md:py-20 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-coral">
                A clearer project cycle
              </p>
              <h2 className="display mt-2 text-4xl uppercase sm:text-5xl">
                Four moves. One record.
              </h2>
            </div>

            <ol className="mt-10 grid gap-0 border-y-2 border-night md:grid-cols-4 md:border-y-0 md:border-l-2">
              {process.map(([number, title, copy]) => (
                <li
                  key={number}
                  className="relative border-b-2 border-night p-5 last:border-b-0 md:min-h-56 md:border-b-0 md:border-r-2"
                >
                  <span className="font-mono text-xs font-bold text-violet">{number}</span>
                  <h3 className="display mt-6 text-3xl uppercase">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-night/75">{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-4 py-14 md:px-8 md:py-20 lg:px-12">
          <div className="mx-auto grid max-w-6xl gap-8 border-2 border-night bg-white p-7 md:grid-cols-[1fr_auto] md:items-end md:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal">
                Ready when the work is
              </p>
              <h2 className="display mt-3 max-w-2xl text-4xl uppercase sm:text-5xl">
                Build a calmer way to run client work.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-night/75">
                Start with a workspace, then bring your next proposal, client, or
                milestone into the same clear flow.
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 md:items-end">
              <Link
                href="/signup"
                className="group inline-flex min-h-12 items-center gap-3 bg-violet px-5 text-sm font-black uppercase text-white transition-colors hover:bg-night focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet"
              >
                Create an account
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/terms"
                className="inline-flex items-center gap-2 text-sm font-bold text-night underline decoration-orange decoration-2 underline-offset-4 transition-colors hover:text-violet focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet"
              >
                <Check size={15} aria-hidden="true" />
                Read the service terms
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
