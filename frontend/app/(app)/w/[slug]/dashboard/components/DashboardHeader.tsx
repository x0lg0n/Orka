"use client";

import { Search, Bell, Plus } from "lucide-react";
import type { DashboardUser } from "@/types/dashboard";

interface DashboardHeaderProps {
  user: DashboardUser;
  workspace?: string;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">
          {getGreeting()}, {user.firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-[#5f6b86]">
          Here&apos;s what&apos;s happening with your workspace today.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b95aa]" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-10 w-64 rounded-lg border border-[#e5e8f0] bg-white pl-10 pr-4 text-sm text-[#11182d] outline-none transition-colors duration-200 placeholder:text-[#8b95aa] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30"
            aria-label="Search"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[#e5e8f0] bg-[#f7f8fc] px-1.5 py-0.5 text-[10px] font-medium text-[#8b95aa]">
            /
          </span>
        </div>

        <button
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#e5e8f0] bg-white text-[#5f6b86] transition-colors duration-200 hover:bg-[#f7f8fc]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7c3aed] text-[9px] font-bold text-white">
            3
          </span>
        </button>

        <button className="flex h-10 items-center gap-2 rounded-lg bg-[#7c3aed] px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6d28d9] hover:shadow-md active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Project</span>
        </button>
      </div>
    </div>
  );
}
