"use client";

import Image from "next/image";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

export function SidebarHeader({
  collapsed,
  expanded,
  onToggleCollapse,
}: {
  collapsed: boolean;
  expanded: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4">
      <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="ORKA home">
        <Image
          src="/Logo/LOGO.svg"
          alt="ORKA"
          width={32}
          height={32}
          className="size-8 object-contain"
          priority
        />
        {expanded && (
          <span className="text-xl font-extrabold tracking-[-0.02em] text-white">ORKA</span>
        )}
      </Link>

      {expanded && (
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="ml-auto grid size-8 place-items-center rounded-lg text-white/45 transition hover:bg-hover hover:text-white"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden />
          ) : (
            <PanelLeftClose className="size-4" aria-hidden />
          )}
        </button>
      )}
    </div>
  );
}
