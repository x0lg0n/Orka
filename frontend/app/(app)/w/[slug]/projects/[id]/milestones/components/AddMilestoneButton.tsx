"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddMilestoneWizard } from "./AddMilestoneWizard";

export function AddMilestoneButton({
  onComplete,
}: {
  onComplete: (data: {
    name: string;
    description: string;
    dueDate: string;
    amount: string;
    asset: string;
  }) => void | Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
      >
        <Plus className="h-4 w-4" />
        New Milestone
      </button>
      <AddMilestoneWizard
        open={open}
        onClose={() => setOpen(false)}
        onComplete={onComplete}
      />
    </>
  );
}
