"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Filter, ChevronDown, Calendar } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "milestone", label: "Milestones" },
  { value: "payment", label: "Payments" },
  { value: "file", label: "Files" },
  { value: "contract", label: "Contracts" },
  { value: "proposal", label: "Proposals" },
  { value: "note", label: "Notes" },
  { value: "comment", label: "Comments" },
  { value: "escrow", label: "Escrow" },
  { value: "ai", label: "AI" },
  { value: "client", label: "Client" },
  { value: "system", label: "System" },
];

const DATE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "month", label: "Last Month" },
];

export function ActivityFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const categoryLabel =
    CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? "All";
  const dateLabel =
    DATE_OPTIONS.find((o) => o.value === dateRange)?.label ?? "All Time";

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search activities..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
        />
      </div>

      <div ref={categoryRef} className="relative">
        <button
          type="button"
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          {categoryLabel}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
          />
        </button>
        {categoryOpen && (
          <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onCategoryChange(option.value);
                  setCategoryOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                  category === option.value
                    ? "font-medium text-[#7c3aed] bg-[#7c3aed]/5"
                    : "text-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={dateRef} className="relative">
        <button
          type="button"
          onClick={() => setDateOpen(!dateOpen)}
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Calendar className="h-4 w-4" />
          {dateLabel}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${dateOpen ? "rotate-180" : ""}`}
          />
        </button>
        {dateOpen && (
          <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {DATE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onDateRangeChange(option.value);
                  setDateOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                  dateRange === option.value
                    ? "font-medium text-[#7c3aed] bg-[#7c3aed]/5"
                    : "text-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}