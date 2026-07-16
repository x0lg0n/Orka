"use client";

import { FileText, FileSearch, BarChart3, Receipt, Globe } from "lucide-react";
import { quickActions } from "./mockData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "file-text": FileText,
  "file-search": FileSearch,
  "bar-chart": BarChart3,
  receipt: Receipt,
  globe: Globe,
};

export default function QuickActions() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        What would you like to do today?
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {quickActions.map((action) => {
          const Icon = iconMap[action.icon];
          return (
            <button
              key={action.title}
              className="group flex flex-col items-start rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-[#7c3aed]/30 hover:bg-[#7c3aed]/5 hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c3aed]/10 transition-transform group-hover:scale-110">
                {Icon && <Icon className="h-5 w-5 text-[#7c3aed]" />}
              </div>
              <h4 className="text-sm font-semibold text-gray-900">
                {action.title}
              </h4>
              <p className="mt-1 text-xs text-gray-500">{action.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
