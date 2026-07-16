"use client";

import { CreditCard, Eye, Send, FileText } from "lucide-react";
import type { HistoryEvent } from "./mockData";

interface InvoiceHistoryProps {
  history: HistoryEvent[];
}

const iconMap = {
  payment: CreditCard,
  viewed: Eye,
  sent: Send,
  created: FileText,
  reminder: Send,
};

const iconColors = {
  payment: "text-emerald-500 bg-emerald-50",
  viewed: "text-blue-500 bg-blue-50",
  sent: "text-violet-500 bg-violet-50",
  created: "text-gray-500 bg-gray-50",
  reminder: "text-amber-500 bg-amber-50",
};

export default function InvoiceHistory({ history }: InvoiceHistoryProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h4 className="mb-4 text-sm font-semibold text-gray-900">Invoice History</h4>
      <div className="space-y-4">
        {history.map((event) => {
          const Icon = iconMap[event.icon];
          const colorClass = iconColors[event.icon];
          return (
            <div key={event.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.action}</p>
                  <p className="text-xs text-gray-500">{event.timestamp}</p>
                </div>
              </div>
              {event.badge && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                  {event.badge}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
