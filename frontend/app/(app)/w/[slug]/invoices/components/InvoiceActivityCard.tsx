"use client";

import { CheckCircle2, Clock, Send, AlertTriangle } from "lucide-react";
import { mockActivity } from "./listMockData";

const iconMap = {
  payment: CheckCircle2,
  partial: Clock,
  sent: Send,
  overdue: AlertTriangle,
};

const iconColors = {
  payment: "text-emerald-500 bg-emerald-50",
  partial: "text-amber-500 bg-amber-50",
  sent: "text-blue-500 bg-blue-50",
  overdue: "text-rose-500 bg-rose-50",
};

export default function InvoiceActivityCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {mockActivity.map((item) => {
          const Icon = iconMap[item.icon];
          const colorClass = iconColors[item.icon];
          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <span className="flex-shrink-0 text-xs text-gray-400">
                {item.timestamp}
              </span>
            </div>
          );
        })}
      </div>
      <button className="mt-4 text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]">
        View all activity →
      </button>
    </div>
  );
}
