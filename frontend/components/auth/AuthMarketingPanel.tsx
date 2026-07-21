import Image from "next/image";
import { ShieldCheck, FileText, ExternalLink } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Milestone escrow",
    desc: "Funds release on approval, not promises",
  },
  {
    icon: FileText,
    title: "Smart contracts",
    desc: "Proposals & agreements on Stellar",
  },
  {
    icon: ExternalLink,
    title: "Client portal",
    desc: "Share, sign, and get paid",
  },
];

const testimonials = [
  {
    quote:
      "ORKA makes client agreements painless. The smart contract integration is a game-changer for freelance work.",
    handle: "@buildwithorka",
  },
  {
    quote:
      "Milestone-based escrow means I never chase payments anymore. This is how project management should work.",
    handle: "@buildwithorka",
  },
];

export default function AuthMarketingPanel() {
  return (
    <aside className="flex h-full flex-col justify-center px-8 py-12 lg:px-12">
      <div className="mb-8 flex items-center gap-3">
        <Image
          src="/Logo/LOGO.svg"
          alt="ORKA"
          width={32}
          height={32}
          className="size-8"
        />
        <span className="text-lg font-bold text-white">ORKA</span>
      </div>

      <h2 className="max-w-[18ch] text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
        Ship work.
        <br />
        Get paid.
        <br />
        <span className="text-lime">On Stellar.</span>
      </h2>

      <div className="mt-10 space-y-5">
        {features.map((f) => (
          <div key={f.title} className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10">
              <f.icon className="h-4 w-4 text-lime" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{f.title}</p>
              <p className="text-sm text-white/60">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-4 border-t border-white/10 pt-8">
        {testimonials.map((t, i) => (
          <figure key={i}>
            <blockquote className="text-sm leading-relaxed text-white/80">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-2 text-xs font-bold text-white/50">
              {t.handle}
            </figcaption>
          </figure>
        ))}
      </div>
    </aside>
  );
}
