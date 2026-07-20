"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Filter } from "lucide-react";

const FILTER_OPTIONS = [
  { value: "all", label: "All Events" },
  { value: "milestone", label: "Milestones" },
  { value: "payment", label: "Payments" },
  { value: "contract", label: "Contracts" },
  { value: "escrow", label: "Escrow" },
  { value: "file", label: "Files" },
  { value: "activity", label: "Client Activity" },
  { value: "system", label: "System Events" },
];

export function TimelineFilters({
  filter,
  onFilterChange,
}: {
  filter: string;
  onFilterChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentLabel =
    FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "All Events";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      >
        <Filter className="h-4 w-4" />
        {currentLabel}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onFilterChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                filter === option.value
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
  );
}
