"use client";
import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";

export function MobileNav(props: Parameters<typeof Sidebar>[0]) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3">
        <div className="flex items-center gap-3">
          <Image src="/Logo/LOGO.svg" alt="ORKA" width={32} height={32} className="size-8 object-contain" />
          <span className="text-xl font-extrabold tracking-[-0.02em] text-white">ORKA</span>
        </div>
        <Button type="button" variant="ghost" size="icon" className="size-10" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu size={20} aria-hidden />
        </Button>
      </div>
      {open ? (
        <div className="fixed inset-0 z-50 bg-shell/80 backdrop-blur-sm transition-opacity" onClick={() => setOpen(false)}>
          <div className="relative h-full w-72 animate-[mobile-menu-in_180ms_ease-out]" onClick={(e) => e.stopPropagation()}>
            <Button type="button" variant="ghost" size="icon" className="absolute right-3 top-3 z-10 size-10" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X size={18} aria-hidden />
            </Button>
            <Sidebar {...props} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
