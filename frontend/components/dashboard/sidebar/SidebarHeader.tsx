"use client";

import Link from "next/link";
import Image from "next/image";

export function SidebarHeader() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-5 py-1">
      <Image
        src="/Logo/LOGO.svg"
        alt="ORKA"
        width={32}
        height={32}
        className="h-8 w-8"
        priority
      />
      <span className="text-xl font-bold tracking-tight text-white">ORKA</span>
    </Link>
  );
}
