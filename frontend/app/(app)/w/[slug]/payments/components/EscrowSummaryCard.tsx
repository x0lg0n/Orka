"use client";

import { mockEscrowBreakdown } from "./mockData";

const breakdown = [
  {
    label: "Total Held",
    value: mockEscrowBreakdown.totalHeld,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    label: "Pending Release",
    value: mockEscrowBreakdown.totalPending,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Released",
    value: mockEscrowBreakdown.totalReleased,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Failed",
    value: mockEscrowBreakdown.totalFailed,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

export default function EscrowSummaryCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Escrow Summary
      </h3>
      <div className="space-y-3">
        {breakdown.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className={`text-sm font-semibold ${item.color}`}>
              {item.value} XLM
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
