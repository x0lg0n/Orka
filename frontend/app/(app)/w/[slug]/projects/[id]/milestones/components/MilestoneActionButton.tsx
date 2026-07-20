// frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/MilestoneActionButton.tsx
"use client";
import { useTransition } from "react";
import { ActionButton } from "@/app/(app)/w/[slug]/projects/[id]/components/ActionButton";
import type { WorkflowAction, WorkflowRole, WorkflowState } from "@/lib/workflow";

export function MilestoneActionButton({
  action,
  role,
  state,
  label,
  milestoneId,
  onAction,
}: {
  action: WorkflowAction;
  role: WorkflowRole;
  state: WorkflowState;
  label: string;
  milestoneId: string;
  onAction: (milestoneId: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <ActionButton
      action={action}
      role={role}
      state={state}
      label={label}
      pending={pending}
      onClick={() => startTransition(() => onAction(milestoneId))}
    />
  );
}
