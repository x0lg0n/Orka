"use client";

import { useState } from "react";
import { Send, FileText, BarChart3, FileSearch, Receipt } from "lucide-react";
import { promptChips } from "./mockData";

const chipIcons = [FileText, BarChart3, FileSearch, Receipt];

export default function AskOrka() {
  const [input, setInput] = useState("");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-gray-900">
        Ask Orka anything...
      </h3>
      <div className="mb-4 flex flex-wrap gap-2">
        {promptChips.map((chip, index) => {
          const Icon = chipIcons[index % chipIcons.length];
          return (
            <button
              key={chip}
              onClick={() => setInput(chip)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition-all hover:border-[#7c3aed]/30 hover:bg-[#7c3aed]/5 hover:text-[#7c3aed]"
            >
              <Icon className="h-3.5 w-3.5" />
              {chip}
            </button>
          );
        })}
      </div>
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          rows={3}
          className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
        />
        <button className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed] text-white transition-colors hover:bg-[#6d28d9]">
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">
        Orka AI can make mistakes. Please review important information.
      </p>
    </div>
  );
}
