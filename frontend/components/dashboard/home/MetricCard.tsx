"use client";

import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-[#5f6b86]">{title}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[#11182d]">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-[#5f6b86]">{subtitle}</p>
    </div>
  );
}
