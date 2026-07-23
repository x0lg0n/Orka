"use client";

import { Search, X } from "lucide-react";

export default function BlogSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-night/30"
      />
      <input
        type="text"
        placeholder="Search articles..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-night/10 bg-white py-2.5 pl-9 pr-9 text-[13px] font-bold text-night placeholder:text-night/30 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-night/30 hover:text-night/60"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
