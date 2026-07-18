"use client";

import { useState } from "react";
import { ActivityFeed } from "./ActivityFeed";
import { ActivitySummaryCard } from "./ActivitySummaryCard";
import { TopContributorsCard } from "./TopContributorsCard";
import { TimelineFilterCard } from "./TimelineFilterCard";
import { RecentNotesCard } from "./RecentNotesCard";
import type { ActivityGroup } from "./types";

type SummaryStats = {
  totalActivities: number;
  totalMilestones: number;
  totalPayments: number;
  totalFiles: number;
  totalComments: number;
  totalContracts: number;
};

type Contributor = {
  name: string;
  count: number;
};

type Note = {
  id: string;
  title: string;
  description: string | null;
  created_by_name: string | null;
  created_at: string;
};

export function ProjectActivityView({
  slug,
  projectId,
  groups,
  stats,
  contributors,
  recentNotes,
}: {
  slug: string;
  projectId: string;
  groups: ActivityGroup[];
  stats: SummaryStats;
  contributors: Contributor[];
  recentNotes: Note[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Track all activities and updates for this project
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed
            groups={groups}
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        <div className="flex flex-col gap-4">
          <ActivitySummaryCard
            stats={stats}
            slug={slug}
            projectId={projectId}
          />
          <TopContributorsCard contributors={contributors} />
          <TimelineFilterCard
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          <RecentNotesCard
            notes={recentNotes}
            slug={slug}
            projectId={projectId}
          />
        </div>
      </div>
    </div>
  );
}
