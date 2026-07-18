import { Sparkles, ArrowRight } from "lucide-react";

const SUGGESTIONS = [
  "Generate invoice for milestone 2",
  "Summarize project status",
  "Draft follow-up email to client",
  "Analyze project risks",
];

export function CopilotCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Your AI Copilot</h3>
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600">
          Beta
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50/50 px-3 py-2">
        <Sparkles className="h-4 w-4 text-violet-500" />
        <input
          type="text"
          placeholder="Ask Orka anything..."
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          readOnly
        />
      </div>

      <p className="mt-3 text-xs font-medium text-gray-400">
        Suggested for this project
      </p>
      <div className="mt-2 flex flex-col gap-1">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm text-gray-600 transition hover:bg-gray-50"
          >
            <span className="flex items-center gap-1.5">
              <ArrowRight className="h-3 w-3 text-gray-300" />
              {s}
            </span>
            <ArrowRight className="h-3 w-3 text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
