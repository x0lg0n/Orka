import { useMemo } from "react";
import type { Client } from "../page";

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
      segments.reduce<Array<{ dash: number; offset: number }>>(
        (prev, seg) => {
          const dash = (seg.pct / 100) * circumference;
          const offset =
            prev.length > 0
              ? prev[prev.length - 1].offset + prev[prev.length - 1].dash
              : 0;
          return [...prev, { dash, offset }];
        },
        [],
      ),
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

export function ClientStatusCard({ clients }: { clients: Client[] }) {
  const total = clients.length;
  const active = clients.filter((c) => c.status === "Active").length;
  const inactive = clients.filter((c) => c.status === "Inactive").length;
  const lead = clients.filter((c) => c.status === "Lead").length;

  const segments = [
    {
      label: "Active",
      value: active,
      pct: total > 0 ? (active / total) * 100 : 0,
      color: "#22c55e",
    },
    {
      label: "Inactive",
      value: inactive,
      pct: total > 0 ? (inactive / total) * 100 : 0,
      color: "#94a3b8",
    },
    {
      label: "Lead",
      value: lead,
      pct: total > 0 ? (lead / total) * 100 : 0,
      color: "#3b82f6",
    },
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Client Status</h3>
      <div className="mt-4">
        <DonutChart segments={segments} />
      </div>
    </div>
  );
}
