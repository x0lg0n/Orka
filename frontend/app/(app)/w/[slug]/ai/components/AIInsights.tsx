"use client";

import { TrendingUp, Clock, DollarSign, Star } from "lucide-react";
import { insights } from "./mockData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "trending-up": TrendingUp,
  clock: Clock,
  "dollar-sign": DollarSign,
  star: Star,
};

export default function AIInsights() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">AI Insights</h3>
        <span className="rounded-full bg-[#7c3aed]/10 px-2 py-0.5 text-[10px] font-semibold text-[#7c3aed]">
          New
        </span>
      </div>
      <div className="space-y-3">
        {insights.map((insight) => {
          const Icon = iconMap[insight.icon];
          return (
            <div
              key={insight.title}
              className="group cursor-pointer rounded-xl border border-gray-100 p-4 transition-all hover:border-[#7c3aed]/20 hover:shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${insight.bgColor}`}
                >
                  {Icon && <Icon className={`h-4 w-4 ${insight.color}`} />}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    {insight.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {insight.description}
                  </p>
                  <button className="mt-2 text-xs font-medium text-[#7c3aed] hover:text-[#6d28d9]">
                    {insight.action} →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
