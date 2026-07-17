import { Upload, FileText } from "lucide-react";

type Milestone = {
  id: string;
  title: string | null;
  amount: number | null;
  status: string;
  chain_index: number | null;
};

function statusBadge(status: string) {
  if (status === "approved" || status === "released")
    return "bg-emerald-50 text-emerald-600 border border-emerald-200";
  if (status === "funded" || status === "in_review")
    return "bg-amber-50 text-amber-600 border border-amber-200";
  return "bg-gray-100 text-gray-500 border border-gray-200";
}

export function CurrentStep({ milestones }: { milestones: Milestone[] }) {
  const active =
    milestones.find((m) => m.status === "funded" || m.status === "in_review") ??
    milestones[0];

  if (!active) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Current Step</h2>
        <p className="mt-4 text-sm text-gray-400">
          No active milestones yet.
        </p>
      </div>
    );
  }

  const amount = Number(active.amount) || 0;
  const allCount = milestones.length;
  const completedCount = milestones.filter(
    (m) => m.status === "approved" || m.status === "released",
  ).length;
  const pct = allCount > 0 ? Math.round((completedCount / allCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Current Step Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Current Step</h2>

        <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
              <span className="text-lg">📋</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {active.title ?? "Untitled Milestone"}
              </p>
              <p className="text-sm text-gray-500">
                Milestone {(active.chain_index ?? 0) + 1}: Homepage Design
              </p>
              <p className="text-xs text-gray-400">
                Waiting for client approval
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400">
                Milestone Amount
              </p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">
                {amount} XLM
              </p>
              <p className="text-xs text-gray-400">
                ≈ ${(amount * 0.5125).toFixed(2)} USD
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Due Date</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">
                July 25, 2025
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-medium text-gray-400">Description</p>
              <p className="mt-0.5 text-sm text-gray-600">
                Design and initial development of homepage layout and responsive
                breakpoints.
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Deliverables</p>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    homepage_design_v1.fig
                  </p>
                  <p className="text-[10px] text-gray-400">2.4 MB</p>
                </div>
                <span className="ml-auto text-gray-300">›</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Status</p>
              <p className="mt-1 text-sm font-medium text-amber-600">
                Waiting for Approval
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg bg-[#7c3aed] px-4 text-sm font-medium text-white hover:bg-[#6d28d9]"
            >
              Request Approval
            </button>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <Upload className="h-4 w-4" />
              Upload Update
            </button>
          </div>
        </div>
      </div>

      {/* Milestone Progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Milestone Progress
          </h2>
          <span className="text-sm font-medium text-gray-500">{pct}%</span>
        </div>
        <p className="mt-0.5 text-sm text-gray-400">
          {completedCount} of {allCount} milestones completed
        </p>

        <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-emerald-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {milestones.map((m, i) => {
            const status =
              m.status === "approved" || m.status === "released"
                ? "completed"
                : m.status === "funded" || m.status === "in_review"
                  ? "active"
                  : "pending";
            return (
              <div key={m.id} className="flex items-center gap-3">
                <span
                  className={`h-2 w-2 rounded-full ${
                    status === "completed"
                      ? "bg-emerald-500"
                      : status === "active"
                        ? "bg-amber-400"
                        : "bg-gray-300"
                  }`}
                />
                <span className="flex-1 text-sm text-gray-700">
                  Milestone {i + 1}: {m.title ?? "Untitled"}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(m.status)}`}
                >
                  {status === "completed"
                    ? "Completed"
                    : status === "active"
                      ? "In Progress"
                      : "Pending"}
                </span>
                {status === "completed" && (
                  <span className="text-emerald-500">✓</span>
                )}
                {status === "active" && (
                  <span className="text-amber-400">○</span>
                )}
                {status === "pending" && (
                  <span className="text-gray-300">○</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
