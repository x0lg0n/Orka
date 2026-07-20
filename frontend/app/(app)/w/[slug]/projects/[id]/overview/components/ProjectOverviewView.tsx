"use client";

import { ProjectStatsRow } from "./ProjectStatsRow";
import { ProjectOverviewCard } from "./ProjectOverviewCard";
import { MilestoneProgressCard } from "./MilestoneProgressCard";
import { ClientInfoCard } from "./ClientInfoCard";
import { EscrowOverviewCard } from "./EscrowOverviewCard";
import { RecentActivityCard } from "./RecentActivityCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { ProjectFilesCard } from "./ProjectFilesCard";
import { UpcomingMilestonesCard } from "./UpcomingMilestonesCard";

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  status: string;
  client_name: string | null;
  client_email: string | null;
  client_id: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type MilestoneRow = {
  id: string;
  title: string;
  amount: number;
  asset: string;
  status: string;
  due_date: string | null;
};

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
} | null;

type OwnerRow = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

type FileRow = {
  id: string;
  name: string;
  size: number | null;
  created_at: string;
  review_status: string;
};

type ActivityRow = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
  actor_id: string | null;
};

type OverviewStats = {
  progressPct: number;
  totalMilestones: number;
  releasedCount: number;
  fundedCount: number;
  pendingCount: number;
  refundedCount: number;
  completedCount: number;
  inProgressCount: number;
  upcomingCount: number;
  totalBudget: number;
  fundedAmount: number;
  releasedAmount: number;
  pendingAmount: number;
  refundedAmount: number;
  milestoneAsset: string;
  escrowFundedPct: number;
};

export function ProjectOverviewView({
  slug,
  projectId,
  project,
  milestones,
  client,
  owner,
  files,
  activity,
  memberCount,
  stats,
}: {
  slug: string;
  projectId: string;
  project: ProjectRow;
  milestones: MilestoneRow[];
  client: ClientRow;
  owner: OwnerRow;
  files: FileRow[];
  activity: ActivityRow[];
  memberCount: number;
  stats: OverviewStats;
}) {
  return (
    <div className="space-y-4">
      <ProjectStatsRow stats={stats} asset={stats.milestoneAsset} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ProjectOverviewCard
          description={project.description}
          owner={owner}
          metadata={project.metadata}
          createdAt={project.created_at}
          updatedAt={project.updated_at}
        />
        <MilestoneProgressCard
          slug={slug}
          projectId={projectId}
          completedCount={stats.completedCount}
          inProgressCount={stats.inProgressCount}
          upcomingCount={stats.upcomingCount}
          pendingCount={stats.pendingCount}
          totalCount={stats.totalMilestones}
          progressPct={stats.progressPct}
        />
        <ClientInfoCard
          slug={slug}
          client={client}
          projectClientId={project.client_id}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <EscrowOverviewCard
          fundedAmount={stats.fundedAmount}
          releasedAmount={stats.releasedAmount}
          pendingAmount={stats.pendingAmount}
          refundedAmount={stats.refundedAmount}
          totalBudget={stats.totalBudget}
          asset={stats.milestoneAsset}
          escrowFundedPct={stats.escrowFundedPct}
          slug={slug}
        />
        <RecentActivityCard
          slug={slug}
          projectId={projectId}
          activity={activity}
        />
        <QuickActionsCard slug={slug} projectId={projectId} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProjectFilesCard slug={slug} projectId={projectId} files={files} />
        <UpcomingMilestonesCard
          slug={slug}
          projectId={projectId}
          milestones={milestones}
          asset={stats.milestoneAsset}
        />
      </div>
    </div>
  );
}
