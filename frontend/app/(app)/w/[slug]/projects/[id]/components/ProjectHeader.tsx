import Link from "next/link";
import { Star, Share2, MoreHorizontal, Plus } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-blue-50 text-blue-600 border border-blue-200",
    completed: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    draft: "bg-gray-100 text-gray-600 border border-gray-200",
    archived: "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return map[status] ?? map.draft;
}

export function ProjectHeader({
  slug,
  projectId,
  title,
  status,
}: {
  slug: string;
  projectId: string;
  title: string;
  status: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(status)}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <button
          type="button"
          className="text-gray-300 transition hover:text-amber-400"
          aria-label="Favorite"
        >
          <Star className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <div className="flex overflow-hidden rounded-lg border border-[#7c3aed]">
          <Link
            href={`/w/${slug}/projects/${projectId}/new`}
            className="flex h-9 items-center gap-1.5 bg-[#7c3aed] px-3 text-sm font-medium text-white hover:bg-[#6d28d9]"
          >
            <Plus className="h-4 w-4" />
            New
          </Link>
          <button
            type="button"
            className="flex h-9 w-8 items-center justify-center border-l border-[#6d28d9] bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
