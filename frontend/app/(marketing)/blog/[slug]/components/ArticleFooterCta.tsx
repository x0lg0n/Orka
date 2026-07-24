import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ArticleFooterCta() {
  return (
    <section className="mt-16 px-4 py-16 md:px-8 lg:px-12">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-night px-6 py-16 text-center text-white md:rounded-[36px] md:px-12 md:py-20">
        {/* Floating stickers */}
        <span className="sticker absolute right-[6%] top-[18%] rounded-full bg-coral px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block">
          Escrow
        </span>
        <span className="sticker absolute right-[3%] top-[38%] rounded-full bg-lime px-4 py-2 text-xs font-black uppercase text-night shadow-hard hidden lg:block" style={{ transform: "rotate(5deg)" }}>
          AI Proposals
        </span>
        <span className="sticker absolute left-[4%] top-[22%] rounded-full bg-violet px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block" style={{ transform: "rotate(-3deg)" }}>
          Smart Invoicing
        </span>
        <span className="sticker absolute left-[6%] bottom-[20%] rounded-full bg-teal px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block" style={{ transform: "rotate(4deg)" }}>
          Milestones
        </span>

        {/* Decorative SVGs */}
        <span className="absolute right-[15%] top-[12%] select-none hidden lg:block">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M14 0L14 28M0 14L28 14M4 4L24 24M24 4L4 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-orange" />
          </svg>
        </span>
        <span className="absolute left-[12%] bottom-[15%] select-none hidden lg:block">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <path d="M11 0L11 22M0 11L22 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-lime" />
          </svg>
        </span>

        {/* Main content */}
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="text-base font-bold text-white/50">
            Stop losing revenue to broken client processes.
          </p>
          <h2 className="display mt-4 text-4xl uppercase leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl lg:leading-[78px]">
            Spend Less Time <span className="text-lime">Managing Clients.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-md font-bold leading-6 text-white/60">
            More Time Growing Your Business.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-10 py-4 text-lg font-bold text-night transition-all hover:bg-lime hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/docs"
              className="group inline-flex min-h-14 items-center gap-3 rounded-full border border-white/20 px-10 py-4 text-lg font-bold text-white/60 transition-all hover:border-white/40 hover:text-white"
            >
              See How ORKA Works <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
