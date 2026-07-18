import Link from "next/link";
import { Bell, Plus } from "lucide-react";

export function ProjectsHeader({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all your projects in one place.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>
        <Link
          href={`/w/${slug}/projects/new`}
          className="flex h-9 items-center gap-2 rounded-lg bg-[#7c3aed] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#6d28d9]"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>
    </div>
  );
}
