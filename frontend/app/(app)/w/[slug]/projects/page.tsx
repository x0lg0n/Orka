"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  TrendingUp,
  CheckCircle2,
  Pause,
  DollarSign,
  SlidersHorizontal,
  ArrowRight,
} from "lucide-react";

interface Project {
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

const STAT_CARDS = [
  {
    label: "Total Projects",
    value: "24",
    detail: "2 from last month",
    icon: FolderKanban,
    color: "text-violet-500",
    bg: "bg-violet-50",
    pct: null as number | null,
  },
  {
    label: "In Progress",
    value: "12",
    detail: "50% of total",
    icon: TrendingUp,
    color: "text-amber-500",
    bg: "bg-amber-50",
    pct: 50,
  },
  {
    label: "Completed",
    value: "8",
    detail: "33% of total",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    pct: 33,
  },
  {
    label: "On Hold",
    value: "2",
    detail: "8% of total",
    icon: Pause,
    color: "text-amber-600",
    bg: "bg-amber-50",
    pct: 8,
  },
  {
    label: "Total Value",
    value: "2,450 XLM",
    detail: "$1,412.50 USD",
    icon: DollarSign,
    color: "text-violet-500",
    bg: "bg-violet-50",
    pct: null,
  },
];

const TABS = ["All Projects", "In Progress", "Completed", "On Hold"] as const;
type Tab = (typeof TABS)[number];

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

const ITEMS_PER_PAGE = 8;

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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your projects in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="h-9 w-48 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              3
            </span>
          </button>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg bg-[#7c3aed] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#6d28d9]"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-500">
                {card.label}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
            {card.pct !== null ? (
              <div className="mt-2">
                <p className="text-xs text-gray-500">{card.detail}</p>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-1.5 rounded-full ${card.color.replace("text-", "bg-")}`}
                    style={{ width: `${card.pct}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                {card.detail}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Tabs & Filters */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-[#7c3aed] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by project name or client..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 w-56 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            All Clients
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            All Status
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            Sort: Newest
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600 hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
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
                    <p className="font-medium text-gray-900">
                      {p.budget} XLM
                    </p>
                    <p className="text-xs text-gray-400">
                      ≈ ${(p.budget * 0.5125).toFixed(2)} USD
                    </p>
                  </td>

                  {/* Due Date */}
                  <td className="px-4 py-3">
                    <p className={`text-sm ${dueDateColor(p)}`}>{p.dueDate}</p>
                    <p className={`text-xs ${dueLabelColor(p)}`}>
                      {p.dueLabel}
                    </p>
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
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {p.lastUpdated}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filtered.length > 0 ? startIdx : 0} to {endIdx} of{" "}
          {filtered.length} projects
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
                n === page
                  ? "border border-[#7c3aed] bg-[#7c3aed] text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
