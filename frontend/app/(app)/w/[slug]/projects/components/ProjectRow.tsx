import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";
import type { ProjectSummary, ProjectStatus } from "@/lib/orka";

export type { ProjectSummary };

export const ITEMS_PER_PAGE = 10;

// Deterministic color from a string (since there is no stored client color yet).
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

function statusClasses(s: ProjectStatus) {
  switch (s) {
    case "active":
      return "bg-blue-50 text-blue-600 border border-blue-200";
    case "completed":
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "archived":
      return "bg-gray-100 text-gray-500 border border-gray-200";
    case "draft":
      return "bg-amber-50 text-amber-600 border border-amber-200";
  }
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Draft",
  active: "In Progress",
  completed: "Completed",
  archived: "Archived",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}

export function ProjectRow({
  project,
  slug,
}: {
  project: ProjectSummary;
  slug: string;
}) {
  const p = project;
  const clientName = p.client_name ?? "No client";
  const clientInitial = clientName.charAt(0).toUpperCase();
  const clientColor = colorFromString(clientName);
  // Budget / due date / progress / team are not yet stored on projects.
  const dueLabel = "—";

  return (
    <tr
      key={p.id}
      className="border-b border-gray-50 transition hover:bg-gray-50/50"
    >
      {/* Project */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
            <FolderKanban className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{p.title}</p>
            <p className="text-xs text-gray-400">{p.code ?? "—"}</p>
          </div>
        </div>
      </td>

      {/* Client */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: clientColor }}
          >
            {clientInitial}
          </div>
          <span className="text-gray-700">{clientName}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses(p.status)}`}
        >
          {STATUS_LABEL[p.status]}
        </span>
      </td>

      {/* Progress — not yet stored */}
      <td className="px-4 py-3 text-sm text-gray-400">—</td>

      {/* Budget — not yet stored */}
      <td className="px-4 py-3 text-sm text-gray-400">—</td>

      {/* Due Date — not yet stored */}
      <td className="px-4 py-3">
        <p className="text-sm text-gray-400">{dueLabel}</p>
      </td>

      {/* Team — not yet stored */}
      <td className="px-4 py-3 text-sm text-gray-400">—</td>

      {/* Last Updated */}
      <td className="px-4 py-3 text-sm text-gray-500">
        {timeAgo(p.updated_at)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <Link
          href={`/w/${slug}/projects/${p.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          View
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </td>
    </tr>
  );
}
