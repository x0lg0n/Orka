"use client";

import Image from "next/image";

export default function BlogHero() {
  return (
    <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
      {/* Floating decorations */}
      <Image
        src="/Elements/Star-Violet.svg"
        alt=""
        aria-hidden
        width={40}
        height={40}
        className="pointer-events-none absolute right-[12%] top-[25%] hidden w-8 object-contain opacity-60 md:block lg:w-10 float-1"
      />
      <Image
        src="/Elements/Plus-Teal.svg"
        alt=""
        aria-hidden
        width={36}
        height={36}
        className="pointer-events-none absolute left-[10%] top-[35%] hidden w-7 object-contain opacity-50 md:block lg:w-9 float-2"
      />
      <Image
        src="/Elements/Star-Blue.svg"
        alt=""
        aria-hidden
        width={28}
        height={28}
        className="pointer-events-none absolute right-[8%] bottom-[20%] hidden w-6 object-contain opacity-40 sm:block float-3"
      />
      <Image
        src="/Elements/Plus-Lime.svg"
        alt=""
        aria-hidden
        width={32}
        height={32}
        className="pointer-events-none absolute left-[6%] bottom-[25%] hidden w-7 object-contain opacity-40 sm:block float-4"
      />
      <Image
        src="/Elements/Asterics-Orange.svg"
        alt=""
        aria-hidden
        width={30}
        height={30}
        className="pointer-events-none absolute right-[18%] top-[45%] hidden w-6 object-contain opacity-50 lg:block float-5"
      />
      <Image
        src="/Elements/Star.png"
        alt=""
        aria-hidden
        width={24}
        height={24}
        className="pointer-events-none absolute left-[15%] top-[20%] hidden w-5 object-contain opacity-30 lg:block float-3"
      />

      <div className="relative z-10 mx-auto max-w-7xl pt-16 pb-4 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
        {/* Left: Text */}
        <div>
          <span className="inline-block rounded-full border border-violet/30 bg-violet/15 px-4 py-1.5 text-base font-bold text-violet">
            ORKA JOURNAL
          </span>
          <h1 className="display mx-auto mt-6 max-w-xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4rem] md:text-[5rem] lg:mx-0">
            Insights for <span className="text-orange">Modern</span> Service Businesses
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-normal leading-7 text-white/70 sm:text-lg sm:leading-8 lg:mx-0">
            Actionable insights, templates, and strategies to help agencies and
            freelancers run smarter and grow faster.
          </p>
        </div>

        {/* Right: Colorful floating objects */}
        <div className="relative mt-12 hidden h-[400px] lg:block">
          {/* Sticker: Proposals */}
          <div className="sticker absolute left-[10%] top-[5%] rounded-2xl bg-white px-5 py-4 shadow-[0_12px_40px_rgba(124,58,237,0.25)]">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-violet/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-violet"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
              <span className="text-sm font-black text-night">Proposals</span>
            </div>
            <span className="rounded-full bg-violet/10 px-3 py-1 text-2xs font-bold text-violet">AI Generated</span>
          </div>

          {/* Sticker: Escrow */}
          <div className="sticker absolute left-[0%] top-[40%] rounded-2xl bg-white px-5 py-4 shadow-[0_12px_40px_rgba(20,184,166,0.25)]" style={{ transform: "rotate(-2deg)" }}>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-teal/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <span className="text-sm font-black text-night">Escrow</span>
            </div>
            <span className="rounded-full bg-teal/10 px-3 py-1 text-2xs font-bold text-teal">$24k Secured</span>
          </div>

          {/* Sticker: Payments */}
          <div className="sticker absolute right-[5%] top-[30%] rounded-2xl bg-white px-5 py-4 shadow-[0_12px_40px_rgba(255,134,34,0.25)]" style={{ transform: "rotate(3deg)" }}>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-orange/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </span>
              <span className="text-sm font-black text-night">Payments</span>
            </div>
            <span className="rounded-full bg-orange/10 px-3 py-1 text-2xs font-bold text-orange">On Track</span>
          </div>

          {/* Sticker: Milestones */}
          <div className="sticker absolute right-[10%] bottom-[10%] rounded-2xl bg-white px-5 py-4 shadow-[0_12px_40px_rgba(234,255,53,0.2)]" style={{ transform: "rotate(-1deg)" }}>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-lime/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-lime"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span className="text-sm font-black text-night">Milestones</span>
            </div>
            <span className="rounded-full bg-lime/10 px-3 py-1 text-2xs font-bold text-night">2 Done</span>
          </div>
        </div>
      </div>
    </section>
  );
}
