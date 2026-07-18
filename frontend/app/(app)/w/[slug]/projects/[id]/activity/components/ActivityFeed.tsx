"use client";

import { useMemo } from "react";
import { ActivityCard } from "./ActivityCard";
import { ActivityFilters } from "./ActivityFilters";
import { ActivityEmptyState } from "./ActivityEmptyState";
import type { ActivityGroup, ActivityItem } from "./types";

function TimelineIcon() {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#7c3aed] bg-[#7c3aed]/10">
      <div className="h-2 w-2 rounded-full bg-[#7c3aed]" />
    </div>
  );
}

function filterByDateRange(
  groups: ActivityGroup[],
  dateRange: string
): ActivityGroup[] {
  if (dateRange === "all") return groups;

  const now = new Date();
  let cutoff: Date;

  switch (dateRange) {
    case "today":
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "7days":
      cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 7);
      break;
    case "month":
      cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 1);
      break;
    default:
      return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => new Date(item.createdAt) >= cutoff
      ),
    }))
    .filter((group) => group.items.length > 0);
}

function filterBySearch(groups: ActivityGroup[], search: string): ActivityGroup[] {
  if (!search.trim()) return groups;
  const q = search.toLowerCase();
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q) ||
          (item.createdByName?.toLowerCase().includes(q) ?? false)
      ),
    }))
    .filter((group) => group.items.length > 0);
}

function filterByCategory(
  groups: ActivityGroup[],
  category: string
): ActivityGroup[] {
  if (category === "all") return groups;
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0);
}

export function ActivityFeed({
  groups,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
}: {
  groups: ActivityGroup[];
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
}) {
  const filtered = useMemo(() => {
    let result = groups;
    result = filterByDateRange(result, dateRange);
    result = filterByCategory(result, category);
    result = filterBySearch(result, search);
    return result;
  }, [groups, dateRange, category, search]);

  const totalFiltered = filtered.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Activity Feed</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            All activities and updates related to this project.
          </p>
        </div>
        <ActivityFilters
          search={search}
          onSearchChange={onSearchChange}
          category={category}
          onCategoryChange={onCategoryChange}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
        />
      </div>

      {totalFiltered === 0 ? (
        <ActivityEmptyState />
      ) : (
        <div className="mt-4 flex flex-col">
          {filtered.map((group) => (
            <div key={group.date} className="mb-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {group.label}
              </h4>
              <div className="flex flex-col">
                {group.items.map((item, i) => {
                  const isLast = i === group.items.length - 1;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <TimelineIcon />
                        {!isLast && (
                          <div className="my-0.5 h-6 w-0.5 bg-[#7c3aed]/20" />
                        )}
                      </div>
                      <div
                        className={`flex-1 ${isLast ? "pb-1.5" : "pb-3"}`}
                      >
                        <ActivityCard item={item} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
