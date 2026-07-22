import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$0",
    blurb: "For freelancers testing the waters.",
    features: [
      "1 active workspace",
      "Up to 3 projects",
      "On-chain escrow (USDC)",
      "Client portal links",
    ],
    highlight: false,
  },
  {
    name: "Studio",
    price: "$29",
    blurb: "For growing teams running real engagements.",
    features: [
      "Unlimited projects",
      "Milestone automation",
      "Proposals & invoices",
      "Analytics dashboard",
      "Priority support",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    blurb: "For agencies with custom compliance needs.",
    features: [
      "Everything in Studio",
      "SSO & audit logs",
      "Dedicated chain infra",
      "White-glove onboarding",
    ],
    highlight: false,
  },
];

export const metadata: Metadata = { title: "Pricing · ORKA" };

export default function PricingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
        <div className="relative z-10 mx-auto max-w-4xl pt-16 pb-4 text-center">
          <span className="rounded-full border border-white/20 bg-white/8 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/80">
            Simple, transparent pricing
          </span>
          <h1 className="display mx-auto mt-6 max-w-3xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4rem] md:text-[5.5rem]">
            Pay only for what you <span className="text-lime">ship.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-normal leading-7 text-white/78 sm:text-lg sm:leading-8">
            Escrow fees are on-chain and transparent. No hidden costs, no surprises.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`relative flex flex-col rounded-[20px] border-2 p-6 ${
                  t.highlight
                    ? "border-lime bg-white shadow-hard"
                    : "border-night/15 bg-white/70"
                }`}
              >
                {t.highlight && (
                  <span className="sticker absolute -top-3 right-5 rounded-full bg-lime px-4 py-1 text-xs font-black uppercase text-night shadow-hard">
                    Most popular
                  </span>
                )}
                <h2 className="display text-3xl uppercase text-night">{t.name}</h2>
                <p className="mt-1 text-sm font-medium text-night/60">{t.blurb}</p>
                <p className="mt-5 text-4xl font-extrabold text-night">
                  {t.price}
                  {t.price !== "Custom" ? (
                    <span className="text-base font-bold text-night/50">/mo</span>
                  ) : null}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-night/80">
                      <Check size={15} className="shrink-0 text-teal" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 flex min-h-12 items-center justify-center rounded-full bg-lime px-6 text-sm font-black uppercase text-night transition hover:-translate-y-0.5 hover:bg-orange hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>

          {/* Feature comparison table */}
          <div className="mt-16">
            <h2 className="display text-center text-3xl uppercase text-night sm:text-4xl">
              Compare plans
            </h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-night">
                    <th className="py-3 text-left font-black uppercase text-night/50 text-xs tracking-[0.12em]">Feature</th>
                    {tiers.map((t) => (
                      <th key={t.name} className="py-3 text-center">
                        <span className="display text-xl uppercase text-night">{t.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-night/10">
                  {[
                    ["Active workspaces", "1", "Unlimited", "Unlimited"],
                    ["Projects", "Up to 3", "Unlimited", "Unlimited"],
                    ["On-chain escrow (USDC)", "✓", "✓", "✓"],
                    ["Client portal links", "✓", "✓", "✓"],
                    ["Milestone automation", "—", "✓", "✓"],
                    ["Proposals & invoices", "—", "✓", "✓"],
                    ["Analytics dashboard", "—", "✓", "✓"],
                    ["SSO & audit logs", "—", "—", "✓"],
                    ["Dedicated chain infra", "—", "—", "✓"],
                    ["White-glove onboarding", "—", "—", "✓"],
                    ["Support", "Community", "Priority email", "Dedicated manager"],
                  ].map(([feature, starter, studio, enterprise]) => (
                    <tr key={feature} className="group">
                      <td className="py-4 font-medium text-night/80">{feature}</td>
                      <td className="py-4 text-center text-night/60">{starter}</td>
                      <td className="py-4 text-center font-bold text-night">{studio}</td>
                      <td className="py-4 text-center text-night/60">{enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
