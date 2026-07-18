import { CheckCircle2, Circle } from "lucide-react";

type Milestone = {
  id: string;
  title: string | null;
  amount: number | null;
  status: string;
  chain_index: number | null;
};

const TIMELINE_STEPS = [
  { key: "proposal_sent", label: "Proposal Sent", desc: "Sent by you" },
  { key: "proposal_accepted", label: "Proposal Accepted", desc: "Accepted by client" },
  { key: "contract_signed", label: "Contract Signed", desc: "Both parties signed" },
  { key: "escrow_funded", label: "Escrow Funded", desc: "450 XLM locked" },
];

function milestoneStatus(m: Milestone) {
  if (m.status === "approved" || m.status === "released") return "completed";
  if (m.status === "funded" || m.status === "in_review") return "active";
  return "pending";
}

function stepIcon(status: string) {
  if (status === "completed")
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "active")
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-amber-400 bg-amber-50 text-[10px] font-bold text-amber-600">
        {5}
      </div>
    );
  return <Circle className="h-5 w-5 text-gray-300" />;
}

function statusBadge(status: string) {
  if (status === "completed")
    return "bg-emerald-50 text-emerald-600 border border-emerald-200";
  if (status === "active")
    return "bg-amber-50 text-amber-600 border border-amber-200";
  return "bg-gray-100 text-gray-500 border border-gray-200";
}

export function ProjectTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Project Timeline</h2>
      <p className="mt-1 text-sm text-gray-500">
        Track the progress of your project from start to finish.
      </p>

      <div className="mt-5 flex flex-col">
        {/* Static timeline steps */}
        {TIMELINE_STEPS.map((step, i) => (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              {stepIcon("completed")}
              {i < TIMELINE_STEPS.length - 1 && (
                <div className="my-1 h-6 w-0.5 bg-emerald-200" />
              )}
            </div>
            <div className="pb-4">
              <p className="text-sm font-semibold text-gray-900">{step.label}</p>
              <p className="text-xs text-gray-400">
                Jul {15 + i}, 2025 · {step.desc}
              </p>
            </div>
            <div className="ml-auto">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge("completed")}`}
              >
                Completed
              </span>
            </div>
          </div>
        ))}

        {/* Dynamic milestone steps */}
        {milestones.map((m, i) => {
          const status = milestoneStatus(m);
          const stepNum = TIMELINE_STEPS.length + i + 1;
          return (
            <div key={m.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                {stepIcon(status)}
                {i < milestones.length - 1 && (
                  <div
                    className={`my-1 h-6 w-0.5 ${
                      status === "completed" ? "bg-emerald-200" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm font-semibold text-gray-900">
                  {m.title ?? `Milestone ${stepNum}`}
                </p>
                {status === "active" && (
                  <p className="mt-0.5 text-xs text-amber-500">
                    Waiting for client approval
                  </p>
                )}
              </div>
              <div className="ml-auto flex items-start gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusBadge(status)}`}
                >
                  {status === "completed"
                    ? "Completed"
                    : status === "active"
                      ? "In Progress"
                      : "Pending"}
                </span>
                {status === "active" && (
                  <span className="text-gray-300">›</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-2 flex items-center gap-1.5 text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]"
      >
        View full activity →
      </button>
    </div>
  );
}
