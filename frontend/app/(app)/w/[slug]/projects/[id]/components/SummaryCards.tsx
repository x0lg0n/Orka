import {
  Building2,
  TrendingUp,
  Lock,
  Wallet,
  Calendar,
} from "lucide-react";

function SummaryCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  progress,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  progress?: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <p className="mt-3 text-xl font-bold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      {progress != null && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
          <div
            className="h-1.5 rounded-full bg-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function SummaryCards({
  clientName,
  progressPct,
  lockedAmount,
  totalBudget,
}: {
  clientName: string;
  progressPct: number;
  lockedAmount: number;
  totalBudget: number;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
      <SummaryCard
        icon={Building2}
        iconBg="bg-indigo-50"
        iconColor="text-indigo-500"
        label="Client"
        value={clientName}
        sub="acme.com"
      />
      <SummaryCard
        icon={TrendingUp}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        label="Progress"
        value={`${progressPct}%`}
        progress={progressPct}
      />
      <SummaryCard
        icon={Lock}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        label="Escrow Locked"
        value={`${lockedAmount} XLM`}
        sub={`≈ $${(lockedAmount * 0.5125).toFixed(2)} USD`}
      />
      <SummaryCard
        icon={Wallet}
        iconBg="bg-violet-50"
        iconColor="text-violet-500"
        label="Total Budget"
        value={`${totalBudget} XLM`}
        sub={`≈ $${(totalBudget * 0.5125).toFixed(2)} USD`}
      />
      <SummaryCard
        icon={Calendar}
        iconBg="bg-orange-50"
        iconColor="text-orange-500"
        label="Timeline"
        value="Jul 15 – Aug 30"
        sub="46 days left"
      />
    </div>
  );
}
