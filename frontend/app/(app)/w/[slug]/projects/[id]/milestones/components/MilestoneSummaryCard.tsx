import { User } from "lucide-react";

type OwnerRow = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

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
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">
        Milestone Summary
      </h3>

      <div className="mt-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Total Amount</span>
          <span className="font-semibold text-gray-900">
            {Number(stats.totalBudget).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            {stats.milestoneAsset}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Paid</span>
          <span className="font-medium text-emerald-600">
            {Number(stats.releasedAmount).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            {stats.milestoneAsset}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Locked in Escrow</span>
          <span className="font-medium text-[#7c3aed]">
            {Number(stats.fundedAmount).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            {stats.milestoneAsset}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Pending</span>
          <span className="font-medium text-amber-600">
            {Number(stats.pendingAmount).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            {stats.milestoneAsset}
          </span>
        </div>
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">Owner</span>
          <span className="ml-auto font-medium text-gray-900">
            {owner?.full_name ?? "Unassigned"}
          </span>
        </div>
      </div>
    </div>
  );
}
