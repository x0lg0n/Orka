"use client";

import { useState } from "react";
import { ChevronDown, TrendingUp } from "lucide-react";
import type { QuickSummaryData } from "@/types/dashboard";

interface QuickSummaryProps {
  summary: QuickSummaryData;
}

export function QuickSummary({ summary }: QuickSummaryProps) {
  const [period, setPeriod] = useState(summary.period);
  const [isOpen, setIsOpen] = useState(false);

  const periods = ["This Week", "This Month", "This Quarter", "This Year"];

  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#11182d]">Quick Summary</h2>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 rounded-lg border border-[#e5e8f0] px-2.5 py-1 text-xs font-medium text-[#5f6b86] transition-colors duration-150 hover:bg-[#f7f8fc]"
          >
            {period}
            <ChevronDown className="h-3 w-3" />
          </button>
          {isOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-[#e5e8f0] bg-white py-1 shadow-lg">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-[#5f6b86] transition-colors duration-150 hover:bg-[#f7f8fc] hover:text-[#11182d]"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5f6b86]">In Escrow</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#11182d]">
              {summary.revenue}
            </span>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
              <TrendingUp className="h-3 w-3" />
              {summary.revenueTrend}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5f6b86]">Completed Projects</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#11182d]">
              {summary.completedProjects}
            </span>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
              <TrendingUp className="h-3 w-3" />
              {summary.completedTrend}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[#5f6b86]">Total Clients</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#11182d]">
              {summary.totalClients}
            </span>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
              <TrendingUp className="h-3 w-3" />
              {summary.clientsTrend}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
