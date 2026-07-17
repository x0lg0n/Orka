import { ArrowRight } from "lucide-react";
import type { ClientSummary, ClientStatus } from "./client-types";

function colorFromString(s: string): string {
  const palette = [
    "#6366f1",
    "#f59e0b",
    "#10b981",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#22c55e",
    "#3b82f6",
    "#f97316",
    "#14b8a6",
  ];
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return palette[hash % palette.length];
}

const STATUS_LABEL: Record<ClientStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  lead: "Lead",
  archived: "Archived",
};

export function TopClientsCard({ clients }: { clients: ClientSummary[] }) {
  const recent = clients.slice(0, 5);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Recent Clients</h3>

      <div className="mt-4 flex flex-col gap-3">
        {recent.length === 0 ? (
          <p className="text-sm text-gray-400">No clients yet.</p>
        ) : (
          recent.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{ backgroundColor: colorFromString(c.name) }}
              >
                {c.name.charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 truncate text-sm font-medium text-gray-700">
                {c.name}
              </span>
              <span className="text-xs text-gray-400">
                {STATUS_LABEL[c.status]}
              </span>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-[#7c3aed] transition hover:bg-gray-50"
      >
        View all clients
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
