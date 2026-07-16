"use client";

import { FileText, FileSearch, BarChart3, Receipt } from "lucide-react";
import { recentConversations } from "./mockData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "file-text": FileText,
  "file-search": FileSearch,
  "bar-chart": BarChart3,
  receipt: Receipt,
};

export default function RecentConversations() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Recent Conversations
        </h3>
        <button className="text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]">
          View all
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {recentConversations.map((conv) => {
          const Icon = iconMap[conv.icon];
          return (
            <div
              key={conv.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-[#7c3aed]/5"
            >
              <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#7c3aed]/10">
                {Icon && <Icon className="h-4 w-4 text-[#7c3aed]" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{conv.title}</p>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {conv.subtitle}
                </p>
              </div>
              <span className="flex-shrink-0 text-xs text-gray-400">
                {conv.timestamp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
