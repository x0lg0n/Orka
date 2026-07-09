import Image from "next/image";

export default function Footer() {
  return (
    <footer className="px-4 pb-10 pt-16 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 pt-8 md:flex-row">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <span className="grid size-40 place-items-center rounded-full">
              <Image
                src="/Logo/LOGO.svg"
                alt="ORKA"
                width={96}
                height={96}
                className="size-full object-contain"
              />
            </span>
            <span className="display text-[152px] uppercase">ORKA</span>
          </div>
          <p className=" text-[18px] leading-8 text-background/60">
            Autonomous financial operations for the global service economy.
            AI-powered proposals, escrow, verification, and payouts.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3">
            {[
              ["Engines", "#engines"],
              ["Method", "#method"],
              ["FAQ", "#faq"],
              ["Waitlist", "#waitlist"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="display flex items-center gap-3 text-[28px] font-normal uppercase text-background transition hover:text-orange">
                <span className="grid size-8 place-items-center rounded-full bg-violet hover:bg-orange text-white">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </span>
                {label}
              </a>
            ))}
          </div>
          <div className="mx-auto max-w-7xl uppercase text-center text-[16px] font-medium text-background/60 md:mx-0">
            Copyright © 2026 ORKA. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
