"use client";

import { Lock, ArrowDownToLine, CheckCircle, RefreshCw } from "lucide-react";
import { mockRecentActivity } from "./mockData";

const iconMap = {
  escrow: Lock,
  release: ArrowDownToLine,
  milestone: CheckCircle,
  refund: RefreshCw,
};

const iconColors = {
  escrow: "text-violet-500 bg-violet-50",
  release: "text-emerald-500 bg-emerald-50",
  milestone: "text-blue-500 bg-blue-50",
  refund: "text-rose-500 bg-rose-50",
};

export default function RecentActivityCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {mockRecentActivity.map((activity) => {
          const Icon = iconMap[activity.icon];
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div
                className={`rounded-lg p-2 ${iconColors[activity.icon]}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.action}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {activity.description}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
