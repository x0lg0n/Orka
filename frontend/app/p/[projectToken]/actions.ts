// frontend/app/p/[projectToken]/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { getPortalProject } from "@/lib/portal";
import { orkaClient, type OrkaCustodyMode } from "@/lib/stellar";

// Public, unauthenticated client portal actions.
//
// These mirror the authenticated workspace actions in
// `app/(app)/w/[slug]/projects/[id]/actions.ts` but resolve the
// project by its share token (via `getPortalProject`) instead of through
// the RLS-scoped workspace client. They intentionally do NOT write any
// chain-derived status — they only forward the chain call and return the
// tx hash (or XDR for freighter mode) so the portal UI can show
// "Pending confirmation…". The Rust indexer remains the single writer of
// milestone/escrow status.

type ActionResult = { ok: true; txHash: string } | { ok: false; error: string };

function txHashOf(res: unknown): string {
  const r = res as { txHash?: string; txXdr?: string };
  if (typeof r.txHash === "string") return r.txHash;
  if (typeof r.txXdr === "string") return r.txXdr;
  return "";
}

export async function portalSignContract(input: {
  token: string;
  mode: OrkaCustodyMode;
}): Promise<ActionResult> {
  try {
    const project = await getPortalProject(input.token);
    if (!project) return { ok: false, error: "Project not found" };

    const res = await fetch(`${process.env.SERVICES_URL ?? ""}/escrow/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: project.id,
        signer: "client",
        mode: input.mode,
      }),
    });
    if (!res.ok) throw new Error(`portalSignContract failed: ${res.status}`);
    const data = (await res.json()) as { txHash?: string; sig?: string };
    return { ok: true, txHash: data.txHash ?? data.sig ?? "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "portalSignContract failed" };
  }
}

export async function portalFundEscrow(input: {
  token: string;
  contractAddress: string;
  amount: number;
  milestoneIds: number[];
  mode: OrkaCustodyMode;
}): Promise<ActionResult> {
  try {
    const project = await getPortalProject(input.token);
    if (!project) return { ok: false, error: "Project not found" };

    const client = orkaClient(input.mode);
    const res = await client.fundEscrow({
      contractId: input.contractAddress,
      milestoneIds: input.milestoneIds,
    });
    return { ok: true, txHash: txHashOf(res) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "portalFundEscrow failed" };
  }
}

export async function portalApproveMilestone(input: {
  token: string;
  contractAddress: string;
  milestonePos: number;
  mode: OrkaCustodyMode;
}): Promise<ActionResult> {
  try {
    const project = await getPortalProject(input.token);
    if (!project) return { ok: false, error: "Project not found" };

    const client = orkaClient(input.mode);
    const res = await client.approveMilestone({
      contractId: input.contractAddress,
      milestoneId: input.milestonePos,
    });
    return { ok: true, txHash: txHashOf(res) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "portalApproveMilestone failed" };
  }
}

export async function portalReleaseMilestone(input: {
  token: string;
  contractAddress: string;
  milestonePos: number;
  mode: OrkaCustodyMode;
}): Promise<ActionResult> {
  try {
    const project = await getPortalProject(input.token);
    if (!project) return { ok: false, error: "Project not found" };

    const client = orkaClient(input.mode);
    // Multi-sig release: the backend's /escrow/release requires BOTH the
    // client KMS sig and the operator inner sig. This path only forwards
    // the call and never weakens that requirement.
    const res = await client.releaseMilestone({
      contractId: input.contractAddress,
      milestoneId: input.milestonePos,
    });
    return { ok: true, txHash: txHashOf(res) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "portalReleaseMilestone failed" };
  }
}

// Proposals are NOT chain-derived, so writing proposal status from this action
// is allowed. Accepting the proposal advances the workflow to Contract stage
// (deriveWorkflowState gates on proposal acceptance); requesting changes is a
// soft state the agency picks up and re-sends.
export async function portalAcceptProposal(input: {
  token: string;
}): Promise<ActionResult> {
  try {
    const project = await getPortalProject(input.token);
    if (!project) return { ok: false, error: "Project not found" };
    const supabase = await createClient();
    const { error } = await supabase
      .from("project_proposals")
      .update({
        status: "accepted",
        client_sig: "portal_accept",
        client_signed_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
      })
      .eq("project_id", project.id);
    if (error) throw new Error(error.message);
    return { ok: true, txHash: "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "portalAcceptProposal failed" };
  }
}

export async function portalRequestChanges(input: {
  token: string;
  note: string;
}): Promise<ActionResult> {
  try {
    const project = await getPortalProject(input.token);
    if (!project) return { ok: false, error: "Project not found" };
    const supabase = await createClient();
    const { error } = await supabase
      .from("project_proposals")
      .update({ status: "changes_requested" })
      .eq("project_id", project.id);
    if (error) throw new Error(error.message);
    return { ok: true, txHash: "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "portalRequestChanges failed" };
  }
}
