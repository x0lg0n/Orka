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

function statusDot(status: string) {
  const map: Record<string, string> = {
    released: "bg-emerald-500",
    approved: "bg-blue-500",
    funded: "bg-[#7c3aed]",
    in_review: "bg-amber-500",
    draft: "bg-gray-400",
  };
  return map[status] ?? "bg-gray-400";
}

export function UpcomingMilestonesCard({
  milestones,
}: {
  milestones: MilestoneRow[];
  slug: string;
  projectId: string;
}) {
  const upcoming = milestones
    .filter((m) => m.status !== "released")
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 4);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Upcoming</h3>
      </div>

      <div className="p-4">
        {upcoming.length === 0 ? (
          <div className="py-4 text-center text-xs text-gray-400">
            All milestones completed
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((m) => {
              const dueDate = m.due_date ? new Date(m.due_date) : null;
              const now = new Date();
              const diffDays = dueDate
                ? Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
                : null;

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5 transition hover:border-gray-200"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-2 w-2 rounded-full ${statusDot(m.status)}`} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {m.title ?? `Milestone ${m.position ?? ""}`}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
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
                      {diffDays === 0 ? "Today" : diffDays === 1 ? "1 day" : `${diffDays}d`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
