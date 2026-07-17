"use client";

import { useState } from "react";
import { ITEMS_PER_PAGE, ProjectRow, type ProjectSummary } from "./ProjectRow";
import { ProjectsHeader } from "./ProjectsHeader";
import { ProjectStats } from "./ProjectStats";
import { ProjectsTabs, type Tab } from "./ProjectsTabs";
import { ProjectFilters } from "./ProjectFilters";
import { ProjectPagination } from "./ProjectPagination";

export function ProjectsList({
  slug,
  projects,
}: {
  slug: string;
  projects: ProjectSummary[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.client_name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "all" || p.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageItems = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const startIdx = (page - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(page * ITEMS_PER_PAGE, filtered.length);

  return (
    <div className="min-h-screen">
      <ProjectsHeader slug={slug} />

      <ProjectStats projects={projects} />

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <ProjectsTabs activeTab={activeTab} setActiveTab={setActiveTab} setPage={setPage} />
        <ProjectFilters search={search} setSearch={setSearch} setPage={setPage} />
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Project
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Client
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Progress
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Budget
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Due Date
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Team
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Last Updated
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-16 text-center text-gray-400"
                >
                  {projects.length === 0
                    ? "No projects yet. Create your first one."
                    : "No projects found."}
                </td>
              </tr>
            ) : (
              pageItems.map((p) => (
                <ProjectRow key={p.id} project={p} slug={slug} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProjectPagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        filteredCount={filtered.length}
        startIdx={startIdx}
        endIdx={endIdx}
      />
    </div>
  );
}
