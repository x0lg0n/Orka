import { Activity } from "lucide-react";

export function ActivityEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <Activity className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        No activity yet
      </h3>
      <p className="mt-1 max-w-xs text-sm text-gray-400">
        Project updates will appear here.
      </p>
      <button
        type="button"
        className="mt-4 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6d28d9]"
      >
        Create First Activity
      </button>
    </div>
  );
}
