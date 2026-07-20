import { GripVertical } from "lucide-react";

type MilestoneRow = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  asset: string;
  status: string;
  position: number | null;
  due_date: string | null;
};

const COLUMNS = [
  { key: "draft", label: "Pending", color: "bg-amber-400" },
  { key: "funded", label: "In Progress", color: "bg-blue-500" },
  { key: "in_review", label: "Review", color: "bg-[#7c3aed]" },
  { key: "released", label: "Completed", color: "bg-emerald-500" },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function BoardCard({ milestone }: { milestone: MilestoneRow }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-900">
          {milestone.title ?? `Milestone ${milestone.position ?? ""}`}
        </p>
        <GripVertical className="h-4 w-4 text-gray-300" />
      </div>
      {milestone.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-400">
          {milestone.description}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-medium text-gray-700">
          {Number(milestone.amount).toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}{" "}
          {milestone.asset}
        </span>
        {milestone.due_date && (
          <span className="text-gray-400">{formatDate(milestone.due_date)}</span>
        )}
      </div>
    </div>
  );
}

export function BoardView({
  milestones,
}: {
  milestones: MilestoneRow[];
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const items = milestones.filter((m) => m.status === col.key);
        return (
          <div key={col.key} className="flex flex-col">
            <div className="flex items-center gap-2 px-1 pb-2">
              <div className={`h-2 w-2 rounded-full ${col.color}`} />
              <span className="text-sm font-medium text-gray-700">
                {col.label}
              </span>
              <span className="text-xs text-gray-400">({items.length})</span>
            </div>
            <div className="flex flex-1 flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-2">
              {items.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No milestones
                </div>
              ) : (
                items.map((m) => <BoardCard key={m.id} milestone={m} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
