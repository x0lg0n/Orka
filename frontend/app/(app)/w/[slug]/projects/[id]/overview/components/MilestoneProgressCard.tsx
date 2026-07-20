import Link from "next/link";

function StatusRow({
  label,
  count,
  pct,
  color,
}: {
  label: string;
  count: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-sm text-gray-600">
          {label} ({count})
        </span>
      </div>
      <span className="text-sm font-medium text-gray-700">{pct}%</span>
    </div>
  );
}

export function MilestoneProgressCard({
  slug,
  projectId,
  completedCount,
  inProgressCount,
  upcomingCount,
  pendingCount,
  totalCount,
  progressPct,
}: {
  slug: string;
  projectId: string;
  completedCount: number;
  inProgressCount: number;
  upcomingCount: number;
  pendingCount: number;
  totalCount: number;
  progressPct: number;
}) {
  const pct = (n: number) =>
    totalCount > 0 ? Math.round((n / totalCount) * 100) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Milestone Progress
        </h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/milestones`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="mt-2 flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        {completedCount > 0 && (
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${pct(completedCount)}%` }}
          />
        )}
        {inProgressCount > 0 && (
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${pct(inProgressCount)}%` }}
          />
        )}
        {upcomingCount > 0 && (
          <div
            className="bg-gray-300 transition-all duration-500"
            style={{ width: `${pct(upcomingCount)}%` }}
          />
        )}
        {pendingCount > 0 && (
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${pct(pendingCount)}%` }}
          />
        )}
      </div>

      <div className="mt-1 text-right text-xs text-gray-400">
        {progressPct}%
      </div>

      <div className="mt-1 flex flex-col gap-1.5">
        <StatusRow
          label="Completed"
          count={completedCount}
          pct={pct(completedCount)}
          color="bg-emerald-500"
        />
        <StatusRow
          label="In Progress"
          count={inProgressCount}
          pct={pct(inProgressCount)}
          color="bg-blue-500"
        />
        <StatusRow
          label="Upcoming"
          count={upcomingCount}
          pct={pct(upcomingCount)}
          color="bg-gray-300"
        />
        <StatusRow
          label="Pending"
          count={pendingCount}
          pct={pct(pendingCount)}
          color="bg-amber-400"
        />
      </div>
    </div>
  );
}
