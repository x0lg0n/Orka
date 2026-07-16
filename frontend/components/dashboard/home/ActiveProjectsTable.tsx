import Link from "next/link";
import { ArrowRight, MoreHorizontal, FolderKanban } from "lucide-react";
import type { Project } from "@/types/dashboard";

interface ActiveProjectsTableProps {
  projects: Project[];
  slug: string;
}

const statusStyles: Record<string, string> = {
  "In Progress": "bg-green-100 text-green-700",
  "Pending Approval": "bg-yellow-100 text-yellow-700",
  Completed: "bg-blue-100 text-blue-700",
};

const progressColors: Record<string, string> = {
  "In Progress": "bg-green-500",
  "Pending Approval": "bg-yellow-500",
  Completed: "bg-blue-500",
};

export function ActiveProjectsTable({ projects }: ActiveProjectsTableProps) {
export function ActiveProjectsTable({ projects, slug }: ActiveProjectsTableProps) {
  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#11182d]">
          Active Projects
        </h2>
        <button className="text-xs font-semibold text-[#7c3aed] transition-colors duration-150 hover:text-[#6d28d9]">
          View all
        </button>
        <Link
          href={`/w/${slug}/projects`}
          className="text-xs font-semibold text-[#7c3aed] transition-colors duration-150 hover:text-[#6d28d9]"
        >
          View all
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-[#e5e8f0]">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8b95aa]">
                Project
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8b95aa]">
                Client
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8b95aa]">
                Progress
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8b95aa]">
                Escrow
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8b95aa]">
                Status
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8b95aa]">
                Next Milestone
              </th>
              <th className="pb-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-b border-[#e5e8f0] last:border-b-0 transition-colors duration-150 hover:bg-[#f7f8fc]"
              >
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-[#11182d]">
                      {project.name}
                    </span>
                  </div>
                  <Link
                    href={project.href}
                    className="group flex items-center gap-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-[#11182d] group-hover:text-[#7c3aed] group-hover:underline">
                      {project.name}
                    </span>
                  </Link>
                </td>
                <td className="py-3 text-sm text-[#5f6b86]">
                  {project.client}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-[#e5e8f0]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColors[project.status]}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#5f6b86]">
                      {project.progress}%
                    </span>
                  </div>
                </td>
                <td className="py-3 text-sm font-medium text-[#11182d]">
                  {project.escrow}
                </td>
                <td className="py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[project.status]}`}
                  >
                    {project.status}
                  </span>
                </td>
                <td className="py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#11182d]">
                      {project.nextMilestone}
                    </p>
                    <p className="text-xs text-[#8b95aa]">
                      {project.nextDate}
                    </p>
                  </div>
                </td>
                <td className="py-3">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8b95aa] transition-colors duration-150 hover:bg-[#f0f0f5] hover:text-[#5f6b86]"
                    aria-label={`More options for ${project.name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <Link
                    href={project.href}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8b95aa] transition-colors duration-150 hover:bg-[#f0f0f5] hover:text-[#5f6b86]"
                    aria-label={`Open ${project.name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#7c3aed] transition-colors duration-150 hover:text-[#6d28d9]">
        View all projects
        <ArrowRight className="h-4 w-4" />
      </button>
      <Link
        href={`/w/${slug}/projects`}
        className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#7c3aed] transition-colors duration-150 hover:text-[#6d28d9]"
      >
        View all projects
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
