import { Calendar, DollarSign } from "lucide-react";

type MilestoneRow = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  asset: string;
  status: string;
  position: number | null;
  due_date: string | null;
  created_at: string;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function UpcomingMilestoneCard({
  milestone,
  asset,
  isLast,
}: {
  milestone: MilestoneRow;
  asset: string;
  isLast: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-100 p-3 transition ${
        isLast ? "" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
            Upcoming
          </span>
          <h3 className="mt-1.5 text-sm font-semibold text-gray-700">
            {milestone.title ?? `Milestone ${milestone.position ?? ""}`}
          </h3>
          {milestone.description && (
            <p className="mt-0.5 text-xs text-gray-400">
              {milestone.description}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {milestone.due_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due {formatDate(milestone.due_date)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {Number(milestone.amount).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}{" "}
              {milestone.asset || asset}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
