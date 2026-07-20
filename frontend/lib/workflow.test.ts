// frontend/lib/workflow.test.ts
import { describe, it, expect } from "vitest";
import { deriveWorkflowState, nextActionsForRole, type WorkflowAction } from "./workflow";
import type { MilestoneStatus } from "./orka";

const ms = (status: MilestoneStatus) => ({ status });

describe("deriveWorkflowState", () => {
  it("draft when nothing exists", () => {
    expect(deriveWorkflowState({ milestones: [] }).stage).toBe("draft");
  });
  it("proposal_sent once proposal is sent", () => {
    expect(deriveWorkflowState({ proposal: { status: "sent" }, milestones: [] }).stage).toBe("proposal_sent");
  });
  it("contract_signed when both sigs present", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    expect(deriveWorkflowState({ contract, milestones: [] }).stage).toBe("contract_signed");
  });
  it("escrow_funded when escrow address + funded amount present", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = { contract_address: "C123", total_funded: 8000, total_amount: 8000 };
    expect(deriveWorkflowState({ contract, escrow, milestones: [ms("funded")] }).stage).toBe("escrow_funded");
  });
  it("milestones_active when escrow funded and a milestone is in review", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = { contract_address: "C123", total_funded: 8000, total_amount: 8000 };
    expect(deriveWorkflowState({ contract, escrow, milestones: [ms("in_review")] }).stage).toBe("milestones_active");
  });
  it("completed when all milestones released", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = { contract_address: "C123", total_funded: 8000, total_amount: 8000 };
    expect(deriveWorkflowState({ contract, escrow, milestones: [ms("released"), ms("released")] }).stage).toBe("completed");
  });
});

describe("nextActionsForRole", () => {
  it("client can fund escrow only at contract_signed", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const state = deriveWorkflowState({ contract, milestones: [] });
    const acts: WorkflowAction[] = nextActionsForRole(state, "client");
    expect(acts).toContain("fund_escrow");
    expect(acts).not.toContain("release_milestone");
  });
  it("agency cannot release before escrow funded", () => {
    const state = deriveWorkflowState({ milestones: [] });
    expect(nextActionsForRole(state, "agency")).not.toContain("release_milestone");
  });
  it("client can release only when a milestone is approved", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = { contract_address: "C123", total_funded: 8000, total_amount: 8000 };
    const state = deriveWorkflowState({ contract, escrow, milestones: [ms("approved")] });
    expect(nextActionsForRole(state, "client")).toContain("release_milestone");
  });
});
