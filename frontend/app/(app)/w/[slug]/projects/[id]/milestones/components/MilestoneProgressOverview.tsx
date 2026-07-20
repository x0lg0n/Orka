import {
  Flag,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

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

function CircularProgress({ pct }: { pct: number }) {
  const radius = 54;
  const stroke = 8;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative flex h-[120px] w-[120px] items-center justify-center">
      <svg height={radius * 2} width={radius * 2} className="-rotate-90">
        <circle
          stroke="#f3f4f6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="url(#purpleGradient)"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 1s ease-in-out",
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{pct}%</span>
        <span className="text-[10px] text-gray-400">Overall Progress</span>
      </div>
    </div>
  );
}

function SegmentedProgress({
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
    return (
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100" />
    );
  }

  const completedPct = (completed / total) * 100;
  const inProgressPct = (inProgress / total) * 100;

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
      <div className="flex h-full">
        <div
          className="h-full bg-[#7c3aed] transition-all duration-700"
          style={{ width: `${completedPct}%` }}
        />
        <div
          className="h-full bg-blue-500 transition-all duration-700"
          style={{ width: `${inProgressPct}%` }}
        />
        <div
          className="h-full bg-amber-400 transition-all duration-700"
          style={{ width: `${pending}%` }}
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

export function MilestoneProgressOverview({
  stats,
}: {
  stats: MilestoneStats;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Milestone Progress
        </h3>
      </div>

      <div className="mt-3">
        <SegmentedProgress
          total={stats.totalMilestones}
          completed={stats.releasedCount + stats.approvedCount}
          inProgress={stats.fundedCount}
          pending={stats.draftCount}
        />
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
            Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Pending
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <KpiCard
          label="Total"
          value={stats.totalMilestones}
          icon={Flag}
          color="bg-gray-100 text-gray-600"
        />
        <KpiCard
          label="Completed"
          value={stats.releasedCount + stats.approvedCount}
          icon={CheckCircle2}
          color="bg-emerald-50 text-emerald-600"
        />
        <KpiCard
          label="In Progress"
          value={stats.fundedCount}
          icon={Clock}
          color="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Pending"
          value={stats.draftCount}
          icon={AlertCircle}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="mt-4 flex justify-center">
        <CircularProgress pct={stats.progressPct} />
      </div>
    </div>
  );
}
