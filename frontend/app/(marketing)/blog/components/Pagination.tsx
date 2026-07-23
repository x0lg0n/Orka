"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function getPages(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="grid size-9 place-items-center rounded-xl border border-night/10 text-night/40 transition-colors hover:bg-night/5 hover:text-night disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((page, i) =>
        page === "..." ? (
          <span
            key={`dots-${i}`}
            className="grid size-9 place-items-center text-[13px] font-bold text-night/30"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`grid size-9 place-items-center rounded-xl text-[13px] font-bold transition-all duration-200 ${
              currentPage === page
                ? "bg-violet text-white shadow-[0_2px_8px_rgba(148,116,255,0.3)]"
                : "border border-night/10 text-night/50 hover:bg-night/5 hover:text-night"
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="grid size-9 place-items-center rounded-xl border border-night/10 text-night/40 transition-colors hover:bg-night/5 hover:text-night disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
