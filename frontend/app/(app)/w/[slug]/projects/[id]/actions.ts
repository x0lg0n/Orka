// frontend/app/(app)/w/[slug]/projects/[id]/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { orkaClient, type OrkaCustodyMode } from "@/lib/stellar";
import { blocksToMarkdown } from "@/lib/proposalBlocks";
import { buildContractTemplate, PROPOSAL_TEMPLATE } from "@/lib/contractTemplates";

// Intentionally does NOT write chain-derived status. It records the local-side
// signature intent hash so the UI can show "signed (pending on-chain)"; the
// Rust indexer flips the real status once the tx confirms. The SDK/backend
// `signContract` method is wired in Phase 6 — until then we hit the backend's
// signature route (same shape `orkaClient` forwards to) and store the returned
// hash.
export async function signContract(input: {
  orgId: string;
  projectId: string;
  signer: "agency" | "client";
  mode: OrkaCustodyMode;
}): Promise<{ ok: true; txHash: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${process.env.SERVICES_URL ?? ""}/escrow/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: input.projectId,
        signer: input.signer,
        mode: input.mode,
      }),
    });
    if (!res.ok) throw new Error(`signContract failed: ${res.status}`);
    const data = (await res.json()) as { txHash?: string; sig?: string };
    const txHash = data.txHash ?? data.sig ?? "";

    const supabase = await createClient();
    const col = input.signer === "agency" ? "freelancer_sig" : "client_sig";
    await supabase
      .from("projects")
      .update({ [col]: txHash })
      .eq("id", input.projectId)
      .eq("org_id", input.orgId);

    return { ok: true, txHash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "signContract failed" };
  }
}

// Intentionally does NOT write chain-derived escrow status. The indexer writes
// `escrow_contracts.total_funded`. The SDK `fundEscrow` exists; we forward the
// call and return the tx hash (or XDR for freighter mode) for the UI to show
// "Funding… awaiting confirmation".
export async function fundEscrow(input: {
  orgId: string;
  projectId: string;
  contractAddress: string;
  amount: number;
  milestoneIds?: number[];
  mode: OrkaCustodyMode;
}): Promise<{ ok: true; txHash: string } | { ok: false; error: string }> {
  try {
    const client = orkaClient(input.mode);
    const res = await client.fundEscrow({
      contractId: input.contractAddress,
      milestoneIds: input.milestoneIds ?? [],
    });
    const txHash = "txHash" in res ? (res as { txHash: string }).txHash : "";
    return { ok: true, txHash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "fundEscrow failed" };
  }
}

// Intentionally does NOT write chain-derived milestone status. The indexer
// flips `milestones.status` once the tx confirms. Returns the tx hash (or XDR)
// so the UI can show "Pending confirmation".
export async function submitMilestone(input: {
  orgId: string;
  projectId: string;
  contractAddress: string;
  milestonePos: number;
  mode: OrkaCustodyMode;
}): Promise<{ ok: true; txHash: string } | { ok: false; error: string }> {
  try {
    const client = orkaClient(input.mode);
    const res = await client.submitMilestone({
      contractId: input.contractAddress,
      milestoneId: input.milestonePos,
    });
    const txHash = "txHash" in res ? res.txHash : "";
    return { ok: true, txHash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "submitMilestone failed" };
  }
}

export async function approveMilestone(input: {
  orgId: string;
  projectId: string;
  contractAddress: string;
  milestonePos: number;
  mode: OrkaCustodyMode;
}): Promise<{ ok: true; txHash: string } | { ok: false; error: string }> {
  try {
    const client = orkaClient(input.mode);
    const res = await client.approveMilestone({
      contractId: input.contractAddress,
      milestoneId: input.milestonePos,
    });
    const txHash = "txHash" in res ? res.txHash : "";
    return { ok: true, txHash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "approveMilestone failed" };
  }
}

