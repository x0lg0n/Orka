import Link from "next/link";
import { Calendar, DollarSign } from "lucide-react";

function statusBadge(status: string) {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-600";
    case "funded":
      return "bg-emerald-50 text-emerald-600";
    case "in_review":
      return "bg-blue-50 text-blue-600";
    case "released":
      return "bg-emerald-50 text-emerald-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Upcoming";
    case "funded":
      return "Funded";
    case "in_review":
      return "In Review";
    case "released":
      return "Completed";
    default:
      return status;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UpcomingMilestonesCard({
  slug,
  projectId,
  milestones,
  asset,
}: {
  slug: string;
  projectId: string;
  milestones: Array<{
    id: string;
    title: string;
    amount: number;
    asset: string;
    status: string;
    due_date: string | null;
  }>;
  asset: string;
}) {
  const upcoming = milestones
    .filter((m) => m.status === "draft" || m.status === "funded")
    .slice(0, 3);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Upcoming Milestones
        </h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/milestones`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="mt-4 text-center text-sm text-gray-400">
          No upcoming milestones
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {upcoming.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {m.title}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {Number(m.amount).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    {m.asset || asset}
                  </span>
                  {m.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(m.due_date)}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(m.status)}`}
              >
                {statusLabel(m.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
