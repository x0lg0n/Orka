"use client";

import {
  Download,
  Copy,
  FileText,
  ArrowRightLeft,
  Ban,
} from "lucide-react";

const actions = [
  {
    label: "Download PDF",
    icon: Download,
    color: "text-gray-600",
    hover: "hover:bg-gray-50",
  },
  {
    label: "Duplicate Proposal",
    icon: Copy,
    color: "text-gray-600",
    hover: "hover:bg-gray-50",
  },
  {
    label: "Create Invoice",
    icon: FileText,
    color: "text-gray-600",
    hover: "hover:bg-gray-50",
  },
  {
    label: "Convert to Contract",
    icon: ArrowRightLeft,
    color: "text-gray-600",
    hover: "hover:bg-gray-50",
  },
  {
    label: "Withdraw Proposal",
    icon: Ban,
    color: "text-red-500",
    hover: "hover:bg-red-50",
  },
];

export function ProposalActionsCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Proposal Actions
      </h3>
      <div className="space-y-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${action.color} ${action.hover}`}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