export async function rejectMilestone(input: {
  orgId: string;
  projectId: string;
  contractAddress: string;
  milestonePos: number;
  mode: OrkaCustodyMode;
}): Promise<{ ok: true; txHash: string } | { ok: false; error: string }> {
  try {
    const client = orkaClient(input.mode);
    const res = await client.rejectMilestone({
      contractId: input.contractAddress,
      milestoneId: input.milestonePos,
    });
    const txHash = "txHash" in res ? res.txHash : "";
    return { ok: true, txHash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "rejectMilestone failed" };
  }
}

// Multi-sig release: the backend's /escrow/release requires BOTH the client
// KMS sig and the operator inner sig (release_funds). This path never weakens
// that — we only forward the call and return the tx hash for "Pending…".
export async function releaseMilestone(input: {
  orgId: string;
  projectId: string;
  contractAddress: string;
  milestonePos: number;
  mode: OrkaCustodyMode;
}): Promise<{ ok: true; txHash: string } | { ok: false; error: string }> {
  try {
    const client = orkaClient(input.mode);
    const res = await client.releaseMilestone({
      contractId: input.contractAddress,
      milestoneId: input.milestonePos,
    });
    const txHash = "txHash" in res ? res.txHash : "";
    return { ok: true, txHash };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "releaseMilestone failed" };
  }
}

async function resolveOrgId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string
): Promise<string | null> {
  // The client passes orgId: "" by design; the authenticated server client
  // re-derives the org from the project via RLS rather than trusting input.
  const { data } = await supabase
    .from("projects")
    .select("org_id")
    .eq("id", projectId)
    .maybeSingle();
  return (data?.org_id as string | undefined) ?? null;
}

async function nextVersionNo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  proposalId: string
): Promise<number> {
  const { data } = await supabase
    .from("proposal_versions")
    .select("version_no")
    .eq("proposal_id", proposalId)
    .order("version_no", { ascending: false })
    .limit(1);
  if (!data || data.length === 0) return 1;
  return (data[0].version_no as number) + 1;
}

async function nextContractVersionNo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contractId: string
): Promise<number> {
  const { data } = await supabase
    .from("contract_versions")
    .select("version_no")
    .eq("contract_id", contractId)
    .order("version_no", { ascending: false })
    .limit(1);
  if (!data || data.length === 0) return 1;
  return (data[0].version_no as number) + 1;
}

// Proposals are NOT chain-derived, so writing proposal status from this action
// is allowed. It never writes milestone/escrow/contract chain status.
export async function saveProposal(input: {
  orgId: string;
  projectId: string;
  title: string;
  blocks: unknown[];
  tags: string[];
  summary?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const markdown = blocksToMarkdown(input.blocks);
    const orgId = await resolveOrgId(supabase, input.projectId);
    if (!orgId) throw new Error("Project org not found");

    const { data: existing } = await supabase
      .from("project_proposals")
      .select("id")
      .eq("org_id", orgId)
      .eq("project_id", input.projectId)
      .maybeSingle();

    let proposalId: string;
    if (!existing) {
      const { data: created, error } = await supabase
        .from("project_proposals")
        .insert({
          org_id: orgId,
          project_id: input.projectId,
          title: input.title,
          blocks: input.blocks,
          markdown,
          tags: input.tags,
          status: "draft",
        })
        .select("id")
        .single();
      if (error || !created) throw new Error(error?.message ?? "insert failed");
      proposalId = created.id as string;
    } else {
      proposalId = existing.id as string;
      const { error } = await supabase
        .from("project_proposals")
        .update({
          title: input.title,
          blocks: input.blocks,
          markdown,
          tags: input.tags,
        })
        .eq("id", proposalId)
        .eq("org_id", orgId);
      if (error) throw new Error(error.message);
    }

    const versionNo = await nextVersionNo(supabase, proposalId);
    const { error: vErr } = await supabase.from("proposal_versions").insert({
      proposal_id: proposalId,
      org_id: orgId,
      version_no: versionNo,
      title: input.title,
      blocks: input.blocks,
      markdown,
      summary: input.summary ?? null,
    });
    if (vErr) throw new Error(vErr.message);

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "saveProposal failed" };
  }
}

