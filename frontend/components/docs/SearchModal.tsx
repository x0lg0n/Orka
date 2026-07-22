"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";
import { Search, FileText, ArrowRight } from "lucide-react";

interface SearchEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  url: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const indexRef = useRef<MiniSearch | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    async function loadIndex() {
      if (indexRef.current) return;
      setLoading(true);
      try {
        const res = await fetch("/search-index.json");
        const entries: SearchEntry[] = await res.json();

        const ms = new MiniSearch({
          fields: ["title", "content", "category", "description"],
          storeFields: ["title", "category", "description", "url"],
          searchOptions: {
            boost: { title: 3, category: 2, description: 1.5 },
            prefix: true,
            fuzzy: 0.2,
          },
        });

        ms.addAll(entries);
        indexRef.current = ms;
      } catch (e) {
        console.error("Failed to load search index:", e);
      }
      setLoading(false);
    }

    loadIndex();
  }, [open]);

  // Reset state when modal opens
  const prevOpen = useRef(open);
  useEffect(() => {
    if (open && !prevOpen.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
    prevOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!query.trim() || !indexRef.current) {
      setResults([]);
      return;
    }
    const found = indexRef.current.search(query).slice(0, 8);
    const mapped = found.map((r) => ({
      id: r.id,
      title: r.title as string,
      category: r.category as string,
      description: r.description as string,
      content: "",
      url: r.url as string,
    }));
    setResults(mapped);
    setSelectedIndex(0);
  }, [query]);

  const navigateTo = useCallback(
    (url: string) => {
      onClose();
      router.push(url);
    },
    [onClose, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        navigateTo(results[selectedIndex].url);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, selectedIndex, navigateTo, onClose]
  );

  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-night/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-night/10 px-4 py-3">
          <Search size={18} className="shrink-0 text-night/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documentation..."
            className="flex-1 bg-transparent text-sm text-night outline-none placeholder:text-night/40"
          />
          <button
            onClick={onClose}
            className="rounded-md bg-night/5 px-2 py-1 text-[11px] font-bold text-night/40"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {loading && (
            <p className="py-8 text-center text-sm text-night/40">
              Loading search index...
            </p>
          )}
          {!loading && query && results.length === 0 && (
            <p className="py-8 text-center text-sm text-night/40">
              No results found for &ldquo;{query}&rdquo;
            </p>
          )}
          {!loading && results.length > 0 && (
            <ul>
              {results.map((result, i) => (
                <li key={result.id}>
                  <button
                    onClick={() => navigateTo(result.url)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                      i === selectedIndex
                        ? "bg-violet/5 text-violet"
                        : "text-night hover:bg-night/5"
                    }`}
                  >
                    <FileText
                      size={16}
                      className="shrink-0 text-night/30"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {result.title}
                      </p>
                      <p className="text-[11px] font-bold text-night/40 truncate">
                        {result.category}
                      </p>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-night/20" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && !query && (
            <div className="py-8 text-center text-sm text-night/40">
              Start typing to search...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
