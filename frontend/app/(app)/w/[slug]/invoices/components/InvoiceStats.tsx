"use client";

import { FileText, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const stats = [
  {
    title: "Total Invoiced",
    value: "2,450 XLM",
    change: "↑ 18.7%",
    changeText: "vs last month",
    changeType: "positive" as const,
    icon: FileText,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "Paid",
    value: "1,720 XLM",
    change: "↑ 22.4%",
    changeText: "vs last month",
    changeType: "positive" as const,
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Outstanding",
    value: "680 XLM",
    change: "↓ 6.3%",
    changeText: "vs last month",
    changeType: "negative" as const,
    icon: Clock,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    title: "Overdue",
    value: "120 XLM",
    change: "↑ 3.2%",
    changeText: "vs last month",
    changeType: "negative" as const,
    icon: AlertTriangle,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

export default function InvoiceStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                {stat.title}
              </span>
              <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-xs text-gray-400">{stat.changeText}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