export async function createProposal(input: {
  projectId: string;
  orgId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const blocks = PROPOSAL_TEMPLATE as unknown[];
    const markdown = blocksToMarkdown(blocks);

    const { error } = await supabase.from("project_proposals").insert({
      org_id: input.orgId,
      project_id: input.projectId,
      title: "Untitled proposal",
      blocks,
      markdown,
      tags: [],
      status: "draft",
    });
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "createProposal failed",
    };
  }
}

export async function signProposalAgency(input: {
  projectId: string;
  orgId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const sig = user?.id ?? "signed";

    const { error } = await supabase
      .from("project_proposals")
      .update({
        agency_sig: sig,
        agency_signed_at: new Date().toISOString(),
        status: "sent",
      })
      .eq("project_id", input.projectId)
      .eq("org_id", input.orgId)
      .eq("status", "draft");
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "signProposalAgency failed",
    };
  }
}

export async function sendProposal(input: {
  orgId: string;
  projectId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const orgId = await resolveOrgId(supabase, input.projectId);
    if (!orgId) throw new Error("Project org not found");
    const { error } = await supabase
      .from("project_proposals")
      .update({ status: "sent" })
      .eq("org_id", orgId)
      .eq("project_id", input.projectId)
      .eq("status", "draft");
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "sendProposal failed" };
  }
}

export async function restoreProposalVersion(input: {
  orgId: string;
  projectId: string;
  versionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const orgId = await resolveOrgId(supabase, input.projectId);
    if (!orgId) throw new Error("Project org not found");
    const { data: ver, error: vErr } = await supabase
      .from("proposal_versions")
      .select("proposal_id, title, blocks, markdown")
      .eq("id", input.versionId)
      .single();
    if (vErr || !ver) throw new Error(vErr?.message ?? "version not found");

    const { error: uErr } = await supabase
      .from("project_proposals")
      .update({ title: ver.title, blocks: ver.blocks, markdown: ver.markdown })
      .eq("id", ver.proposal_id)
      .eq("org_id", orgId);
    if (uErr) throw new Error(uErr.message);

    const versionNo = await nextVersionNo(supabase, ver.proposal_id as string);
    const { error: iErr } = await supabase.from("proposal_versions").insert({
      proposal_id: ver.proposal_id,
      org_id: orgId,
      version_no: versionNo,
      title: ver.title as string,
      blocks: ver.blocks,
      markdown: ver.markdown as string,
      summary: "Restored from earlier version",
    });
    if (iErr) throw new Error(iErr.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "restoreProposalVersion failed",
    };
  }
}

export async function generateContract(input: {
  projectId: string;
  orgId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();

    const { data: project, error: projErr } = await supabase
      .from("projects")
      .select("title, client_name")
      .eq("id", input.projectId)
      .eq("org_id", input.orgId)
      .maybeSingle();
    if (projErr) throw new Error(`project query: ${projErr.message}`);
    if (!project) throw new Error("Project not found");

    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", input.orgId)
      .single();

    const { data: proposal } = await supabase
      .from("project_proposals")
      .select("title, blocks, tags, markdown")
      .eq("org_id", input.orgId)
      .eq("project_id", input.projectId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const deliverables: string[] = (proposal?.tags ?? []).filter((t: string) => !t.includes(":"));

    const templateData = {
      projectName: (project.title as string) ?? "Project",
      orgName: (org?.name as string) ?? "Agency",
      clientName: (project.client_name as string) ?? "Client",
      amount: "",
      asset: "XLM",
      deliverables,
      milestoneCount: 0,
      today: new Date().toISOString().split("T")[0],
    };

    const blocks = buildContractTemplate(templateData);
    const markdown = blocksToMarkdown(blocks as unknown[]);

    const { data: existing } = await supabase
      .from("project_contracts")
      .select("id")
      .eq("project_id", input.projectId)
      .eq("org_id", input.orgId)
      .maybeSingle();

    if (existing) {
      return { ok: true };
    }

    const { error } = await supabase.from("project_contracts").insert({
      project_id: input.projectId,
      org_id: input.orgId,
      blocks,
      markdown,
      status: "draft",
    });
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "generateContract failed",
    };
  }
}

