"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { fakeTx, getActiveOrgId } from "../lib/orka";
import { callServices } from "../lib/backend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SERVICES_URL = process.env.SERVICES_URL;

const EVENT_PATH: Record<string, string | undefined> = {
  fund: "/escrow/fund",
  submit: "/escrow/submit",
  approve: "/escrow/approve",
  release: "/escrow/release",
};

async function onChainTx(
  supabase: Awaited<ReturnType<typeof createClient>>,
  _orgId: string,
  projectId: string,
  milestoneId: string,
  eventType: string,
  _amount: number,
): Promise<string> {
  if (!SERVICES_URL) return fakeTx();
  const path = EVENT_PATH[eventType];
  if (!path) return fakeTx();

  const userId = (await supabase.auth.getUser()).data.user?.id ?? "";
  const { data: profile } = await supabase
    .from("profiles")
    .select("id,custody_mode")
    .eq("id", userId)
    .maybeSingle();
  if (profile?.custody_mode !== "orka") return fakeTx();

  const { data: proj } = await supabase
    .from("projects")
    .select("contract_id")
    .eq("id", projectId)
    .maybeSingle();
  if (!proj?.contract_id) return fakeTx();

  const { data: m } = await supabase
    .from("milestones")
    .select("chain_index")
    .eq("id", milestoneId)
    .maybeSingle();

  const milestoneKey = eventType === "fund" ? "milestone_ids" : "milestone_id";
  const body: Record<string, unknown> = {
    contract_id: proj.contract_id,
    mode: "orka",
    user_id: profile.id,
    [milestoneKey]:
      eventType === "fund"
        ? [Number(m?.chain_index ?? 0)]
        : Number(m?.chain_index ?? 0),
  };

  try {
    const r = await callServices(path, body);
    return r.tx_hash ?? fakeTx();
  } catch {
    return fakeTx();
  }
}

export async function createOrg(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const name = String(formData.get("name") || "").trim();
  if (!name) {
    redirect("/onboarding?error=Workspace name is required.");
  }

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({ name })
    .select("id")
    .single();
  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  await supabase
    .from("organization_members")
    .insert({ org_id: org.id, user_id: user.id, role: "owner" });

  revalidatePath("/projects");
  redirect("/projects");
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const clientName = String(formData.get("clientName") || "").trim();
  const clientEmail = String(formData.get("clientEmail") || "").trim();
  const freelancerName = String(formData.get("freelancerName") || "").trim();
  const freelancerEmail = String(formData.get("freelancerEmail") || "").trim();

  if (!title) redirect("/projects/new?error=Project title is required.");
  if (clientEmail && !EMAIL_RE.test(clientEmail))
    redirect("/projects/new?error=Client email is invalid.");
  if (freelancerEmail && !EMAIL_RE.test(freelancerEmail))
    redirect("/projects/new?error=Freelancer email is invalid.");

  const { error } = await supabase.from("projects").insert({
    org_id: orgId,
    title,
    description,
    client_name: clientName,
    client_email: clientEmail,
    freelancer_name: freelancerName,
    freelancer_email: freelancerEmail,
    status: "draft",
  });
  if (error) redirect(`/projects/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/projects");
  redirect("/projects");
}

export async function addMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const projectId = String(formData.get("projectId") || "");
  const title = String(formData.get("title") || "").trim();
  const amount = Number(formData.get("amount"));

  if (!projectId) redirect(`/projects?error=Missing project.`);
  if (!title) redirect(`/${projectId}?error=Milestone title is required.`);
  if (!Number.isFinite(amount) || amount <= 0)
    redirect(`/${projectId}?error=Amount must be greater than 0.`);

  const { error } = await supabase.from("milestones").insert({
    org_id: orgId,
    project_id: projectId,
    title,
    amount,
    status: "draft",
  });
  if (error) redirect(`/${projectId}?error=${encodeURIComponent(error.message)}`);

  revalidatePath(`/projects/${projectId}`);
}

async function recordLedger(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  projectId: string,
  milestoneId: string,
  eventType: string,
  amount: number,
  chainTx: string,
) {
  await supabase.from("ledger_events").insert({
    org_id: orgId,
    project_id: projectId,
    milestone_id: milestoneId,
    chain_tx: chainTx,
    event_type: eventType,
    amount,
    asset: "USDC",
    status: "confirmed",
  });
}

export async function fundMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "funded" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error || !m) redirect(`/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  const tx = await onChainTx(supabase, orgId, m.project_id, id, "fund", Number(m.amount));
  await recordLedger(supabase, orgId, m.project_id, id, "fund", Number(m.amount), tx);
  revalidatePath(`/projects/${m.project_id}`);
}

export async function submitMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "in_review" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id")
    .single();
  if (error || !m) redirect(`/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  revalidatePath(`/projects/${m.project_id}`);
}

export async function releaseMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "released" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error || !m) redirect(`/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);

  const tx = await onChainTx(supabase, orgId, m.project_id, id, "release", Number(m.amount));
  await recordLedger(supabase, orgId, m.project_id, id, "release", Number(m.amount), tx);
  const { data: proj } = await supabase
    .from("projects")
    .select("title, client_name, freelancer_name")
    .eq("id", m.project_id)
    .single();
await supabase.from("invoices").insert({
    org_id: orgId,
    project_id: m.project_id,
    milestone_id: id,
    invoice_number: `INV-${Date.now().toString().slice(-6)}`,
    amount: Number(m.amount),
    currency: "USD",
    status: "issued",
  });
  void proj;
  revalidatePath(`/projects/${m.project_id}`);
  revalidatePath("/invoices");
}

