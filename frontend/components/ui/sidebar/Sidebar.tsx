"use client";

import type { ReactNode } from "react";

export function Sidebar({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label="Sidebar"
      className="z-40 flex h-screen w-[280px] shrink-0 flex-col border-r border-white/[0.06] bg-[#06101f] lg:sticky lg:top-0"
    >
      {children}
    </aside>
  );
}
