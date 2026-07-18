"use client";

import type { DashboardData } from "@/types/dashboard";
import { DashboardHeader } from "./DashboardHeader";
import { MetricCards } from "./MetricCards";
import { ActionRequired } from "./ActionRequired";
import { RecentActivity } from "./RecentActivity";
import { UpcomingMilestones } from "./UpcomingMilestones";
import { ActiveProjectsTable } from "./ActiveProjectsTable";
import { AICopilot } from "./AICopilot";
import { QuickSummary } from "./QuickSummary";

export function DashboardContent({
  data,
  slug,
}: {
  data: DashboardData;
  slug: string;
}) {
  return (
    <div className="dashboard-light flex flex-col gap-6">
      <DashboardHeader user={data.user} workspace={data.user.lastName} />

      <MetricCards metrics={data.metrics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ActionRequired approvals={data.approvals} />
            <RecentActivity activities={data.activities} slug={slug} />
          </div>

          <ActiveProjectsTable projects={data.projects} slug={slug} />
        </div>

        <div className="flex flex-col gap-6">
          <UpcomingMilestones milestones={data.milestones} slug={slug} />
          <AICopilot />
          <QuickSummary summary={data.summary} />
        </div>
      </div>
    </div>
  );
}
