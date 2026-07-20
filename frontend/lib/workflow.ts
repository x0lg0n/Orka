// frontend/lib/workflow.ts
import type { MilestoneStatus } from "./orka";

export type ProjectStage =
  | "draft" | "proposal_sent" | "contract_signed" | "escrow_funded" | "milestones_active" | "completed";
export type WorkflowRole = "agency" | "client";
export type WorkflowAction =
  | "send_proposal" | "accept_proposal" | "create_contract" | "sign_contract_agency"
  | "sign_contract_client" | "fund_escrow" | "submit_milestone" | "approve_milestone"
  | "reject_milestone" | "release_milestone" | "open_dispute" | "resolve_dispute";

export interface WorkflowInput {
  proposal?: { status?: string } | null;
  contract?: { client_sig?: string | null; freelancer_sig?: string | null; status?: string } | null;
  escrow?: { contract_address?: string | null; total_funded?: number; total_amount?: number } | null;
  milestones: { status: MilestoneStatus | string }[];
}
export interface WorkflowState {
  stage: ProjectStage;
  fullyReleased: boolean;
  anyFunded: boolean;
  anyDisputed: boolean;
  hasApproved: boolean;
  hasSubmitted: boolean;
}

export function deriveWorkflowState(input: WorkflowInput): WorkflowState {
  const proposalSent = !!input.proposal && input.proposal.status === "sent";
  const contractSigned =
    !!input.contract && !!input.contract.client_sig && !!input.contract.freelancer_sig &&
    input.contract.status === "signed";
  const escrowFunded =
    !!input.escrow && !!input.escrow.contract_address &&
    (input.escrow.total_funded ?? 0) > 0 &&
    input.escrow.total_funded! >= (input.escrow.total_amount ?? 0);

  const anyFunded = input.milestones.some((m) => m.status !== "draft");
  const hasSubmitted = input.milestones.some((m) => m.status === "submitted" || m.status === "in_review");
  const hasApproved = input.milestones.some((m) => m.status === "approved");
  const anyDisputed = input.milestones.some((m) => m.status === "disputed");
  const fullyReleased =
    input.milestones.length > 0 &&
    input.milestones.every((m) => m.status === "released" || m.status === "refunded");

  let stage: ProjectStage;
  if (fullyReleased && escrowFunded) stage = "completed";
  else if (escrowFunded && (hasSubmitted || hasApproved || anyDisputed)) stage = "milestones_active";
  else if (escrowFunded) stage = "escrow_funded";
  else if (contractSigned) stage = "contract_signed";
  else if (proposalSent) stage = "proposal_sent";
  else stage = "draft";

  return { stage, fullyReleased, anyFunded, anyDisputed, hasApproved, hasSubmitted };
}

export function getProjectStage(input: WorkflowInput): ProjectStage {
  return deriveWorkflowState(input).stage;
}

export function nextActionsForRole(state: WorkflowState, role: WorkflowRole): WorkflowAction[] {
  const acts: WorkflowAction[] = [];
  if (state.stage === "draft" && role === "agency") acts.push("send_proposal");
  if (state.stage === "proposal_sent" && role === "client") acts.push("accept_proposal");
  if (state.stage === "proposal_sent" && role === "agency") acts.push("create_contract", "sign_contract_agency");
  if (state.stage === "contract_signed") {
    if (role === "agency") acts.push("sign_contract_agency");
    if (role === "client") acts.push("sign_contract_client", "fund_escrow");
  }
  if (state.stage === "escrow_funded" || state.stage === "milestones_active") {
    if (role === "agency") acts.push("submit_milestone", "open_dispute");
    if (role === "client") {
      acts.push("approve_milestone", "reject_milestone", "open_dispute");
      if (state.hasApproved) acts.push("release_milestone");
    }
  }
  if (state.anyDisputed && role === "agency") acts.push("resolve_dispute");
  return acts;
}
