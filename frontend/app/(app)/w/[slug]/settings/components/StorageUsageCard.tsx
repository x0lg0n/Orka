"use client";

import { HelpCircle } from "lucide-react";

export default function StorageUsageCard() {
  const used = 2.4;
  const total = 10;
  const percentage = (used / total) * 100;

  const items = [
    { label: "Projects", value: "1.6 GB", color: "bg-[#7c3aed]" },
    { label: "Files", value: "650 MB", color: "bg-blue-500" },
    { label: "Invoices", value: "150 MB", color: "bg-cyan-400" },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-900">Storage Usage</h4>
          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
        </div>
        <span className="text-xs text-gray-500">
          {used} GB of {total} GB used
        </span>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-blue-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="mt-4 space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
            <span className="text-xs font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>

      <button className="mt-4 flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
        Manage Storage
      </button>
    </div>
  );
}
