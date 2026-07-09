import Navbar from "./Navbar";
import WaitlistForm from "./WaitlistForm";
import { ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-b-[42px] bg-ink px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
      {/* Floating decorations */}
      <span className="absolute left-[8%] top-[18%] text-3xl text-lime opacity-60 select-none">
        +
      </span>
      <span className="absolute right-[12%] top-[10%] text-2xl text-orange opacity-50 select-none">
        ✦
      </span>
      <span className="absolute left-[4%] bottom-[30%] text-xl text-violet opacity-40 select-none">
        ★
      </span>
      <span className="absolute right-[6%] bottom-[20%] text-3xl text-coral opacity-40 select-none">
        +
      </span>

      {/* Nav */}
      <Navbar />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-7xl pt-16 pb-8">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <span className="text-[18px] font-medium text-white">
            ❤️ #1 Financial OS for Service Work
          </span>
        </div>

        <h1 className="display mx-auto max-w-5xl text-center text-[4.2rem] uppercase text-white sm:text-[6.4rem] lg:text-[7.3rem]">
          Autonomous <span className="text-orange">financial OS</span> for{" "}
          global <span className="text-violet">service work.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-normal leading-8 text-white/78">
          ORKA eliminates the admin tax of proposals, escrow, milestone
          verification, payouts, invoices, and financial records for agencies
          and freelancers working across borders.
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
          {[
            "Business Growth",
            "Success",
            "Performance Metrics",
            "Global Payments",
            "AI Automation",
          ].map((tag, i) => (
            <span
              key={tag}
              className={`sticker rounded-full px-4 py-1.5 text-xs font-black uppercase shadow-hard ${
                i === 0 ? "bg-orange text-white rotate-[-3deg]"
                : i === 1 ? "bg-coral text-white rotate-[2deg]"
                : i === 2 ? "bg-lime text-ink rotate-[-1deg]"
                : i === 3 ? "bg-violet text-white rotate-[3deg]"
                : "bg-teal text-white rotate-[-2deg]"
              }`}>
              {tag}
            </span>
          ))}
          <p className="w-full mt-3 font-medium text-[32px] uppercase text-white/90 leading-[35px]">
            5X achieved ROI on ad spend consistently! Average{" "}
            <span className="text-white/50">
              increase in ROI for our clients.
            </span>
          </p>
        </div>

        {/* Stat cards */}
        <div className="flex flex-wrap gap-4 max-w-md">
          <div className="cut-corner rounded-[14px] bg-teal p-5 text-ink shadow-hard min-w-[160px]">
            <div className="flex items-end justify-between">
              <p className="display text-[40px]">50+</p>
              <ArrowUpRight size={40} className="shrink-0" />
            </div>
            <p className="mt-2 text-[14px] font-bold leading-6">
              Design partners & early 
              <br />
              adopters on the waitlist
            </p>
          </div>
          <div className="cut-corner rounded-[14px] bg-lime p-5 text-ink shadow-hard min-w-[160px]">
            <div className="flex items-end justify-between">
              <p className="display text-[40px]">99%</p>
              <ArrowUpRight size={40} className="shrink-0" />
            </div>
            <p className="mt-2 text-[14px] font-bold leading-6">
              Admin tasks & workload
              <br />
              eliminated
            </p>
          </div>
          <p className="text-[14px] font-medium text-white/80">
            Helping brands thrive with strategic campaigns, creative content,
            and results-focused marketing precision marketing.
          </p>
        </div>
      </div>

      {/* Sticker decorations */}
    </section>
  );
}
