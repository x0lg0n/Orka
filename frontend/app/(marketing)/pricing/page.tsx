import Link from "next/link";

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

export const metadata = { title: "Pricing · ORKA" };

export default function PricingPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <h1 className="display text-4xl uppercase text-night">Pricing</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm font-bold text-night/70">
          Pay only for what you ship. Escrow fees are on-chain and transparent.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col rounded-[20px] border p-6 ${
              t.highlight
                ? "border-lime bg-white shadow-hard"
                : "border-night/10 bg-white/60"
            }`}
          >
            <h2 className="text-xl font-extrabold text-night">{t.name}</h2>
            <p className="mt-1 text-sm font-bold text-night/60">{t.blurb}</p>
            <p className="mt-4 text-3xl font-extrabold text-night">
              {t.price}
              {t.price !== "Custom" ? (
                <span className="text-sm font-bold text-night/50">/mo</span>
              ) : null}
            </p>
            <ul className="mt-6 flex-1 space-y-2">
              {t.features.map((f) => (
                <li key={f} className="text-sm font-bold text-night/80">
                  · {f}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-lime px-6 text-sm font-black uppercase text-night transition hover:-translate-y-0.5 hover:bg-orange hover:text-white"
            >
              Get started
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
