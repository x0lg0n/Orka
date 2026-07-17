"use client";

import Image from "next/image";
import Link from "next/link";

export function SidebarHeader() {
  return (
    <Link
      href="/"
      className="flex items-center justify-center-safe gap-5 px-5 py-4"
      aria-label="ORKA home"
    >
      <Image
        src="/Logo/LOGO.svg"
        alt="ORKA"
        width={32}
        height={32}
        className="size-8 object-contain"
        priority
      />
      <span className="text-xl font-extrabold tracking-[-0.02em] text-white">ORKA</span>
    </Link>
  );
}
