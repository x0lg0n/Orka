"use client";

import type { ReactNode } from "react";

export function SidebarFooter({ children }: { children: ReactNode }) {
  return <div className="mt-auto border-t border-white/[0.06]">{children}</div>;
}
