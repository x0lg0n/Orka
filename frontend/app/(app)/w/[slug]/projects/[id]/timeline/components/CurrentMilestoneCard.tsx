import { Calendar, DollarSign, ExternalLink } from "lucide-react";

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

export function CurrentMilestoneCard({
  milestone,
  asset,
}: {
  milestone: MilestoneRow;
  asset: string;
}) {
  return (
    <div className="rounded-xl border-2 border-[#7c3aed]/20 bg-[#7c3aed]/5 p-4 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-[#7c3aed]/10 px-2 py-0.5 text-xs font-medium text-[#7c3aed]">
              Current Milestone
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
              In Progress
            </span>
          </div>
          <h3 className="mt-1.5 text-sm font-semibold text-gray-900">
            {milestone.title ?? `Milestone ${milestone.position ?? ""}`}
          </h3>
          {milestone.description && (
            <p className="mt-0.5 text-sm text-gray-500">
              {milestone.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {milestone.due_date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Due {formatDate(milestone.due_date)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" />
              {Number(milestone.amount).toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}{" "}
              {milestone.asset || asset}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#7c3aed]/20 bg-white px-3 py-2 text-sm font-medium text-[#7c3aed] transition hover:bg-[#7c3aed]/5"
        >
          View Details
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
