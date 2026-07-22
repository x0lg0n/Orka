"use client";

import { Search } from "lucide-react";

interface DocsSearchTriggerProps {
  onClick: () => void;
  className?: string;
}

export default function DocsSearchTrigger({
  onClick,
  className = "",
}: DocsSearchTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[12px] text-white/50 transition-colors hover:bg-white/15 ${className}`}
    >
      <Search size={14} className="shrink-0" />
      <span className="hidden sm:inline">Search…</span>
      <kbd className="ml-1 hidden rounded border border-white/10 bg-white/5 px-1 py-0.5 text-[10px] font-bold text-white/40 sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
