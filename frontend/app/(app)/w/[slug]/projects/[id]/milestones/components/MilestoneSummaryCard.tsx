import { User, Wallet, CheckCircle, Lock, Clock } from "lucide-react";

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

export function MilestoneSummaryCard({
  stats,
  owner,
}: {
  stats: MilestoneStats;
  owner: OwnerRow;
}) {
  const items = [
    { label: "Total Budget", value: `${Number(stats.totalBudget).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`, icon: Wallet, color: "bg-gray-100 text-gray-600" },
    { label: "Paid", value: `${Number(stats.releasedAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`, icon: CheckCircle, color: "bg-emerald-50 text-emerald-600" },
    { label: "Locked", value: `${Number(stats.fundedAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`, icon: Lock, color: "bg-[#7c3aed]/10 text-[#7c3aed]" },
    { label: "Pending", value: `${Number(stats.pendingAmount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset}`, icon: Clock, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#7c3aed] opacity-0 transition group-hover:opacity-100" />
      <h3 className="text-sm font-semibold text-gray-900">Summary</h3>

      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 rounded-lg bg-gray-50/50 px-3 py-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.color}`}>
              <item.icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-1 items-center justify-between">
              <span className="text-xs text-gray-500">{item.label}</span>
              <span className="text-xs font-semibold text-gray-900">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2">
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
  );
}
