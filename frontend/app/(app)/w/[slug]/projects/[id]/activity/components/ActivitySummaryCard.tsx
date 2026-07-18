import Link from "next/link";
import {
  Activity,
  Flag,
  DollarSign,
  Upload,
  MessageSquare,
  FileSignature,
} from "lucide-react";
import type { SummaryStats } from "./types";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-2.5">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function ActivitySummaryCard({
  stats,
  slug,
  projectId,
}: {
  stats: SummaryStats;
  slug: string;
  projectId: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Activity Summary</h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/overview`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View Analytics
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatCard
          icon={Activity}
          label="Activities"
          value={stats.totalActivities}
          color="bg-[#7c3aed]/10 text-[#7c3aed]"
        />
        <StatCard
          icon={Flag}
          label="Milestones"
          value={stats.totalMilestones}
          color="bg-emerald-50 text-emerald-500"
        />
        <StatCard
          icon={DollarSign}
          label="Payments"
          value={stats.totalPayments}
          color="bg-[#7c3aed]/10 text-[#7c3aed]"
        />
        <StatCard
          icon={Upload}
          label="Files"
          value={stats.totalFiles}
          color="bg-cyan-50 text-cyan-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Comments"
          value={stats.totalComments}
          color="bg-gray-100 text-gray-500"
        />
        <StatCard
          icon={FileSignature}
          label="Contracts"
          value={stats.totalContracts}
          color="bg-indigo-50 text-indigo-500"
        />
      </div>
    </div>
  );
}
