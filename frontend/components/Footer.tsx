import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
  { label: "About", href: "#" },
  { label: "Services", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Contact", href: "#" },
];

const SOCIAL_LINK_CLASS =
  "text-ink/60 transition duration-200 hover:-translate-y-0.5 hover:scale-110 hover:text-violet";

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 lg:px-12">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <Image src="/Logo/LOGO.svg" alt="ORKA" width={48} height={48} className="object-contain" />
              <span className="font-black uppercase text-ink text-3xl">ORKA</span>
            </div>
            <p className="mt-4 text-sm text-ink/60 leading-6">
              Autonomous financial operations for the global service economy. AI-powered proposals, escrow, verification, and payouts.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a href="#" aria-label="X" className={SOCIAL_LINK_CLASS}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                </svg>
              </a>
              <a href="#" aria-label="Facebook" className={SOCIAL_LINK_CLASS}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073Z" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className={SOCIAL_LINK_CLASS}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
                </svg>
              </a>
            </div>
          </div>

          <nav className="flex flex-col gap-5 md:items-end md:gap-6">
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="group flex items-center gap-3 font-black uppercase text-ink transition-colors duration-300 hover:text-violet"
              >
                <span className="grid size-7 place-items-center rounded-full border border-ink/30 transition-all duration-300 group-hover:translate-x-1 group-hover:border-violet group-hover:text-violet">
                  <ArrowUpRight size={14} />
                </span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">{label}</span>
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-16 text-right text-xs text-ink/40">
          © 2026 ORKA. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
