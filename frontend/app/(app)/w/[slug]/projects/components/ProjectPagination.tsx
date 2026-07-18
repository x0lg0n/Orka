import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export function ProjectPagination({
  page,
  setPage,
  totalPages,
  filteredCount,
  startIdx,
  endIdx,
}: {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  filteredCount: number;
  startIdx: number;
  endIdx: number;
}) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Showing {filteredCount > 0 ? startIdx : 0} to {endIdx} of {filteredCount}{" "}
        projects
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setPage(n)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
              n === page
                ? "border border-[#7c3aed] bg-[#7c3aed] text-white"
                : "border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
