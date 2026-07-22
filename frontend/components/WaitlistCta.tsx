import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function WaitlistCta() {
  return (
    <section id="waitlist" className="px-4 py-16 md:px-8 lg:px-12">
      <div className=" relative overflow-hidden mx-auto max-w-7xl rounded-[28px] bg-night p-6 text-white md:p-10 lg:rounded-[36px]">
        {/* Floating stickers */}
        <span className="sticker absolute right-[5%] top-[35%] rounded-full bg-coral px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block">
          Milestone Escrow
        </span>
        <span className="sticker absolute right-[3%] top-[45%] rounded-full bg-lime px-4 py-2 text-xs font-black uppercase text-night shadow-hard hidden lg:block" style={{ transform: "rotate(5deg)" }}>
          Verified Payouts
        </span>
        <span className="sticker absolute right-[5%] top-[55%] rounded-full bg-violet px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block" style={{ transform: "rotate(-3deg)" }}>
          AI Operations
        </span>
        <span className="absolute right-[58%] bottom-[30%] select-none hidden lg:block">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
            <path d="M14 0L14 28M0 14L28 14M4 4L24 24M24 4L4 24" stroke="#ff8a22" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </span>
        <span className="absolute left-[10%] top-[20%] select-none hidden lg:block">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
            <path d="M11 0L11 22M0 11L22 11" stroke="#eaff35" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </span>

        <div className="grid col-auto gap-10 md:gap-20">
          <div className="text-center">
            <h2 className="display mt-2 text-4xl uppercase leading-[1.05] sm:text-5xl md:text-6xl lg:text-[80px] lg:leading-[80px]">
              Ready to partner with ORKA & unlock the{" "}
              <span className="text-orange">full</span> potential?
            </h2>
          </div>
          <div className="flex justify-center">
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
