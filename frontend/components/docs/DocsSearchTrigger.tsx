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
      className={`flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/50 transition-colors hover:bg-white/15 ${className}`}
    >
      <Search size={16} className="shrink-0" />
      <span className="hidden sm:inline">Search documentation…</span>
      <kbd className="ml-2 hidden rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[11px] font-bold text-white/40 sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
