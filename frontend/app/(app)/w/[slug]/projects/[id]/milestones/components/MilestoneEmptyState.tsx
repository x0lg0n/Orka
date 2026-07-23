import { Flag, Plus } from "lucide-react";

export function MilestoneEmptyState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed]/10 to-[#a78bfa]/10">
        <Flag className="h-8 w-8 text-[#7c3aed]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No milestones yet
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Create your first milestone to start tracking deliverables and automate escrow payments.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9] hover:shadow-md"
      >
        <Plus className="h-4 w-4" />
        Create Milestone
      </button>
    </div>
  );
}
