import { Pencil } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function priorityColor(priority: string) {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-amber-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
}

export function ProjectOverviewCard({
  description,
  owner,
  metadata,
  createdAt,
  updatedAt,
}: {
  description: string | null;
  owner: { full_name: string | null; avatar_url: string | null } | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}) {
  const meta = metadata as {
    category?: string;
    priority?: string;
    currency?: string;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Project Overview</h3>
      {description && (
        <p className="mt-1.5 text-sm text-gray-500 line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Project Owner</span>
          <div className="flex items-center gap-2">
            {owner?.avatar_url ? (
              <img
                src={owner.avatar_url}
                alt=""
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[8px] font-bold text-gray-600">
                {owner?.full_name?.charAt(0) ?? "?"}
              </div>
            )}
            <span className="text-xs font-medium text-gray-700">
              {owner?.full_name ?? "Unassigned"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Project Type</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#7c3aed]" />
            <span className="text-xs font-medium text-gray-700">
              {meta.category ?? "Fixed Price"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Priority</span>
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${priorityColor(meta.priority ?? "normal")}`}
            />
            <span className="text-xs font-medium text-gray-700 capitalize">
              {meta.priority ?? "Normal"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Currency</span>
          <span className="text-xs font-medium text-gray-700">
            {meta.currency ?? "XLM"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Created On</span>
          <span className="text-xs font-medium text-gray-700">
            {formatDate(createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Last Updated</span>
          <span className="text-xs font-medium text-gray-700">
            {formatDate(updatedAt)}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit Project Details
      </button>
    </div>
  );
}
