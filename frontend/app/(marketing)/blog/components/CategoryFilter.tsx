"use client";

import { categories } from "@/lib/blog-data";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={`shrink-0 rounded-full px-4 py-2 text-base font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50 ${
            activeCategory === cat
              ? "bg-violet text-white shadow-[0_2px_8px_rgba(148,116,255,0.3)]"
              : "border border-night/15 text-night/60 hover:bg-night/5 hover:text-night"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
