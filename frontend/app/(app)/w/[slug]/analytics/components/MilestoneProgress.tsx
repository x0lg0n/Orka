"use client";

import { milestoneData } from "./mockData";

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return "bg-emerald-500";
  if (percentage >= 60) return "bg-blue-500";
  if (percentage >= 40) return "bg-amber-500";
  return "bg-rose-500";
}

export default function MilestoneProgress() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Milestone Completion Rate
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">76%</span>
          <span className="text-sm font-medium text-emerald-600">↑ 9%</span>
          <span className="text-xs text-gray-400">vs Apr 1 – Apr 30</span>
        </div>
      </div>
      <div className="space-y-4">
        {milestoneData.map((milestone) => (
          <div key={milestone.name}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {milestone.name}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {milestone.completed} / {milestone.total}
                </span>
                <span className="text-xs font-semibold text-gray-700">
                  {milestone.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(milestone.percentage)}`}
                style={{ width: `${milestone.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <button className="text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]">
          View all milestones →
        </button>
      </div>
    </div>
  );
}
