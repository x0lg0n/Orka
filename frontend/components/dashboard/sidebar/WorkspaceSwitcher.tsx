"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Workspace {
  name: string;
  role: string;
  logo?: string;
}

interface WorkspaceSwitcherProps {
  workspace: Workspace;
}

export function WorkspaceSwitcher({ workspace }: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initial = workspace.name.charAt(0).toUpperCase();

  return (
    <div className="relative mx-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-left transition-colors duration-150 hover:bg-white/[0.07]"
        aria-label="Switch workspace"
        aria-expanded={isOpen}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7c3aed] text-sm font-bold text-white">
          {workspace.logo ? (
            <img
              src={workspace.logo}
              alt=""
              className="h-9 w-9 rounded-lg object-cover"
              width={36}
              height={36}
            />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {workspace.name}
          </p>
          <p className="text-xs text-white/50">{workspace.role}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-white/10 bg-[#0c1a2e] py-1 shadow-xl">
          <button className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/[0.06] hover:text-white">
            {workspace.name}
          </button>
          <button className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/[0.06] hover:text-white">
            Switch workspace
          </button>
        </div>
      )}
    </div>
  );
}
