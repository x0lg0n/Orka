"use client";

import { useState } from "react";
import { ITEMS_PER_PAGE, ProjectRow, type ProjectSummary } from "./ProjectRow";
import { ProjectsHeader } from "./ProjectsHeader";
import { ProjectStats } from "./ProjectStats";
import { ProjectsTabs, type Tab } from "./ProjectsTabs";
import { fetchProjectsPage } from "../actions";
import type { ProjectStatus } from "@/lib/orka";

const EMPTY_COUNTS: Record<ProjectStatus, number> = {
  draft: 0,
  active: 0,
  completed: 0,
  archived: 0,
};

export function ProjectsList({
  slug,
  initialItems,
  initialTotal,
  initialHasMore,
  initialCounts,
}: {
  slug: string;
  initialItems: ProjectSummary[];
  initialTotal: number;
  initialHasMore: boolean;
  initialCounts: Record<ProjectStatus, number>;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ProjectSummary[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [counts, setCounts] = useState(initialCounts);
  const [offset, setOffset] = useState(initialItems.length);
  const [loading, setLoading] = useState(false);

  async function refetch(reset: boolean) {
    setLoading(true);
    const nextOffset = reset ? 0 : offset;
    const page = await fetchProjectsPage(slug, {
      status: activeTab,
      search,
      limit: ITEMS_PER_PAGE,
      offset: nextOffset,
    });
    if (reset) {
      setItems(page.items);
      setOffset(page.items.length);
    } else {
      setItems((prev) => [...prev, ...page.items]);
      setOffset((o) => o + page.items.length);
    }
    setTotal(page.total);
    setHasMore(page.hasMore);
    setCounts(page.counts);
    setLoading(false);
  }

  function onTabOrSearch(nextTab: Tab, nextSearch: string) {
    setActiveTab(nextTab);
    setSearch(nextSearch);
    setItems([]);
    setOffset(0);
    void refetch(true);
  }

  return (
    <div className="min-h-screen">
      <ProjectsHeader
        slug={slug}
        search={search}
        setSearch={(s) => onTabOrSearch(activeTab, s)}
      />

      <ProjectStats total={total} counts={counts} />

      <div className="mt-6">
        <ProjectsTabs
          activeTab={activeTab}
          setActiveTab={(t) => onTabOrSearch(t, search)}
        />
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
            {items.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-16 text-center text-gray-400"
                >
                  {total === 0
                    ? "No projects yet. Create your first one."
                    : "No projects found."}
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <ProjectRow key={p.id} project={p} slug={slug} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {total > 0 ? `Showing ${items.length} of ${total} projects` : ""}
        </p>
        {hasMore ? (
          <button
            type="button"
            onClick={() => void refetch(false)}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
