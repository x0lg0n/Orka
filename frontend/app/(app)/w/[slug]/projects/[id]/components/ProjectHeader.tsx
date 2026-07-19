import Link from "next/link";
import { Star, Share2, MoreHorizontal, Plus, ChevronRight, Globe } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    completed: "bg-blue-50 text-blue-600 border border-blue-200",
    draft: "bg-gray-100 text-gray-600 border border-gray-200",
    archived: "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return map[status] ?? map.draft;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    active: "In Progress",
    completed: "Completed",
    draft: "Draft",
    archived: "Archived",
  };
  return map[status] ?? status;
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
      <div className="flex flex-col gap-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link
            href={`/w/${slug}/projects`}
            className="transition hover:text-gray-700"
          >
            Projects
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-gray-700">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(status)}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {statusLabel(status)}
          </span>
        </div>

        {/* Client info + dates + ID */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Client Name
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Dates
          </span>
          <span className="flex items-center gap-1">
            ID: {projectId.slice(0, 8)}...
            <button type="button" className="text-gray-400 hover:text-gray-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            </button>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Client Portal */}
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Globe className="h-4 w-4" />
          Client Portal
        </button>

        <button
          type="button"
          className="text-gray-300 transition hover:text-amber-400"
          aria-label="Favorite"
        >
          <Star className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        <div className="flex overflow-hidden rounded-lg border border-[#7c3aed]">
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 bg-[#7c3aed] px-3 text-sm font-medium text-white hover:bg-[#6d28d9]"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
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
