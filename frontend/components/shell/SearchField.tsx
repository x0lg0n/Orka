"use client";
import { Search } from "lucide-react";

export function SearchField({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block w-full max-w-[410px]">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/40" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-14"
      />
    </label>
  );
}
