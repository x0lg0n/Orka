"use client";
import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function MobileNav(props: Parameters<typeof Sidebar>[0]) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3">
        <div className="flex items-center gap-3">
          <Image src="/Logo/LOGO.svg" alt="ORKA" width={32} height={32} className="size-8 object-contain" />
          <span className="text-xl font-extrabold tracking-[-0.02em] text-white">ORKA</span>
        </div>
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="btn-icon">
          <Menu size={20} aria-hidden />
        </button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-shell/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="relative h-full w-72" onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="btn-icon absolute right-3 top-3 z-10">
              <X size={18} aria-hidden />
            </button>
            <Sidebar {...props} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
