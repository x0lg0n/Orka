"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { docsNavigation } from "@/lib/docs/config";

interface DocsSidebarSearchProps {
  onFilter: (query: string) => void;
}

export default function DocsSidebarSearch({ onFilter }: DocsSidebarSearchProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onFilter(query);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, onFilter]);

  const handleClear = () => {
    setQuery("");
    onFilter("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative mb-4">
      <div className="flex items-center gap-2 rounded-lg border border-night/10 bg-white px-3 py-2 text-sm text-night/50 focus-within:border-violet focus-within:ring-1 focus-within:ring-violet/20">
        <Search size={14} className="shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search docs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-night outline-none placeholder:text-night/40"
          aria-label="Search documentation"
        />
        {query && (
          <button
            onClick={handleClear}
            className="shrink-0 rounded p-0.5 text-night/40 hover:text-night"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
