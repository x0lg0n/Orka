import { ChevronDown, ArrowRight } from "lucide-react";
import type { Client } from "../page";

export function TopClientsCard({ clients }: { clients: Client[] }) {
  const top5 = [...clients]
    .sort((a, b) => b.totalBilled - a.totalBilled)
    .slice(0, 5);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Top Clients</h3>
        <button
          type="button"
          className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
        >
          This Month
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {top5.map((c) => (
          <div key={c.id} className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ backgroundColor: c.logoColor }}
            >
              {c.logoInitial}
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700">
              {c.name}
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {c.totalBilled} XLM
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-[#7c3aed] transition hover:bg-gray-50"
      >
        View full report
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
