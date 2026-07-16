"use client";

import { TrendingUp, Lock, Clock, AlertTriangle } from "lucide-react";
import { mockInsights } from "./mockData";

const iconMap = {
  trending: TrendingUp,
  escrow: Lock,
  time: Clock,
  alert: AlertTriangle,
};

const iconColors = {
  trending: "text-emerald-500 bg-emerald-50",
  escrow: "text-violet-500 bg-violet-50",
  time: "text-blue-500 bg-blue-50",
  alert: "text-rose-500 bg-rose-50",
};

const changeColors = {
  positive: "text-emerald-600",
  negative: "text-rose-600",
  neutral: "text-gray-500",
};

export default function PaymentInsights() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {mockInsights.map((insight) => {
        const Icon = iconMap[insight.icon];
        return (
          <div
            key={insight.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                {insight.title}
              </span>
              <div className={`rounded-lg p-2 ${iconColors[insight.icon]}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {insight.value}
            </p>
            <p className={`mt-1 text-xs ${changeColors[insight.changeType]}`}>
              {insight.change}
            </p>
          </div>
        );
      })}
    </div>
  );
}
