"use client";

import { TrendingUp, Clock, Lock, Star } from "lucide-react";
import { insights } from "./mockData";

const iconMap = {
  trending: TrendingUp,
  clock: Clock,
  lock: Lock,
  star: Star,
};

export default function InsightsSection() {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Key Insights</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight) => {
          const Icon = iconMap[insight.icon as keyof typeof iconMap];
          return (
            <div
              key={insight.title}
              className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2 ${insight.bgColor}`}>
                <Icon className={`h-4 w-4 ${insight.color}`} />
              </div>
              <h4 className="text-sm font-semibold text-gray-900">
                {insight.title}
              </h4>
              <p className="mt-1 text-xs text-gray-500">{insight.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
