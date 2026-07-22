import { Check } from "lucide-react";

const testimonial = {
  quote:
    "Very impressed by @buildwithorka. The smart contract integration on Stellar is exactly what the freelance economy needed.",
  handle: "@patrickc",
  role: "Partner, Sam Altman's Fund",
};

const benefits = [
  "Keep every approval and deliverable in context",
  "Fund milestones before the work begins",
  "Give clients a portal they can actually use",
];

export default function AuthMarketingPanel() {
  return (
    <aside className="flex h-full w-full flex-col justify-between bg-night px-10 py-12 text-white xl:px-16">
      <div className="max-w-md">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/75">
          <span className="size-1.5 rounded-full bg-lime" aria-hidden="true" />
          Built for independent work
        </div>
        <h2 className="text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.035em] text-white">
          Make every project feel certain.
        </h2>
        <p className="mt-5 max-w-sm text-pretty text-base leading-7 text-white/65">
          ORKA brings contracts, milestones, and payments into one shared workspace for you and your clients.
        </p>

        <ul className="mt-10 space-y-4 text-sm text-white/80">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-lime text-night">
                <Check size={13} strokeWidth={3} aria-hidden="true" />
              </span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      <figure className="max-w-md border-t border-white/15 pt-7">
        <blockquote className="text-pretty text-base leading-7 text-white/80">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <figcaption className="mt-5 flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-full bg-white/10 text-xs font-bold text-lime">
            {testimonial.handle[1].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{testimonial.handle}</p>
            <p className="mt-0.5 text-xs text-white/50">{testimonial.role}</p>
          </div>
        </figcaption>
      </figure>
    </aside>
  );
}
