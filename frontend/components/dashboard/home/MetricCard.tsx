"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  FolderKanban,
  ShieldCheck,
} from "lucide-react";
import type { MetricKey, MetricData } from "@/types/dashboard";

type Tone = "cyan" | "violet" | "teal" | "orange" | "lime" | "coral";

const metricIcon: Record<MetricKey, typeof FolderKanban> = {
  projects: FolderKanban,
  escrow: CircleDollarSign,
  approvals: ShieldCheck,
  payments: CheckCircle2,
};

const metricTone: Record<MetricKey, Tone> = {
  projects: "violet",
  escrow: "teal",
  approvals: "orange",
  payments: "lime",
};

const toneClasses: Record<Tone, string> = {
  cyan: "border-cyan-200/30 bg-cyan-300/15 text-cyan-100",
  violet: "border-violet/30 bg-violet/15 text-violet",
  teal: "border-teal/30 bg-teal/15 text-teal",
  orange: "border-orange/30 bg-orange/15 text-orange",
  lime: "border-lime/30 bg-lime/15 text-lime",
  coral: "border-coral/30 bg-coral/15 text-coral",
};

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconBg: string;
  metricKey?: MetricKey;
  href?: string;
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
  metricKey = "projects",
  href,
  trend,
  trendUp,
}: MetricCardProps) {
  const Icon = metricIcon[metricKey];
  const tone = metricTone[metricKey];

  const inner = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-[#5f6b86]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {trend ? (
            <span
              className={`text-xs font-semibold ${
                trendUp ? "text-teal" : "text-[#5f6b86]"
              }`}
            >
              {trend}
            </span>
          ) : null}
          {href ? (
            <ArrowUpRight className="h-4 w-4 text-[#9aa3b8]" aria-hidden />
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[#11182d]">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-[#5f6b86]">{subtitle}</p>
    </div>
    </>
  );

  if (!href) {
    return (
      <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-[#e5e8f0] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#c9d2e8] hover:shadow-md"
    >
      {inner}
    </Link>
  );
}
