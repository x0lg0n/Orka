import Image from "next/image";
import Navbar from "./Navbar";
import WaitlistForm from "./WaitlistForm";
import { ArrowUpRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-night rounded-b-[42px] px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
      {/* Floating decorations */}
      <Image
        src="/Elements/Star-Violet.svg"
        alt=""
        aria-hidden
        width={40}
        height={40}
        className="pointer-events-none absolute right-[14%] bottom-[52%] hidden w-8 object-contain md:block lg:w-10 float-1"
      />
      <Image
        src="/Elements/Plus-Teal.svg"
        alt=""
        aria-hidden
        width={36}
        height={36}
        className="pointer-events-none absolute left-[14%] top-[30%] hidden w-7 object-contain md:block lg:w-9 float-2"
      />
      <Image
        src="/Elements/Star-Blue.svg"
        alt=""
        aria-hidden
        width={28}
        height={28}
        className="pointer-events-none absolute left-[5%] bottom-[30%] hidden w-6 object-contain opacity-70 sm:block float-3"
      />
      <Image
        src="/Elements/Plus-Lime.svg"
        alt=""
        aria-hidden
        width={32}
        height={32}
        className="pointer-events-none absolute right-[6%] bottom-[22%] hidden w-7 object-contain opacity-70 sm:block float-4"
      />
      <Image
        src="/Elements/Asterics-Orange.svg"
        alt=""
        aria-hidden
        width={30}
        height={30}
        className="pointer-events-none absolute left-[8%] top-[52%] hidden w-6 object-contain lg:block float-5"
      />
      {/* Nav */}
      <Navbar />
      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-7xl pt-16 pb-8">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <span className="text-center text-[15px] font-medium text-white sm:text-[18px]">
            ❤️ #1 Financial OS for Service Work
          </span>
        </div>

        <h1 className="display mx-auto max-w-5xl text-center text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4.4rem] md:text-[6.4rem] lg:text-[7.3rem]">
          Autonomous <span className="text-orange">financial OS</span> for{" "}
          global <span className="text-violet">service work.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-base font-normal leading-7 text-white/78 sm:text-lg sm:leading-8">
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
      <div className="relative z-10 mx-auto mt-12 flex max-w-7xl flex-col items-center gap-8 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
        {/* Tag cloud */}
        <div className="flex max-w-md flex-wrap justify-center gap-2 lg:justify-start">
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
          <p className="mt-3 w-full text-[24px] font-medium uppercase leading-[28px] text-white/90 sm:text-[32px] sm:leading-[35px]">
            5X achieved ROI on ad spend consistently! Average{" "}
            <span className="text-white/50">
              increase in ROI for our clients.
            </span>
          </p>
        </div>

        {/* Stat cards */}
        <div className="flex max-w-md flex-wrap justify-center gap-4 lg:justify-start">
          <div className="cut-corner group rounded-[14px] bg-teal p-5 text-ink shadow-hard transition-transform duration-300 hover:-translate-y-1 min-w-[160px]">
            <div className="flex items-end justify-between">
              <p className="display text-[40px]">50+</p>
              <ArrowUpRight size={40} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <p className="mt-2 text-[14px] font-bold leading-6">
              Design partners & early
              <br />
              adopters on the waitlist
            </p>
          </div>
          <div className="cut-corner group rounded-[14px] bg-lime p-5 text-ink shadow-hard transition-transform duration-300 hover:-translate-y-1 min-w-[160px]">
            <div className="flex items-end justify-between">
              <p className="display text-[40px]">99%</p>
              <ArrowUpRight size={40} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
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
