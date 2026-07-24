"use client";

import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export type SortValue = "latest" | "oldest" | "popular" | "reading-time";

const options: { value: SortValue; label: string }[] = [
  { value: "latest", label: "Latest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "popular", label: "Most Popular" },
  { value: "reading-time", label: "Reading Time" },
];

interface SortDropdownProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-night/10 bg-white px-4 py-2 text-sm font-bold text-night/60 transition-colors hover:border-violet/30 hover:text-night focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50"
        aria-label="Sort articles"
        aria-expanded={open}
      >
        {current?.label}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-night/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`block w-full px-4 py-2.5 text-left text-sm font-bold transition-colors ${
                value === opt.value
                  ? "bg-violet/10 text-violet"
                  : "text-night/60 hover:bg-night/5 hover:text-night"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
