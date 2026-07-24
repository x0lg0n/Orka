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
  { icon: FileText, label: "Submit" },
  { icon: Eye, label: "Review" },
  { icon: CheckCircle2, label: "Approve" },
  { icon: Banknote, label: "Release" },
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
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-3.5">
        <h3 className="text-sm font-semibold text-gray-900">Payment Flow</h3>
      </div>

      <div className="px-5 pb-5">
        {active ? (
          <>
            <p className="mt-3 text-xs text-gray-500">
              Active: <span className="font-medium text-gray-700">{active.title}</span>
            </p>

            {/* Compact stepper */}
            <div className="mt-4 flex items-center gap-0">
              {STEPS.map((step, i) => {
                const isLast = i === STEPS.length - 1;
                const done = i < stepsCompleted;
                const current = i === stepsCompleted;
                return (
                  <div key={step.label} className="flex flex-1 items-center">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all ${
                          done
                            ? "bg-[#7c3aed] text-white"
                            : current
                              ? "border-2 border-[#7c3aed] bg-white text-[#7c3aed]"
                              : "bg-gray-100 text-gray-300"
                        }`}
                      >
                        <step.icon className="h-3.5 w-3.5" />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          done ? "text-gray-900" : current ? "text-[#7c3aed]" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className="mx-2 h-px flex-1 bg-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            {contractAddress && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
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
                {pending && <span className="text-xs text-gray-400">Pending confirmation...</span>}
              </div>
            )}
          </>
        ) : (
          <div className="mt-3 flex items-center justify-center rounded-lg border border-dashed border-gray-200 py-6">
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-1">
                {STEPS.map((step, i) => (
                  <div key={step.label} className="flex items-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                      <step.icon className="h-3 w-3 text-gray-300" />
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="mx-1 h-px w-6 bg-gray-200" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">Submit a milestone to start the payment flow</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
