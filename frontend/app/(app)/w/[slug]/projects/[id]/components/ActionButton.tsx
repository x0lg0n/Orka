// frontend/app/(app)/w/[slug]/projects/[id]/components/ActionButton.tsx
"use client";
import { nextActionsForRole, type WorkflowAction, type WorkflowRole, type WorkflowState } from "@/lib/workflow";

export function ActionButton({
  action, role, state, label, onClick, disabled, pending,
}: {
  action: WorkflowAction; role: WorkflowRole; state: WorkflowState;
  label: string; onClick?: () => void; disabled?: boolean; pending?: boolean;
}) {
  if (!nextActionsForRole(state, role).includes(action)) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
    >
      {pending ? "Pending…" : label}
    </button>
  );
}
