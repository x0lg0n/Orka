import { useMemo } from "react";
import type { ClientSummary, ClientStatus } from "./client-types";

function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; pct: number; color: string }[];
}) {
  const radius = 40;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;

  const offsets = useMemo(
    () =>
      segments.reduce<Array<{ dash: number; offset: number }>>((prev, seg) => {
        const dash = (seg.pct / 100) * circumference;
        const offset =
          prev.length > 0
            ? prev[prev.length - 1].offset + prev[prev.length - 1].dash
            : 0;
        return [...prev, { dash, offset }];
      }, []),
    [segments, circumference],
  );

  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeDasharray={`${offsets[i].dash} ${circumference - offsets[i].dash}`}
            strokeDashoffset={-offsets[i].offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-gray-600">{seg.label}</span>
            <span className="text-xs font-medium text-gray-900">
              {seg.value} ({seg.pct.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const COLOR: Record<ClientStatus, string> = {
  active: "#22c55e",
  inactive: "#94a3b8",
  lead: "#3b82f6",
  archived: "#cbd5e1",
};

const LABEL: Record<ClientStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  lead: "Lead",
  archived: "Archived",
};

export function ClientStatusCard({ clients }: { clients: ClientSummary[] }) {
  const total = clients.length;
  const counts: Record<ClientStatus, number> = {
    active: 0,
    inactive: 0,
    lead: 0,
    archived: 0,
  };
  for (const c of clients) counts[c.status] += 1;

  const segments = (Object.keys(counts) as ClientStatus[]).map((k) => ({
    label: LABEL[k],
    value: counts[k],
    pct: total > 0 ? (counts[k] / total) * 100 : 0,
    color: COLOR[k],
  }));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Client Status</h3>
      <div className="mt-4">
        {total > 0 ? (
          <DonutChart segments={segments} />
        ) : (
          <p className="text-sm text-gray-400">No clients yet.</p>
        )}
      </div>
    </div>
  );
}
