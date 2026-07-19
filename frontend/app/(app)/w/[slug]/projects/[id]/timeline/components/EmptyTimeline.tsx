import { Clock } from "lucide-react";

export function EmptyTimeline() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <Clock className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        No timeline events yet
      </h3>
      <p className="mt-1 max-w-xs text-sm text-gray-400">
        Project activity will appear here as work progresses.
      </p>
    </div>
  );
}
