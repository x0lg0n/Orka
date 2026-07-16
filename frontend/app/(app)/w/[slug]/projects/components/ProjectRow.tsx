import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";

export interface Project {
  id: string;
  title: string;
  code: string;
  client: { name: string; initial: string; color: string };
  status: "In Progress" | "Completed" | "On Hold";
  progress: number;
  budget: number;
  dueDate: string;
  dueLabel: string;
  dueOverdue: boolean;
  team: { initial: string; color: string }[];
  lastUpdated: string;
}

export const ITEMS_PER_PAGE = 8;

function statusClasses(s: Project["status"]) {
  switch (s) {
    case "In Progress":
      return "bg-blue-50 text-blue-600 border border-blue-200";
    case "Completed":
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "On Hold":
      return "bg-amber-50 text-amber-600 border border-amber-200";
  }
}

function progressColor(p: number) {
  if (p === 100) return "bg-emerald-500";
  if (p >= 50) return "bg-blue-500";
  if (p >= 25) return "bg-blue-400";
  return "bg-amber-400";
}

function dueDateColor(p: Project) {
  if (p.status === "Completed") return "text-emerald-600";
  if (p.dueOverdue) return "text-red-500";
  return "text-gray-600";
}

function dueLabelColor(p: Project) {
  if (p.status === "Completed") return "text-emerald-500";
  if (p.dueOverdue) return "text-red-500";
  return "text-amber-500";
}

export function ProjectRow({ project, slug }: { project: Project; slug: string }) {
  const p = project;
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
            <p className="text-xs text-gray-400">{p.code}</p>
          </div>
        </div>
      </td>

      {/* Client */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: p.client.color }}
          >
            {p.client.initial}
          </div>
          <span className="text-gray-700">{p.client.name}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses(p.status)}`}
        >
          {p.status}
        </span>
      </td>

      {/* Progress */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {p.progress}%
          </span>
          <div className="h-1.5 w-16 rounded-full bg-gray-100">
            <div
              className={`h-1.5 rounded-full ${progressColor(p.progress)}`}
              style={{ width: `${p.progress}%` }}
            />
          </div>
        </div>
      </td>

      {/* Budget */}
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900">{p.budget} XLM</p>
        <p className="text-xs text-gray-400">
          ≈ ${(p.budget * 0.5125).toFixed(2)} USD
        </p>
      </td>

      {/* Due Date */}
      <td className="px-4 py-3">
        <p className={`text-sm ${dueDateColor(p)}`}>{p.dueDate}</p>
        <p className={`text-xs ${dueLabelColor(p)}`}>{p.dueLabel}</p>
      </td>

      {/* Team */}
      <td className="px-4 py-3">
        <div className="flex -space-x-1.5">
          {p.team.slice(0, 3).map((m, i) => (
            <div
              key={`${p.id}-team-${i}`}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
              style={{ backgroundColor: m.color }}
            >
              {m.initial}
            </div>
          ))}
          {p.team.length > 3 && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-500">
              +{p.team.length - 3}
            </div>
          )}
        </div>
      </td>

      {/* Last Updated */}
      <td className="px-4 py-3 text-sm text-gray-500">{p.lastUpdated}</td>

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
