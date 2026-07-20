import Link from "next/link";
import { Calendar } from "lucide-react";

type MilestoneRow = {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
  position: number | null;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function UpcomingMilestonesCard({
  milestones,
  slug,
  projectId,
}: {
  milestones: MilestoneRow[];
  slug: string;
  projectId: string;
}) {
  const upcoming = milestones
    .filter((m) => m.status === "draft" || m.status === "funded")
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 4);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Upcoming Milestones
        </h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/milestones`}
          className="text-xs font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="mt-4 py-4 text-center text-sm text-gray-400">
          No upcoming milestones
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {upcoming.map((m) => {
            const dueDate = m.due_date ? new Date(m.due_date) : null;
            const now = new Date();
            const diffDays = dueDate
              ? Math.max(
                  0,
                  Math.ceil(
                    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                  )
                )
              : null;

            return (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7c3aed]/10">
                    <Calendar className="h-3.5 w-3.5 text-[#7c3aed]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {m.title ?? `Milestone ${m.position ?? ""}`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {m.due_date ? formatDate(m.due_date) : "No date"}
                    </p>
                  </div>
                </div>
                {diffDays !== null && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      diffDays <= 3
                        ? "bg-amber-50 text-amber-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {diffDays === 0
                      ? "Today"
                      : diffDays === 1
                        ? "1 day"
                        : `${diffDays} days`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
