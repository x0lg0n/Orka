"use client";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";

export function MobileNav(props: Parameters<typeof Sidebar>[0]) {
  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3">
        <div className="flex items-center gap-3">
          <Image src="/Logo/LOGO.svg" alt="ORKA" width={32} height={32} className="size-8 object-contain" />
          <span className="text-xl font-extrabold tracking-[-0.02em] text-white">ORKA</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="size-10" aria-label="Open menu">
              <Menu size={20} aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-border bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar {...props} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
