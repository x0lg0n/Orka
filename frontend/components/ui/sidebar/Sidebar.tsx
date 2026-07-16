"use client";

import type { ReactNode } from "react";

export function Sidebar({
  expanded,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  expanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: ReactNode;
}) {
  return (
    <aside
      aria-label="Sidebar"
      data-expanded={expanded}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`z-40 flex h-screen shrink-0 flex-col border-r border-white/[0.06] bg-[#06101f] transition-[width] duration-200 ease-out ${
        expanded ? "w-[280px]" : "w-[72px]"
      } lg:sticky lg:top-0`}
    >
      {children}
    </aside>
  );
}
