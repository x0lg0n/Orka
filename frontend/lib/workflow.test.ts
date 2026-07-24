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
    expect(
      deriveWorkflowState({ proposal: { status: "sent" }, milestones: [] }).stage,
    ).toBe("proposal_sent");
  });
  it("proposal_accepted when proposal is accepted", () => {
    expect(
      deriveWorkflowState({ proposal: { status: "accepted" }, milestones: [] }).stage,
    ).toBe("proposal_accepted");
  });
  it("contract_signed when both sigs present", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    expect(deriveWorkflowState({ contract, milestones: [] }).stage).toBe("contract_signed");
  });
  it("milestone_setup when contract signed and milestones exist", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    expect(
      deriveWorkflowState({ contract, milestones: [ms("draft")] }).stage,
    ).toBe("milestone_setup");
  });
  it("escrow_deployed when escrow has contract_address and deployed_at", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = { contract_address: "C123", deployed_at: "2026-01-01" };
    expect(
      deriveWorkflowState({ contract, escrow, milestones: [ms("draft")] }).stage,
    ).toBe("escrow_deployed");
  });
  it("escrow_funded when escrow deployed and fully funded", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = {
      contract_address: "C123",
      deployed_at: "2026-01-01",
      total_funded: 8000,
      total_amount: 8000,
    };
    expect(
      deriveWorkflowState({ contract, escrow, milestones: [ms("funded")] }).stage,
    ).toBe("escrow_funded");
  });
  it("milestones_active when escrow funded and a milestone is in review", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = {
      contract_address: "C123",
      deployed_at: "2026-01-01",
      total_funded: 8000,
      total_amount: 8000,
    };
    expect(
      deriveWorkflowState({ contract, escrow, milestones: [ms("in_review")] }).stage,
    ).toBe("milestones_active");
  });
  it("completed when all milestones released", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = {
      contract_address: "C123",
      deployed_at: "2026-01-01",
      total_funded: 8000,
      total_amount: 8000,
    };
    expect(
      deriveWorkflowState({
        contract,
        escrow,
        milestones: [ms("released"), ms("released")],
      }).stage,
    ).toBe("completed");
  });
});

describe("nextActionsForRole", () => {
  it("agency can setup_milestones at contract_signed", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const state = deriveWorkflowState({ contract, milestones: [] });
    const acts: WorkflowAction[] = nextActionsForRole(state, "agency");
    expect(acts).toContain("setup_milestones");
  });
  it("agency can deploy_escrow at milestone_setup", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const state = deriveWorkflowState({ contract, milestones: [ms("draft")] });
    const acts: WorkflowAction[] = nextActionsForRole(state, "agency");
    expect(acts).toContain("deploy_escrow");
  });
  it("client can fund_escrow at escrow_deployed", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = { contract_address: "C123", deployed_at: "2026-01-01" };
    const state = deriveWorkflowState({ contract, escrow, milestones: [ms("draft")] });
    const acts: WorkflowAction[] = nextActionsForRole(state, "client");
    expect(acts).toContain("fund_escrow");
  });
  it("agency cannot release before escrow funded", () => {
    const state = deriveWorkflowState({ milestones: [] });
    expect(nextActionsForRole(state, "agency")).not.toContain("release_milestone");
  });
  it("client can release only when a milestone is approved", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = {
      contract_address: "C123",
      deployed_at: "2026-01-01",
      total_funded: 8000,
      total_amount: 8000,
    };
    const state = deriveWorkflowState({ contract, escrow, milestones: [ms("approved")] });
    expect(nextActionsForRole(state, "client")).toContain("release_milestone");
  });
});