export async function refundMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "refunded" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error || !m) redirect(`/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  const tx = await onChainTx(supabase, orgId, m.project_id, id, "refund", Number(m.amount));
  await recordLedger(supabase, orgId, m.project_id, id, "refund", Number(m.amount), tx);
  revalidatePath(`/projects/${m.project_id}`);
}

export async function openDispute(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "disputed" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id")
    .single();
  if (error || !m) redirect(`/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  revalidatePath(`/projects/${m.project_id}`);
}

export async function resolveDispute(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const splitBp = Number(formData.get("splitBp"));
  if (!Number.isFinite(splitBp) || splitBp < 0 || splitBp > 10000)
    redirect(`/projects?error=Split must be 0–10000 basis points.`);
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "released" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error || !m) redirect(`/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  await supabase.from("disputes").insert({
    org_id: orgId,
    project_id: m.project_id,
    milestone_id: id,
    split_bp: splitBp,
    status: "resolved",
  });
  const tx = await onChainTx(supabase, orgId, m.project_id, id, "dispute_resolve", Number(m.amount));
  await recordLedger(supabase, orgId, m.project_id, id, "dispute_resolve", Number(m.amount), tx);
  revalidatePath(`/projects/${m.project_id}`);
}

const TESTNET_USDC =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

type ProposalMilestone = { amount: number; description: string };

export async function createProposal(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const client_address = String(formData.get("client_address") || "").trim();
  const freelancer_address = String(formData.get("freelancer_address") || "").trim();
  const asset = String(formData.get("asset") || "").trim() || TESTNET_USDC;

  if (!client_address) redirect("/dashboard/proposals/new?error=Client address is required.");
  if (!freelancer_address)
    redirect("/dashboard/proposals/new?error=Freelancer address is required.");

  const amounts = formData.getAll("amount");
  const descriptions = formData.getAll("description");
  const milestones: ProposalMilestone[] = [];
  for (let i = 0; i < amounts.length; i++) {
    const amount = Number(amounts[i]);
    const description = String(descriptions[i] || "").trim();
    if (!Number.isFinite(amount) || amount <= 0) continue;
    milestones.push({ amount, description });
  }
  if (milestones.length === 0)
    redirect("/dashboard/proposals/new?error=At least one milestone with an amount is required.");

  const { error } = await supabase.from("proposals").insert({
    org_id: orgId,
    client_address,
    freelancer_address,
    asset,
    milestones,
    status: "draft",
  });
  if (error)
    redirect(`/dashboard/proposals/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/dashboard/proposals");
  redirect("/dashboard/proposals");
}

