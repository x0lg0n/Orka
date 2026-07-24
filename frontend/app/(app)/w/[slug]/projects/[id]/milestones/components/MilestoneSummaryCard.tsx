import { Wallet, CheckCircle, Lock, Clock, User } from "lucide-react";

type OwnerRow = { full_name: string | null; avatar_url: string | null } | null;

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

function LineItem({
  label,
  value,
  icon: Icon,
  color,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accent?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-gray-50/50 px-3 py-2">
      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <span className={`text-xs font-semibold ${accent ?? "text-gray-900"}`}>{value}</span>
      </div>
    </div>
  );
}

export function MilestoneSummaryCard({
  stats,
  owner,
}: {
  stats: MilestoneStats;
  owner: OwnerRow;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
      </div>

      <div className="space-y-2 p-4">
        <LineItem
          label="Total Budget"
          value={`${Number(stats.totalBudget).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`}
          icon={Wallet}
          color="bg-gray-100 text-gray-600"
        />
        <LineItem
          label="Released"
          value={`${Number(stats.releasedAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`}
          icon={CheckCircle}
          color="bg-emerald-50 text-emerald-600"
          accent="text-emerald-600"
        />
        <LineItem
          label="Locked"
          value={`${Number(stats.fundedAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`}
          icon={Lock}
          color="bg-[#7c3aed]/10 text-[#7c3aed]"
          accent="text-[#7c3aed]"
        />
        <LineItem
          label="Pending"
          value={`${Number(stats.pendingAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`}
          icon={Clock}
          color="bg-amber-50 text-amber-600"
          accent="text-amber-600"
        />

        <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
            <User className="h-3.5 w-3.5 text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Owner</p>
            <p className="text-xs font-medium text-gray-900">
              {owner?.full_name ?? "Unassigned"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
