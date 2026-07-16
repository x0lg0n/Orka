"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-white/[0.04]"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#1e293b]">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
              width={36}
              height={36}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/70">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-white/50">{user.email}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-full rounded-xl border border-white/10 bg-[#0c1a2e] py-1 shadow-xl">
          <button className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/[0.06] hover:text-white">
            Profile
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/[0.06] hover:text-white">
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