export async function saveContract(input: {
  projectId: string;
  orgId: string;
  blocks: unknown[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();

    const markdown = blocksToMarkdown(input.blocks);

    const { data: contract } = await supabase
      .from("project_contracts")
      .update({ blocks: input.blocks, markdown, updated_at: new Date().toISOString() })
      .eq("project_id", input.projectId)
      .eq("org_id", input.orgId)
      .select("id")
      .single();
    if (!contract) throw new Error("Contract not found");

    const versionNo = await nextContractVersionNo(supabase, contract.id);
    const { error: ve } = await supabase.from("contract_versions").insert({
      contract_id: contract.id,
      org_id: input.orgId,
      version_no: versionNo,
      blocks: input.blocks,
      markdown,
    });
    if (ve) throw new Error(ve.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "saveContract failed",
    };
  }
}

export async function restoreContractVersion(input: {
  projectId: string;
  orgId: string;
  versionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const { data: version, error: vErr } = await supabase
      .from("contract_versions")
      .select("blocks, markdown")
      .eq("id", input.versionId)
      .single();
    if (vErr || !version) throw new Error("Version not found");

    const { error } = await supabase
      .from("project_contracts")
      .update({
        blocks: version.blocks,
        markdown: version.markdown,
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", input.projectId)
      .eq("org_id", input.orgId);
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "restoreContractVersion failed",
    };
  }
}

export async function signContractAgency(input: {
  projectId: string;
  orgId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    const sig = user?.id ?? "signed";

    const { error } = await supabase
      .from("project_contracts")
      .update({
        agency_sig: sig,
        agency_signed_at: new Date().toISOString(),
        status: "agency_signed",
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", input.projectId)
      .eq("org_id", input.orgId);
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "signContractAgency failed",
    };
  }
}

export async function saveMilestones(input: {
  orgId: string;
  projectId: string;
  milestones: Array<{
    name: string;
    description: string;
    dueDate: string;
    amount: string;
    asset: string;
  }>;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const rows = input.milestones.map((m, i) => ({
      org_id: input.orgId,
      project_id: input.projectId,
      title: m.name,
      description: m.description || null,
      amount: Number(m.amount),
      asset: m.asset,
      status: "draft" as const,
      due_date: m.dueDate || null,
      position: i,
    }));
    const { error } = await supabase.from("milestones").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "saveMilestones failed" };
  }
}

export async function deployEscrow(input: {
  orgId: string;
  projectId: string;
  asset: string;
  milestoneIds: string[];
  mode: OrkaCustodyMode;
}): Promise<{ ok: true; contractAddress: string } | { ok: false; error: string }> {
  try {
    const res = await fetch(`${process.env.SERVICES_URL ?? ""}/escrow/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: input.projectId,
        milestone_ids: input.milestoneIds,
        asset: input.asset,
        mode: input.mode,
      }),
    });
    if (!res.ok) throw new Error(`deployEscrow failed: ${res.status}`);
    const data = (await res.json()) as { contract_address?: string; contractAddress?: string };
    const contractAddress = data.contract_address ?? data.contractAddress ?? "";

    const supabase = await createClient();
    const { error } = await supabase.from("escrow_contracts").insert({
      contract_address: contractAddress,
      org_id: input.orgId,
      project_id: input.projectId,
      status: "deployed",
      asset: input.asset,
      total_amount: 0,
      total_funded: 0,
      deployed_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);

    return { ok: true, contractAddress };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "deployEscrow failed" };
  }
}