export async function acceptProposal(proposalId: string) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { data: proposal, error: pErr } = await supabase
    .from("proposals")
    .select("id, client_address, freelancer_address, asset, milestones, status")
    .eq("id", proposalId)
    .eq("org_id", orgId)
    .maybeSingle();
  if (pErr || !proposal) redirect("/dashboard/proposals?error=Proposal not found.");
  if (proposal.status !== "draft")
    redirect("/dashboard/proposals?error=Only draft proposals can be accepted.");

  const { data: created, error: projErr } = await supabase
    .from("projects")
    .insert({
      org_id: orgId,
      title: `Proposal ${proposal.id.slice(0, 8)}`,
      status: "draft",
    })
    .select("id")
    .single();
  if (projErr || !created)
    redirect(`/dashboard/proposals?error=${encodeURIComponent(projErr?.message ?? "Failed to create project.")}`);

  const projectId = created.id;
  const milestones = (proposal.milestones ?? []) as ProposalMilestone[];
  const milestoneRows = milestones.map((m, i) => ({
    project_id: projectId,
    org_id: orgId,
    title: m.description || `Milestone ${i + 1}`,
    amount: m.amount,
    chain_index: i,
    status: "draft",
  }));

  const { data: inserted, error: mErr } = await supabase
    .from("milestones")
    .insert(milestoneRows)
    .select("id");
  if (mErr || !inserted)
    redirect(`/dashboard/proposals?error=${encodeURIComponent(mErr?.message ?? "Failed to create milestones.")}`);

  const milestone_ids = inserted.map((m) => m.id);

  const { data: profile } = await supabase
    .from("profiles")
    .select("custody_mode")
    .eq("id", user.id)
    .maybeSingle();

  const orkaActive = SERVICES_URL && profile?.custody_mode === "orka";

  if (!orkaActive) {
    const { error: updErr } = await supabase
      .from("proposals")
      .update({ status: "active", project_id: projectId })
      .eq("id", proposalId);
    if (updErr)
      redirect(`/dashboard/proposals?error=${encodeURIComponent(updErr.message)}`);
    revalidatePath("/dashboard/proposals");
    redirect(`/dashboard/projects/${projectId}`);
  }

  try {
    const r = await callServices("/escrow/create", {
      org_id: orgId,
      client: proposal.client_address,
      freelancer: proposal.freelancer_address,
      asset: proposal.asset,
      operator: null,
      milestones: proposal.milestones,
      dispute_rules: null,
      mode: "orka",
      user_id: user.id,
      project_id: projectId,
      milestone_ids,
    });
    const contract_id = r.contract_id ?? null;
    if (contract_id) {
      await supabase.from("projects").update({ contract_id }).eq("id", projectId);
    }
    await supabase
      .from("proposals")
      .update({ status: "active", contract_id, project_id: projectId })
      .eq("id", proposalId);
    revalidatePath("/dashboard/proposals");
    redirect(`/dashboard/projects/${projectId}`);
  } catch {
    const { error: updErr } = await supabase
      .from("proposals")
      .update({ status: "active", project_id: projectId })
      .eq("id", proposalId);
    if (updErr)
      redirect(`/dashboard/proposals?error=${encodeURIComponent(updErr.message)}`);
    revalidatePath("/dashboard/proposals");
    redirect(`/dashboard/projects/${projectId}`);
  }
}

export async function inviteMember(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "member");
  if (!EMAIL_RE.test(email)) redirect(`/projects?error=${encodeURIComponent("A valid email is required.")}`);
  const { error } = await supabase
    .from("invitations")
    .insert({ org_id: orgId, email, role });
  if (error) redirect(`/projects?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/projects`);
}
