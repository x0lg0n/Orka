"use client";

import { Bell, MessageSquare, ChevronDown } from "lucide-react";

export function PortalTopBar({
  clientName,
}: {
  clientName: string | null;
}) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back, {clientName?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-gray-500">
          Here's what's happening with your projects.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
          <MessageSquare className="h-5 w-5" />
        </button>
        <button className="relative rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#6C4DFF]" />
        </button>
        <div className="flex cursor-pointer items-center gap-2 rounded-lg p-1.5 transition hover:bg-gray-100">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6C4DFF] text-[10px] font-bold text-white">
            {clientName?.charAt(0) ?? "C"}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
