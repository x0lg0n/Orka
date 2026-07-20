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

  const rows = [
    {
      label: "Revenue in Escrow",
      value: summary.revenue,
      trend: summary.revenueTrend,
      trendUp: summary.revenueUp,
    },
    {
      label: "Completed Projects",
      value: String(summary.completedProjects),
      trend: summary.completedTrend,
      trendUp: summary.completedUp,
    },
    {
      label: "Total Clients",
      value: String(summary.totalClients),
      trend: summary.clientsTrend,
      trendUp: summary.clientsUp,
    },
  ];

  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
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

      <div className="flex flex-col divide-y divide-[#eef1f6]">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span className="text-sm font-medium text-[#5f6b86]">
              {row.label}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#11182d]">
                {row.value}
              </span>
              {row.trend ? (
                <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  {row.trend}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
