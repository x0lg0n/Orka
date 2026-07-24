"use client";

import Image from "next/image";

export default function BlogHero() {
  return (
    <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-orange/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-violet/8 blur-[100px]" />

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

        {/* Right: Editorial illustration area */}
        <div className="relative mt-12 hidden h-[420px] lg:block">
          {/* Abstract editorial illustration - large flowing shape */}
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            width="380"
            height="380"
            viewBox="0 0 380 380"
            fill="none"
            aria-hidden
          >
            <circle cx="190" cy="190" r="180" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <circle cx="190" cy="190" r="140" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6 8" />
            <circle cx="190" cy="190" r="90" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <path d="M95 190 C95 137 137 95 190 95 C243 95 285 137 285 190" stroke="#FF8622" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
            <path d="M285 190 C285 243 243 285 190 285 C137 285 95 243 95 190" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" opacity="0.25" />
            <line x1="190" y1="10" x2="190" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="190" y1="330" x2="190" y2="370" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="10" y1="190" x2="50" y2="190" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1="330" y1="190" x2="370" y2="190" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* Dots scattered along the arcs */}
            <circle cx="120" cy="120" r="3" fill="rgba(124,58,237,0.4)" />
            <circle cx="260" cy="120" r="3" fill="rgba(255,134,34,0.4)" />
            <circle cx="120" cy="260" r="3" fill="rgba(20,184,166,0.4)" />
            <circle cx="260" cy="260" r="3" fill="rgba(234,255,53,0.4)" />
            <circle cx="155" cy="95" r="2" fill="rgba(255,255,255,0.15)" />
            <circle cx="225" cy="95" r="2" fill="rgba(255,255,255,0.15)" />
            <circle cx="155" cy="285" r="2" fill="rgba(255,255,255,0.15)" />
            <circle cx="225" cy="285" r="2" fill="rgba(255,255,255,0.15)" />
          </svg>

          {/* Sticker: Proposals */}
          <div className="sticker absolute left-[8%] top-[3%] z-10 rounded-2xl bg-white px-5 py-4 shadow-[0_12px_40px_rgba(124,58,237,0.3)]">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-violet/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-violet"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </span>
              <span className="text-sm font-black text-night">Proposals</span>
            </div>
            <span className="rounded-full bg-violet/10 px-3 py-1 text-2xs font-bold text-violet">AI Generated</span>
          </div>

          {/* Sticker: Escrow */}
          <div className="sticker absolute left-[0%] top-[42%] z-10 rounded-2xl bg-white px-5 py-4 shadow-[0_12px_40px_rgba(20,184,166,0.3)]" style={{ transform: "rotate(-2deg)" }}>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-teal/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-teal"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </span>
              <span className="text-sm font-black text-night">Escrow</span>
            </div>
            <span className="rounded-full bg-teal/10 px-3 py-1 text-2xs font-bold text-teal">$24k Secured</span>
          </div>

          {/* Sticker: Payments */}
          <div className="sticker absolute right-[3%] top-[32%] z-10 rounded-2xl bg-white px-5 py-4 shadow-[0_12px_40px_rgba(255,134,34,0.3)]" style={{ transform: "rotate(3deg)" }}>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-orange/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-orange"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </span>
              <span className="text-sm font-black text-night">Payments</span>
            </div>
            <span className="rounded-full bg-orange/10 px-3 py-1 text-2xs font-bold text-orange">On Track</span>
          </div>

          {/* Sticker: Milestones */}
          <div className="sticker absolute right-[12%] bottom-[8%] z-10 rounded-2xl bg-white px-5 py-4 shadow-[0_12px_40px_rgba(234,255,53,0.22)]" style={{ transform: "rotate(-1deg)" }}>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-lime/10">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-lime"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span className="text-sm font-black text-night">Milestones</span>
            </div>
            <span className="rounded-full bg-lime/10 px-3 py-1 text-2xs font-bold text-night">2 Done</span>
          </div>

          {/* Bottom decorative dots pattern */}
          <svg
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
            width="240"
            height="16"
            viewBox="0 0 240 16"
            fill="none"
            aria-hidden
          >
            {Array.from({ length: 15 }).map((_, i) => (
              <circle key={i} cx={i * 16 + 8} cy="8" r="2" fill="rgba(255,255,255,0.08)" />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
