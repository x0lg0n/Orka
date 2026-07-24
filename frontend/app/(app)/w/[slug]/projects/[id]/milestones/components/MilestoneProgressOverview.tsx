import { TrendingUp } from "lucide-react";

type MilestoneStats = {
  progressPct: number;
  totalBudget: number;
  releasedAmount: number;
  fundedAmount: number;
  pendingAmount: number;
  milestoneAsset: string;
  totalMilestones: number;
  releasedCount: number;
  fundedCount: number;
  draftCount: number;
  approvedCount: number;
};

function SegmentedProgressBar({
  total,
  completed,
  inProgress,
  pending,
}: {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}) {
  if (total === 0) {
    return <div className="h-2 w-full rounded-full bg-gray-100" />;
  }

  const completedPct = (completed / total) * 100;
  const inProgressPct = (inProgress / total) * 100;
  const pendingPct = (pending / total) * 100;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className="flex h-full">
        <div
          className="h-full rounded-l-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-700"
          style={{ width: `${completedPct}%` }}
        />
        <div
          className="h-full bg-blue-500 transition-all duration-700"
          style={{ width: `${inProgressPct}%` }}
        />
        <div
          className={`h-full bg-amber-400 transition-all duration-700 ${
            pendingPct > 0 && completedPct + inProgressPct === 0 ? "rounded-r-full" : ""
          }`}
          style={{ width: `${pendingPct}%` }}
        />
      </div>
    </div>
  );
}

function StatBadge({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      <span className="font-medium text-gray-700">{count}</span>
      <span>{label}</span>
    </div>
  );
}

function StatRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-50 py-1.5 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-semibold ${accent ?? "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

export function MilestoneProgressOverview({
  stats,
}: {
  stats: MilestoneStats;
}) {
  const completeCount = stats.releasedCount + stats.approvedCount;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#7c3aed]" />
          <h3 className="text-sm font-semibold text-gray-900">
            Progress
          </h3>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#7c3aed]/10 px-2.5 py-0.5 text-xs font-semibold text-[#7c3aed]">
          {stats.progressPct}%
        </div>
      </div>

      <div className="px-5 pb-5">
        {/* Segmented bar */}
        <div className="mt-4">
          <SegmentedProgressBar
            total={stats.totalMilestones}
            completed={completeCount}
            inProgress={stats.fundedCount}
            pending={stats.draftCount}
          />
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <StatBadge label="completed" count={completeCount} color="bg-[#7c3aed]" />
            <StatBadge label="in progress" count={stats.fundedCount} color="bg-blue-500" />
            <StatBadge label="pending" count={stats.draftCount} color="bg-amber-400" />
          </div>
        </div>

        {/* Quick stats grid */}
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg bg-gray-50/80 px-3 py-2">
            <p className="text-xs text-gray-500">Total</p>
            <p className="mt-0.5 text-base font-bold text-gray-900">
              {stats.totalMilestones}
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50/80 px-3 py-2">
            <p className="text-xs text-emerald-600">Completed</p>
            <p className="mt-0.5 text-base font-bold text-emerald-700">
              {completeCount}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50/80 px-3 py-2">
            <p className="text-xs text-blue-600">In Progress</p>
            <p className="mt-0.5 text-base font-bold text-blue-700">
              {stats.fundedCount}
            </p>
          </div>
          <div className="rounded-lg bg-amber-50/80 px-3 py-2">
            <p className="text-xs text-amber-600">Pending</p>
            <p className="mt-0.5 text-base font-bold text-amber-700">
              {stats.draftCount}
            </p>
          </div>
        </div>

        {/* Budget breakdown */}
        <div className="mt-4 rounded-lg border border-gray-100 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-gray-400">Budget</p>
          <div className="space-y-0.5">
            <StatRow
              label="Total"
              value={`${Number(stats.totalBudget).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`}
            />
            <StatRow
              label="Released"
              value={`${Number(stats.releasedAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`}
              accent="text-emerald-600"
            />
            <StatRow
              label="Locked"
              value={`${Number(stats.fundedAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`}
              accent="text-[#7c3aed]"
            />
            <StatRow
              label="Pending"
              value={`${Number(stats.pendingAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`}
              accent="text-amber-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
