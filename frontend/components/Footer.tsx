import Image from "next/image";

export default function Footer() {
  return (
    <footer className="px-4 pb-10 pt-16 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 border-t-2 border-ink/15 pt-8 md:flex-row">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full">
              <Image src="/Logo/LOGO.svg" alt="ORKA" width={48} height={48} className="size-full object-contain" />
            </span>
            <span className="display text-[32px] uppercase">ORKA</span>
          </div>
          <p className="mt-4 text-sm font-bold leading-6 text-ink/60">
            Autonomous financial operations for the global service economy. AI-powered proposals, escrow, verification, and payouts.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {[
            ["Engines", "#engines"],
            ["Method", "#method"],
            ["FAQ", "#faq"],
            ["Waitlist", "#waitlist"],
          ].map(([label, href]) => (
            <a key={label} href={href} className="flex items-center gap-3 text-sm font-black uppercase text-ink transition hover:text-violet">
              <span className="grid size-8 place-items-center rounded-full bg-violet text-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
              </span>
              {label}
            </a>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-ink/10 pt-6 text-center text-xs font-bold text-ink/40">
        Copyright © 2026 ORKA. All rights reserved.
      </div>
    </footer>
  );
}
