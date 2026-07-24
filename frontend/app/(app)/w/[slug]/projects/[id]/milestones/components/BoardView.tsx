import { Calendar } from "lucide-react";
import type { WorkflowRole, WorkflowState } from "@/lib/workflow";
import { MilestoneActionButton } from "./MilestoneActionButton";

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
  { key: "draft", label: "Draft", color: "bg-gray-400" },
  { key: "funded", label: "In Progress", color: "bg-[#7c3aed]" },
  { key: "in_review", label: "Review", color: "bg-amber-500" },
  { key: "approved", label: "Approved", color: "bg-blue-500" },
  { key: "released", label: "Released", color: "bg-emerald-500" },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function BoardCard({
  milestone,
  state,
  role,
  onSubmit,
}: {
  milestone: MilestoneRow;
  state: WorkflowState;
  role: WorkflowRole;
  onSubmit: (milestoneId: string) => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md hover:border-gray-200">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-900">
          {milestone.title ?? `Milestone ${milestone.position ?? ""}`}
        </p>
      </div>
      {milestone.description && (
        <p className="mt-1 line-clamp-2 text-xs text-gray-400">
          {milestone.description}
        </p>
      )}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-800">
          {Number(milestone.amount).toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}{" "}
          {milestone.asset}
        </span>
        {milestone.due_date && (
          <span className="flex items-center gap-1 text-gray-400">
            <Calendar className="h-3 w-3" />
            {formatDate(milestone.due_date)}
          </span>
        )}
      </div>
      {(milestone.status === "draft" || milestone.status === "funded") && (
        <div className="mt-3">
          <MilestoneActionButton
            action="submit_milestone"
            role={role}
            state={state}
            label="Submit for review"
            milestoneId={milestone.id}
            onAction={onSubmit}
          />
        </div>
      )}
    </div>
  );
}

export function BoardView({
  milestones,
  state,
  role,
  onSubmitMilestone,
}: {
  milestones: MilestoneRow[];
  state: WorkflowState;
  role: WorkflowRole;
  onSubmitMilestone: (milestoneId: string) => Promise<void>;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[700px] grid-cols-5 gap-3">
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
                  <div className="py-6 text-center text-xs text-gray-400">
                    Empty
                  </div>
                ) : (
                  items.map((m) => (
                    <BoardCard
                      key={m.id}
                      milestone={m}
                      state={state}
                      role={role}
                      onSubmit={onSubmitMilestone}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
