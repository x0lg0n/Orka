import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const socials = [
  { label: "X", href: "https://x.com/get_orka", src: "/Icons/x.svg" },
  { label: "Instagram", href: "https://instagram.com", src: "/Icons/instagram.svg" },
  { label: "Facebook", href: "https://facebook.com", src: "/Icons/facebook.svg" },
  { label: "LinkedIn", href: "https://linkedin.com", src: "/Icons/linkedin.svg" },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-10 pt-16 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 pt-8 text-left md:flex-row md:items-start">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <span className="grid size-28 place-items-center rounded-full sm:size-36 lg:size-40">
              <Image
                src="/Logo/LOGO.svg"
                alt="ORKA"
                width={96}
                height={96}
                className="size-full object-contain"
              />
            </span>
            <span className="display text-7xl uppercase sm:text-8xl lg:text-[152px]">ORKA</span>
          </div>
          <div className="mt-4 flex items-center gap-4">
            {socials.map(({ label, href, src }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="block size-6 bg-night transition-[transform,background-color] duration-200 hover:scale-110 hover:bg-orange"
                style={{
                  maskImage: `url("${src}")`,
                  WebkitMaskImage: `url("${src}")`,
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                }}
              />
            ))}
          </div>
          <p className="mt-4 text-base leading-7 text-night/80 sm:text-[18px] sm:leading-8">
            Autonomous financial operations for the global service economy.
            AI-powered proposals, escrow, verification, and payouts.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <div className="grid grid-flow-col grid-rows-2 place-items-start gap-x-8 gap-y-3 md:flex md:flex-col md:gap-3">
            {[
              ["About", "/about"],
              ["Blog", "/blog"],
              ["Contact", "/contact"],
              ["Docs", "/docs"],
              ["Terms & Services", "/terms"],
              ["Privay Policy", "/privacy"],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="group display flex items-center gap-3 text-2xl font-normal uppercase text-night transition hover:text-orange sm:text-[28px]">
               <span className="grid size-8 place-items-center rounded-full bg-violet text-white transition-colors duration-300 group-hover:bg-orange">
                <ArrowUpRight size={16} strokeWidth={3} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </span>
              {label}
            </Link>
            ))}
          </div>
          <div className="max-w-7xl text-left text-[16px] font-medium uppercase text-night/80">
            Copyright © 2026 ORKA. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
