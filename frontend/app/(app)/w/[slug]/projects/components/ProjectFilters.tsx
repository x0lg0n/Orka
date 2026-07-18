import { Search, ChevronDown, SlidersHorizontal } from "lucide-react";

export function ProjectFilters({
  search,
  setSearch,
  setPage,
}: {
  search: string;
  setSearch: (s: string) => void;
  setPage: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by project name or client..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-9 w-56 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </div>
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
      >
        All Clients
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
      >
        All Status
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
      >
        Sort: Newest
        <ChevronDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>
    </div>
  );
}
