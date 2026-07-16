"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Project, ITEMS_PER_PAGE, ProjectRow } from "./components/ProjectRow";
import { ProjectsHeader } from "./components/ProjectsHeader";
import { ProjectStats } from "./components/ProjectStats";
import { ProjectsTabs, type Tab } from "./components/ProjectsTabs";
import { ProjectFilters } from "./components/ProjectFilters";
import { ProjectPagination } from "./components/ProjectPagination";

const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Nike Website Redesign",
    code: "PRJ-001",
    client: { name: "Nike Inc.", initial: "N", color: "#1a1a2e" },
    status: "In Progress",
    progress: 60,
    budget: 500,
    dueDate: "Jun 15, 2025",
    dueLabel: "18 days left",
    dueOverdue: false,
    team: [
      { initial: "A", color: "#6366f1" },
      { initial: "B", color: "#f59e0b" },
      { initial: "C", color: "#10b981" },
    ],
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    title: "Mobile App Development",
    code: "PRJ-002",
    client: { name: "Acme Corp", initial: "A", color: "#ef4444" },
    status: "In Progress",
    progress: 40,
    budget: 350,
    dueDate: "May 30, 2025",
    dueLabel: "2 days left",
    dueOverdue: false,
    team: [
      { initial: "D", color: "#8b5cf6" },
      { initial: "E", color: "#ec4899" },
    ],
    lastUpdated: "5 hours ago",
  },
  {
    id: "3",
    title: "E-commerce Platform",
    code: "PRJ-003",
    client: { name: "TechStart Inc.", initial: "T", color: "#22c55e" },
    status: "Completed",
    progress: 100,
    budget: 600,
    dueDate: "May 10, 2025",
    dueLabel: "Completed",
    dueOverdue: false,
    team: [
      { initial: "F", color: "#3b82f6" },
      { initial: "G", color: "#f97316" },
      { initial: "H", color: "#14b8a6" },
    ],
    lastUpdated: "1 day ago",
  },
  {
    id: "4",
    title: "Brand Identity Design",
    code: "PRJ-004",
    client: { name: "DesignHub", initial: "D", color: "#f59e0b" },
    status: "In Progress",
    progress: 25,
    budget: 150,
    dueDate: "Jun 5, 2025",
    dueLabel: "8 days left",
    dueOverdue: false,
    team: [
      { initial: "I", color: "#a855f7" },
      { initial: "J", color: "#ef4444" },
    ],
    lastUpdated: "2 days ago",
  },
  {
    id: "5",
    title: "Marketing Campaign",
    code: "PRJ-005",
    client: { name: "GrowthLabs", initial: "G", color: "#22c55e" },
    status: "On Hold",
    progress: 10,
    budget: 200,
    dueDate: "Jun 20, 2025",
    dueLabel: "33 days left",
    dueOverdue: false,
    team: [{ initial: "K", color: "#6366f1" }],
    lastUpdated: "3 days ago",
  },
  {
    id: "6",
    title: "SaaS Dashboard",
    code: "PRJ-006",
    client: { name: "StartupXYZ", initial: "S", color: "#6366f1" },
    status: "Completed",
    progress: 100,
    budget: 450,
    dueDate: "Apr 25, 2025",
    dueLabel: "Completed",
    dueOverdue: false,
    team: [
      { initial: "L", color: "#f59e0b" },
      { initial: "M", color: "#10b981" },
    ],
    lastUpdated: "1 week ago",
  },
  {
    id: "7",
    title: "Learning Platform",
    code: "PRJ-007",
    client: { name: "EduTech Co.", initial: "E", color: "#22c55e" },
    status: "In Progress",
    progress: 75,
    budget: 300,
    dueDate: "Jun 12, 2025",
    dueLabel: "15 days left",
    dueOverdue: false,
    team: [
      { initial: "N", color: "#ef4444" },
      { initial: "O", color: "#8b5cf6" },
      { initial: "P", color: "#3b82f6" },
    ],
    lastUpdated: "1 week ago",
  },
  {
    id: "8",
    title: "Data Analytics Tool",
    code: "PRJ-008",
    client: { name: "DataViz Inc.", initial: "D", color: "#f97316" },
    status: "On Hold",
    progress: 15,
    budget: 250,
    dueDate: "Jun 25, 2025",
    dueLabel: "38 days left",
    dueOverdue: false,
    team: [{ initial: "Q", color: "#14b8a6" }],
    lastUpdated: "2 weeks ago",
  },
];

export default function ProjectsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("All Projects");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = MOCK_PROJECTS.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.client.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab =
      activeTab === "All Projects" ||
      (activeTab === "In Progress" && p.status === "In Progress") ||
      (activeTab === "Completed" && p.status === "Completed") ||
      (activeTab === "On Hold" && p.status === "On Hold");
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

      <ProjectStats />

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
                  No projects found.
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
