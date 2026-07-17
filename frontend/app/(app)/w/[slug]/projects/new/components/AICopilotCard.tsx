import { Sparkles, CheckCircle2 } from "lucide-react";
import type { ProjectFormData } from "./NewProjectForm";

const SUGGESTIONS = [
  "Generating project scope",
  "Suggesting milestones",
  "Estimating timelines",
  "Recommending pricing",
];

export function AICopilotCard({ formData }: { formData: ProjectFormData }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#7c3aed]" />
          <h3 className="text-sm font-semibold text-gray-900">
            Orka AI Copilot
          </h3>
        </div>
        <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600">
          Beta
        </span>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        Need help? I can assist you with:
      </p>

      <div className="mt-3 flex flex-col gap-2">
        {SUGGESTIONS.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-gray-600">{s}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={!formData.name.trim()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[#7c3aed] bg-[#7c3aed]/5 py-2.5 text-sm font-medium text-[#7c3aed] transition hover:bg-[#7c3aed]/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Sparkles className="h-4 w-4" />
        Generate with AI
      </button>
    </div>
  );
}
