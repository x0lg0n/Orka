"use client";

import { ArrowRight } from "lucide-react";
import { popularPrompts } from "./mockData";

export default function PopularPrompts() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">
          Popular Prompts
        </h3>
        <button className="text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]">
          View all
        </button>
      </div>
      <div className="space-y-1">
        {popularPrompts.map((prompt) => (
          <button
            key={prompt.text}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition-all hover:bg-[#7c3aed]/5 hover:text-[#7c3aed]"
          >
            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-colors group-hover:text-[#7c3aed]" />
            {prompt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
