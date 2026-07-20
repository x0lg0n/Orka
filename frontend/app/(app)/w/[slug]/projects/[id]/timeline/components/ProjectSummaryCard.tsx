import { User, Users } from "lucide-react";

type ProjectRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type OwnerRow = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

type TimelineStats = {
  progressPct: number;
  totalBudget: number;
  releasedAmount: number;
  fundedAmount: number;
  pendingAmount: number;
  milestoneAsset: string;
  totalMilestones: number;
  releasedCount: number;
  fundedCount: number;
  pendingCount: number;
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-600",
    completed: "bg-blue-50 text-blue-600",
    draft: "bg-gray-100 text-gray-600",
    archived: "bg-gray-100 text-gray-500",
  };
  return map[status] ?? map.draft;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    active: "In Progress",
    completed: "Completed",
    draft: "Draft",
    archived: "Archived",
  };
  return map[status] ?? status;
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className="h-full rounded-full bg-[#7c3aed] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ProjectSummaryCard({
  project,
  owner,
  memberCount,
  stats,
}: {
  project: ProjectRow;
  owner: OwnerRow;
  memberCount: number;
  stats: TimelineStats;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Project Summary</h3>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Status</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(project.status)}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {statusLabel(project.status)}
          </span>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Progress</span>
            <span className="font-medium text-gray-900">
              {stats.progressPct}%
            </span>
          </div>
          <div className="mt-2">
            <ProgressBar pct={stats.progressPct} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-2">
          <p className="text-xs font-medium text-gray-500">Budget</p>
          <div className="mt-1.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Total</span>
              <span className="font-medium text-gray-900">
                {Number(stats.totalBudget).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}{" "}
                {stats.milestoneAsset}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Escrow Funded</span>
              <span className="font-medium text-emerald-600">
                {Number(stats.fundedAmount).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}{" "}
                {stats.milestoneAsset}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Released</span>
              <span className="font-medium text-blue-600">
                {Number(stats.releasedAmount).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}{" "}
                {stats.milestoneAsset}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Pending</span>
              <span className="font-medium text-gray-400">
                {Number(stats.pendingAmount).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}{" "}
                {stats.milestoneAsset}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Project Owner</span>
            <span className="ml-auto font-medium text-gray-900">
              {owner?.full_name ?? "Unassigned"}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">Team Members</span>
            <span className="ml-auto font-medium text-gray-900">
              {memberCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
