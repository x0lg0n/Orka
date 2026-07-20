import {
  TrendingUp,
  Wallet,
  Lock,
  ArrowUpCircle,
  Clock,
} from "lucide-react";

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  badge,
  badgeColor,
  progress,
  progressColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  badgeColor?: string;
  progress?: number;
  progressColor?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xl font-bold text-gray-900">{value}</span>
        {badge && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </div>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      {progress != null && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${progressColor ?? "bg-[#7c3aed]"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ProjectStatsRow({
  stats,
  asset,
}: {
  stats: {
    progressPct: number;
    totalMilestones: number;
    releasedCount: number;
    totalBudget: number;
    fundedAmount: number;
    releasedAmount: number;
    pendingAmount: number;
  };
  asset: string;
}) {
  const xlmToUsd = 1.4687;
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const usd = (n: number) => `≈ $${(n * xlmToUsd).toFixed(2)} USD`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        icon={TrendingUp}
        iconBg="bg-purple-50"
        iconColor="text-[#7c3aed]"
        label="Project Progress"
        value={`${stats.progressPct}%`}
        badge="On Track"
        badgeColor="bg-emerald-50 text-emerald-600"
        progress={stats.progressPct}
        sub={`${stats.releasedCount} of ${stats.totalMilestones} milestones completed`}
      />
      <StatCard
        icon={Wallet}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        label="Total Budget"
        value={`${fmt(stats.totalBudget)} ${asset}`}
        sub={usd(stats.totalBudget)}
      />
      <StatCard
        icon={Lock}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        label="Escrow Funded"
        value={`${fmt(stats.fundedAmount + stats.releasedAmount)} ${asset}`}
        sub={`✓ ${stats.fundedAmount + stats.releasedAmount > 0 ? "100" : "0"}% Funded`}
      />
      <StatCard
        icon={ArrowUpCircle}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
        label="Amount Released"
        value={`${fmt(stats.releasedAmount)} ${asset}`}
        sub={usd(stats.releasedAmount)}
      />
      <StatCard
        icon={Clock}
        iconBg="bg-orange-50"
        iconColor="text-orange-500"
        label="Pending Amount"
        value={`${fmt(stats.pendingAmount)} ${asset}`}
        sub={usd(stats.pendingAmount)}
      />
    </div>
  );
}
