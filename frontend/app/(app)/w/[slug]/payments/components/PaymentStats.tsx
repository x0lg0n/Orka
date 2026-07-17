"use client";

import {
  Wallet,
  Lock,
  Clock,
  ArrowDownToLine,
  Receipt,
} from "lucide-react";
import type { PaymentStats } from "./mockData";

const stats = [
  {
    label: "Total Received",
    value: "2,450 XLM",
    icon: Wallet,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    label: "Escrow in Hold",
    value: "980 XLM",
    icon: Lock,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    label: "Pending Release",
    value: "350 XLM",
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    label: "Total Released",
    value: "1,120 XLM",
    icon: ArrowDownToLine,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    label: "Total Fees Paid",
    value: "32.50 XLM",
    icon: Receipt,
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
];

export default function PaymentStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">
                {stat.label}
              </span>
              <div className={`rounded-lg p-2 ${stat.bg}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
