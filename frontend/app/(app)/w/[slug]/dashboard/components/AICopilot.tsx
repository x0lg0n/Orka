"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Send } from "lucide-react";

const examplePrompts = [
  "Generate a proposal for a website project",
  "Summarize project status",
  "Create a invoice for milestone 2",
  "Remind client about pending approval",
];

export function AICopilot() {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // TODO: Integrate with AI endpoint
    setInput("");
  };

  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#11182d]">Your AI Copilot</h2>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-[#7c3aed]">
          Beta
        </span>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#e5e8f0] bg-[#f7f8fc] p-3">
        <Sparkles className="h-4 w-4 text-[#7c3aed]" />
        <span className="text-sm text-[#8b95aa]">Ask Orka anything...</span>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold text-[#5f6b86]">
          Example prompts:
        </p>
        <div className="flex flex-col gap-1.5">
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[#5f6b86] transition-colors duration-150 hover:bg-[#f7f8fc] hover:text-[#11182d]"
            >
              <ArrowRight className="h-3 w-3 shrink-0 text-[#8b95aa]" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="h-10 flex-1 rounded-lg border border-[#e5e8f0] bg-white px-3 text-sm text-[#11182d] outline-none transition-colors duration-200 placeholder:text-[#8b95aa] focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed]/30"
          aria-label="Ask AI Copilot"
        />
        <button
          type="submit"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c3aed] text-white transition-all duration-200 hover:bg-[#6d28d9] hover:shadow-md active:scale-[0.98]"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
