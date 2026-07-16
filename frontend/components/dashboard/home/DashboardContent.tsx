"use client";

import { DashboardHeader } from "@/components/dashboard/home/DashboardHeader";
import { MetricCards } from "@/components/dashboard/home/MetricCards";
import { ActionRequired } from "@/components/dashboard/home/ActionRequired";
import { RecentActivity } from "@/components/dashboard/home/RecentActivity";
import { UpcomingMilestones } from "@/components/dashboard/home/UpcomingMilestones";
import { ActiveProjectsTable } from "@/components/dashboard/home/ActiveProjectsTable";
import { AICopilot } from "@/components/dashboard/home/AICopilot";
import { QuickSummary } from "@/components/dashboard/home/QuickSummary";
import type { DashboardData } from "@/types/dashboard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { FolderKanban } from "lucide-react";

export function DashboardContent({ data }: { data: DashboardData }) {
  if (data.projects.length === 0 && data.activities.length === 0) {
    return (
      <div className="dashboard-light flex flex-col gap-6">
        <DashboardHeader user={data.user} workspace={data.user.lastName} />
        <EmptyState
          tone="violet"
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to fund milestones, track escrow, and build your on-chain audit trail."
          action={
            <button className="flex h-10 items-center gap-2 rounded-lg bg-[#7c3aed] px-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#6d28d9]">
              New Project
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="dashboard-light flex flex-col gap-6">
      <DashboardHeader user={data.user} workspace={data.user.lastName} />

      <MetricCards metrics={data.metrics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ActionRequired approvals={data.approvals} />
            <RecentActivity activities={data.activities} />
          </div>

          <ActiveProjectsTable projects={data.projects} />
        </div>

        <div className="flex flex-col gap-6">
          <UpcomingMilestones milestones={data.milestones} />
          <AICopilot />
          <QuickSummary summary={data.summary} />
        </div>
      </div>
    </div>
  );
}
