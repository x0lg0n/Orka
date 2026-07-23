"use client";
import { useTransition } from "react";
import { FileText, Eye, CheckCircle2, Banknote } from "lucide-react";
import { ActionButton } from "@/app/(app)/w/[slug]/projects/[id]/components/ActionButton";
import type { WorkflowRole, WorkflowState } from "@/lib/workflow";

type MilestoneRow = {
  id: string;
  title: string;
  status: string;
};

const STEPS = [
  { icon: FileText, title: "Submitted", description: "Contractor submits deliverables" },
  { icon: Eye, title: "Review", description: "Client reviews the work" },
  { icon: CheckCircle2, title: "Approved", description: "Milestone is approved" },
  { icon: Banknote, title: "Released", description: "Payment sent to contractor" },
];

function completedSteps(status: string): number {
  switch (status) {
    case "released": return 4;
    case "approved": return 3;
    case "in_review": return 2;
    case "funded": return 1;
    case "draft": return 0;
    default: return 0;
  }
}

export function MilestonePaymentFlow({
  milestones,
  state,
  role,
  contractAddress,
  onApprove,
  onReject,
  onRelease,
}: {
  milestones: MilestoneRow[];
  state: WorkflowState;
  role: WorkflowRole;
  contractAddress: string;
  onApprove: (milestoneId: string) => Promise<void>;
  onReject: (milestoneId: string) => Promise<void>;
  onRelease: (milestoneId: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  const active =
    milestones.find((m) => m.status === "in_review") ??
    milestones.find((m) => m.status === "approved") ??
    null;

  const stepsCompleted = active ? completedSteps(active.status) : 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#7c3aed] opacity-0 transition group-hover:opacity-100" />
      <h3 className="text-sm font-semibold text-gray-900">Payment Flow</h3>
      <p className="mt-0.5 text-xs text-gray-500">
        {active ? `"${active.title}" status: ${active.status}` : "No active milestone"}
      </p>

      <div className="mt-4 flex items-start gap-0">
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1;
          const done = i < stepsCompleted;
          const current = i === stepsCompleted;
          return (
            <div key={step.title} className="flex flex-1 items-start">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    done
                      ? "bg-[#7c3aed] text-white shadow-sm"
                      : current
                        ? "border-2 border-[#7c3aed] bg-white text-[#7c3aed]"
                        : "bg-gray-50 text-gray-300"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <p className={`mt-2 text-xs font-medium ${done || current ? "text-gray-900" : "text-gray-400"}`}>
                  {step.title}
                </p>
                <p className="mt-0.5 max-w-[120px] text-[10px] leading-tight text-gray-400">
                  {step.description}
                </p>
              </div>
              {!isLast && (
                <div className="mx-1 mt-5 flex-1">
                  <div className={`h-0.5 w-full ${done ? "bg-[#7c3aed]" : "bg-gray-100"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {active && contractAddress && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <span className="mr-1 text-xs font-medium text-gray-700">{active.title}</span>
          {active.status === "in_review" && (
            <>
              <ActionButton
                action="approve_milestone"
                role={role}
                state={state}
                label="Approve"
                pending={pending}
                onClick={() => startTransition(() => onApprove(active.id))}
              />
              <ActionButton
                action="reject_milestone"
                role={role}
                state={state}
                label="Reject"
                pending={pending}
                onClick={() => startTransition(() => onReject(active.id))}
              />
            </>
          )}
          {active.status === "approved" && (
            <ActionButton
              action="release_milestone"
              role={role}
              state={state}
              label="Release (multi-sig)"
              pending={pending}
              onClick={() => startTransition(() => onRelease(active.id))}
            />
          )}
          {pending && <span className="text-xs text-gray-400">Pending confirmation…</span>}
        </div>
      )}
    </div>
  );
}
