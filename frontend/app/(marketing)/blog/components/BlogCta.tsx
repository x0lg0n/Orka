import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BlogCta() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
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
            <path d="M14 0L14 28M0 14L28 14M4 4L24 24M24 4L4 24" stroke="#ff8a22" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>
        <span className="absolute left-[12%] bottom-[15%] select-none hidden lg:block">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <path d="M11 0L11 22M0 11L22 11" stroke="#eaff35" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>

        {/* Main content */}
        <div className="relative z-10 mx-auto max-w-3xl">
          <h2 className="display text-4xl uppercase leading-[1.05] sm:text-5xl md:text-6xl lg:text-[72px] lg:leading-[78px]">
            Ready to run your agency on{" "}
            <span className="text-orange">autopilot?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">
            Join 50+ agencies already using ORKA to automate proposals, escrow, invoicing, and client management.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-10 py-4 text-lg font-bold text-night transition-all hover:bg-lime hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get started <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
