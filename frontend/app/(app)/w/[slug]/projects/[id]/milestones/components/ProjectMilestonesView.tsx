"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutList, LayoutGrid } from "lucide-react";
import { MilestoneProgressOverview } from "./MilestoneProgressOverview";
import { MilestoneTable } from "./MilestoneTable";
import { MilestoneSummaryCard } from "./MilestoneSummaryCard";
import { EscrowDetailsCard } from "./EscrowDetailsCard";
import { UpcomingMilestonesCard } from "./UpcomingMilestonesCard";
import { MilestonePaymentFlow } from "./MilestonePaymentFlow";
import { AddMilestoneButton } from "./AddMilestoneButton";
import { BoardView } from "./BoardView";
import { MilestoneEmptyState } from "./MilestoneEmptyState";
import type { WorkflowRole, WorkflowState } from "@/lib/workflow";
import type { OrkaCustodyMode } from "@/lib/stellar";
import {
  submitMilestone,
  approveMilestone,
  rejectMilestone,
  releaseMilestone,
  saveMilestones,
} from "../../actions";

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  client_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
};

type MilestoneRow = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  asset: string;
  status: string;
  position: number | null;
  due_date: string | null;
  created_at: string;
};

type OwnerRow = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

type EscrowRow = {
  id: string;
  status: string;
  contract_address: string | null;
  total_amount?: number;
  total_funded?: number;
  amount: number;
  asset: string;
  created_at: string;
} | null;

type MilestoneStats = {
  progressPct: number;
  totalBudget: number;
  releasedAmount: number;
  fundedAmount: number;
  pendingAmount: number;
  milestoneAsset: string;
  totalMilestones: number;
  releasedCount: number;
  fundedCount: number;
  draftCount: number;
  approvedCount: number;
};

export function ProjectMilestonesView({
  slug,
  projectId,
  milestones,
  owner,
  escrow,
  workflowState,
  role,
  orgId,
  mode,
  stats,
}: {
  slug: string;
  projectId: string;
  project: ProjectRow;
  milestones: MilestoneRow[];
  owner: OwnerRow;
  escrow: EscrowRow;
  workflowState: WorkflowState;
  role: WorkflowRole;
  orgId: string;
  mode: OrkaCustodyMode;
  stats: MilestoneStats;
}) {
  const [view, setView] = useState<"list" | "board">("list");
  const [addOpen, setAddOpen] = useState(false);
  const router = useRouter();

  const contractAddress = escrow?.contract_address ?? "";
  const milestonePos = (id: string): number => {
    const idx = milestones.findIndex((m) => m.id === id);
    if (idx === -1) return 0;
    return milestones[idx].position ?? idx + 1;
  };

  const handleSubmitMilestone = async (milestoneId: string) => {
    const result = await submitMilestone({
      orgId, projectId, contractAddress,
      milestonePos: milestonePos(milestoneId), mode,
    });
    if (result.ok) router.refresh();
  };
  const handleApproveMilestone = async (milestoneId: string) => {
    const result = await approveMilestone({
      orgId, projectId, contractAddress,
      milestonePos: milestonePos(milestoneId), mode,
    });
    if (result.ok) router.refresh();
  };
  const handleRejectMilestone = async (milestoneId: string) => {
    const result = await rejectMilestone({
      orgId, projectId, contractAddress,
      milestonePos: milestonePos(milestoneId), mode,
    });
    if (result.ok) router.refresh();
  };
  const handleReleaseMilestone = async (milestoneId: string) => {
    const result = await releaseMilestone({
      orgId, projectId, contractAddress,
      milestonePos: milestonePos(milestoneId), mode,
    });
    if (result.ok) router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {stats.totalMilestones} milestone{stats.totalMilestones !== 1 ? "s" : ""}
            {stats.totalBudget > 0 ? ` · ${Number(stats.totalBudget).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${stats.milestoneAsset} total` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === "list"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutList className="h-3.5 w-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setView("board")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                view === "board"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Board
            </button>
          </div>
          <AddMilestoneButton
            onComplete={async (data) => {
              await saveMilestones({ orgId, projectId, milestones: [data] });
              router.refresh();
            }}
          />
        </div>
      </div>

      {/* Progress bar */}
      <MilestoneProgressOverview stats={stats} />

      {/* Main content: list/board + payment flow + sidebar */}
      {milestones.length === 0 ? (
        <MilestoneEmptyState onAdd={() => setAddOpen(true)} />
      ) : (
        <div className="space-y-5">
          {view === "list" ? (
            <MilestoneTable
              milestones={milestones}
              onSubmitMilestone={handleSubmitMilestone}
              onApprove={handleApproveMilestone}
              onReject={handleRejectMilestone}
              onRelease={handleReleaseMilestone}
            />
          ) : (
            <BoardView
              milestones={milestones}
              state={workflowState}
              role={role}
              onSubmitMilestone={handleSubmitMilestone}
            />
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="flex flex-col gap-5 lg:col-span-2">
              <MilestonePaymentFlow
                milestones={milestones}
                state={workflowState}
                role={role}
                contractAddress={escrow?.contract_address ?? ""}
                onApprove={handleApproveMilestone}
                onReject={handleRejectMilestone}
                onRelease={handleReleaseMilestone}
              />
            </div>
            <div className="flex flex-col gap-4">
              <MilestoneSummaryCard stats={stats} owner={owner} />
              <EscrowDetailsCard escrow={escrow} slug={slug} projectId={projectId} />
              <UpcomingMilestonesCard milestones={milestones} slug={slug} projectId={projectId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
