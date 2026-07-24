"use client";

import { Check } from "lucide-react";
import { categories, blogPosts } from "@/lib/blog-data";

interface CategoryFilterProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

function getCategoryCount(cat: string): number {
  if (cat === "All") return blogPosts.length;
  return blogPosts.filter((p) => p.category === cat).length;
}

export default function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="space-y-0.5">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        const count = getCategoryCount(cat);
        return (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50 ${
              isActive
                ? "border-l-2 border-l-violet bg-violet/10 pl-3 text-violet"
                : "border-l-2 border-l-transparent text-night/60 hover:bg-night/5 hover:text-night"
            }`}
          >
            {isActive && <Check size={14} className="shrink-0 text-violet" />}
            <span className="flex-1">{cat}</span>
            <span className={`text-xs font-bold ${isActive ? "text-violet/60" : "text-night/30"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
