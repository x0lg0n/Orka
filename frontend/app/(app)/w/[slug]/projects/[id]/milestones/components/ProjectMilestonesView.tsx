"use client";

import { useState } from "react";
import { Plus, LayoutList, LayoutGrid } from "lucide-react";
import { MilestoneProgressOverview } from "./MilestoneProgressOverview";
import { MilestoneTable } from "./MilestoneTable";
import { MilestoneSummaryCard } from "./MilestoneSummaryCard";
import { EscrowDetailsCard } from "./EscrowDetailsCard";
import { UpcomingMilestonesCard } from "./UpcomingMilestonesCard";
import { MilestonePaymentFlow } from "./MilestonePaymentFlow";
import { AddMilestoneModal } from "./AddMilestoneModal";
import { BoardView } from "./BoardView";
import { MilestoneEmptyState } from "./MilestoneEmptyState";
import type { WorkflowRole, WorkflowState } from "@/lib/workflow";

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
  onSubmitMilestone,
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
  onSubmitMilestone: (milestoneId: string) => Promise<void>;
  stats: MilestoneStats;
}) {
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<"list" | "board">("list");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Track deliverables, approvals and payments
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
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
          >
            <Plus className="h-4 w-4" />
            New Milestone
          </button>
        </div>
      </div>

      <MilestoneProgressOverview stats={stats} />

      {milestones.length === 0 ? (
        <MilestoneEmptyState onAdd={() => setShowModal(true)} />
      ) : view === "list" ? (
        <MilestoneTable milestones={milestones} onAdd={() => setShowModal(true)} />
      ) : (
        <BoardView
          milestones={milestones}
          state={workflowState}
          role={role}
          onSubmitMilestone={onSubmitMilestone}
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <MilestonePaymentFlow />
        </div>
        <div className="flex flex-col gap-4">
          <MilestoneSummaryCard stats={stats} owner={owner} />
          <EscrowDetailsCard
            escrow={escrow}
            slug={slug}
            projectId={projectId}
          />
          <UpcomingMilestonesCard
            milestones={milestones}
            slug={slug}
            projectId={projectId}
          />
        </div>
      </div>

      <AddMilestoneModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
