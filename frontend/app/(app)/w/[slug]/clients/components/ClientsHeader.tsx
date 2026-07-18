import Link from "next/link";
import { Search, Plus, SlidersHorizontal } from "lucide-react";

export function ClientsHeader({
  slug,
  search,
  setSearch,
}: {
  slug: string;
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your clients and view all their projects in one place.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-56 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
            /
          </span>
        </div>
        <Link
          href={`/w/${slug}/clients/new`}
          className="flex h-9 items-center gap-2 rounded-lg bg-[#7c3aed] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#6d28d9]"
        >
          <Plus className="h-4 w-4" />
          New Client
        </Link>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
