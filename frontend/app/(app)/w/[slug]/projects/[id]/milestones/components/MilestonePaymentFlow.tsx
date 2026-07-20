// frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/MilestonePaymentFlow.tsx
"use client";
import { useTransition } from "react";
import { FileText, Eye, CheckCircle2, Banknote } from "lucide-react";
import {
  ActionButton,
} from "@/app/(app)/w/[slug]/projects/[id]/components/ActionButton";
import type { WorkflowRole, WorkflowState } from "@/lib/workflow";

type MilestoneRow = {
  id: string;
  title: string;
  status: string;
};

const STEPS = [
  { icon: FileText, title: "Work Submitted", description: "Contractor submits deliverables for review" },
  { icon: Eye, title: "Client Review", description: "Client reviews and provides feedback" },
  { icon: CheckCircle2, title: "Milestone Approved", description: "Client approves the completed work" },
  { icon: Banknote, title: "Payment Released", description: "Escrow funds are released to contractor" },
];

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

  // The single active milestone drives the action panel: the first milestone in
  // `in_review` (awaiting client decision) or `approved` (awaiting release).
  const active =
    milestones.find((m) => m.status === "in_review") ??
    milestones.find((m) => m.status === "approved") ??
    null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Milestone Payment Flow</h3>
      <p className="mt-0.5 text-xs text-gray-500">How milestone payments work</p>

      <div className="mt-4 flex items-start gap-0">
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1;
          const isCompleted = i < 2;
          return (
            <div key={step.title} className="flex flex-1 items-start">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isCompleted ? "bg-[#7c3aed] text-white" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-900">{step.title}</p>
                <p className="mt-0.5 max-w-[120px] text-[10px] text-gray-400">{step.description}</p>
              </div>
              {!isLast && (
                <div className="mx-1 mt-5 flex-1">
                  <div className={`h-0.5 w-full ${isCompleted ? "bg-[#7c3aed]" : "bg-gray-200"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {active && contractAddress && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
          <span className="text-xs font-medium text-gray-700">{active.title}</span>
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
