"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "../lib/supabase/server";
import { getSupabase } from "../lib/supabase";
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

export async function selectOrg(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const orgId = String(formData.get("orgId") || "").trim();
  if (!orgId) redirect("/workspaces?error=Workspace selection is invalid.");

  const { data: membership } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("user_id", user.id)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!membership) redirect("/workspaces?error=You do not have access to that workspace.");

  (await cookies()).set("orka_active_org", orgId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  redirect(`/workspaces/${orgId}`);
}

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
    redirect("/workspaces/new?error=Workspace name is required.");
  }

  const rawType = String(formData.get("type") || "").trim();
  const type = ["freelancer", "agency", "studio", "consultancy", "startup"].includes(rawType)
    ? rawType
    : null;

  const rawSlug = String(formData.get("slug") || "").trim();
  const slug =
    (rawSlug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || undefined;

  const admin = getSupabase();
  const { data: org, error } = await admin
    .from("organizations")
    .insert({ name, slug, type })
    .select("id, slug")
    .single();
  if (error) {
    redirect(`/workspaces/new?error=${encodeURIComponent(error.message)}`);
  }

  // Optional logo upload to the public workspace-logos bucket.
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    const ext = (logoFile.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${org.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await admin.storage
      .from("workspace-logos")
      .upload(path, logoFile, { upsert: true, contentType: logoFile.type || "image/png" });
    if (!upErr) {
      const { data: urlData } = admin.storage.from("workspace-logos").getPublicUrl(path);
      await admin.from("organizations").update({ logo_url: urlData.publicUrl }).eq("id", org.id);
    }
  }

  await admin
    .from("organization_members")
    .insert({ org_id: org.id, user_id: user.id, role: "owner" });

  (await cookies()).set("orka_active_org", org.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  revalidatePath("/workspaces");
  redirect(org.slug ? `/w/${org.slug}/dashboard` : "/workspaces");
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");

  const slug = String(formData.get("slug") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const clientId = String(formData.get("clientId") || "").trim() || null;
  const clientName = String(formData.get("clientName") || "").trim() || null;
  const category = String(formData.get("category") || "").trim();
  const timeline = String(formData.get("timeline") || "").trim();
  const mode = String(formData.get("mode") || "project"); // "draft" | "project"

  const errorBase = slug ? `/w/${slug}/projects/new` : "/workspaces";
  // Save Draft requires only a name; Save Project requires name + client.
  if (!title) redirect(`${errorBase}?error=Project title is required.`);
  if (mode === "project" && !clientId)
    redirect(`${errorBase}?error=Please select a client.`);

  const userId = (await supabase.auth.getUser()).data.user?.id;

  // Auto-generate a per-org project code (PRJ-001, PRJ-002, ...).
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId);
  const code = `PRJ-${String((count ?? 0) + 1).padStart(3, "0")}`;

  const { error } = await supabase.from("projects").insert({
    org_id: orgId,
    code,
    title,
    description,
    client_id: clientId,
    client_name: clientName,
    created_by: userId ?? null,
    metadata: {
      ...(category ? { category } : {}),
      ...(timeline ? { timeline } : {}),
    },
    status: mode === "draft" ? "draft" : "active",
  });
  if (error) redirect(`${errorBase}?error=${encodeURIComponent(error.message)}`);

  const redirectPath = slug ? `/w/${slug}/projects` : "/workspaces";
  revalidatePath(redirectPath);
  redirect(redirectPath);
}

// Creates a client for an organization. All non-core attributes (type, contact,
// website, industry, billing address, notes, tags, currency, payment terms) are
// stored in the clients.metadata jsonb column. `orgId` is passed by the caller
// (resolved from the workspace slug server-side).
export async function createClientAction(formData: FormData) {
  const supabase = await createClient();

  const orgId = String(formData.get("orgId") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const errorBase = slug ? `/w/${slug}/clients/new` : "/workspaces";

  if (!orgId) redirect("/workspaces");
  if (!name) redirect(`${errorBase}?error=Client name is required.`);
  if (email && !EMAIL_RE.test(email))
    redirect(`${errorBase}?error=Please enter a valid email address.`);

  const status = String(formData.get("status") || "active").toLowerCase();
  const safeStatus = ["active", "inactive", "lead", "archived"].includes(status)
    ? status
    : "active";

  const metadata: Record<string, unknown> = {
    clientType: String(formData.get("clientType") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    contactName: String(formData.get("contactName") || "").trim() || null,
    contactEmail: String(formData.get("contactEmail") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    jobTitle: String(formData.get("jobTitle") || "").trim() || null,
    website: String(formData.get("website") || "").trim() || null,
    industry: String(formData.get("industry") || "").trim() || null,
    companySize: String(formData.get("companySize") || "").trim() || null,
    taxId: String(formData.get("taxId") || "").trim() || null,
    billing: {
      addressLine1: String(formData.get("addressLine1") || "").trim() || null,
      addressLine2: String(formData.get("addressLine2") || "").trim() || null,
      city: String(formData.get("city") || "").trim() || null,
      state: String(formData.get("state") || "").trim() || null,
      postalCode: String(formData.get("postalCode") || "").trim() || null,
      country: String(formData.get("country") || "").trim() || null,
    },
    notes: String(formData.get("notes") || "").trim() || null,
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    preferredCurrency: String(formData.get("preferredCurrency") || "").trim() || null,
    paymentTerms: String(formData.get("paymentTerms") || "").trim() || null,
  };

  const { error } = await supabase.from("clients").insert({
    org_id: orgId,
    name,
    email: email || null,
    metadata,
    status: safeStatus,
  });
  if (error) redirect(`${errorBase}?error=${encodeURIComponent(error.message)}`);

  const redirectPath = slug ? `/w/${slug}/clients` : "/workspaces";
  revalidatePath(redirectPath);
  redirect(redirectPath);
}

// Updates an existing client for an organization. Mirrors createClientAction:
// all non-core attributes are stored in clients.metadata, scoped to the org.
export async function updateClientAction(formData: FormData) {
  const supabase = await createClient();

  const orgId = String(formData.get("orgId") || "").trim();
  const slug = String(formData.get("slug") || "").trim();
  const clientId = String(formData.get("clientId") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const errorBase = slug ? `/w/${slug}/clients/${clientId}/edit` : "/workspaces";

  if (!orgId) redirect("/workspaces");
  if (!clientId) redirect(`/w/${slug}/clients`);
  if (!name) redirect(`${errorBase}?error=Client name is required.`);
  if (email && !EMAIL_RE.test(email))
    redirect(`${errorBase}?error=Please enter a valid email address.`);

  const status = String(formData.get("status") || "active").toLowerCase();
  const safeStatus = ["active", "inactive", "lead", "archived"].includes(status)
    ? status
    : "active";

  const metadata: Record<string, unknown> = {
    clientType: String(formData.get("clientType") || "").trim() || null,
    description: String(formData.get("description") || "").trim() || null,
    contactName: String(formData.get("contactName") || "").trim() || null,
    contactEmail: String(formData.get("contactEmail") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    jobTitle: String(formData.get("jobTitle") || "").trim() || null,
    website: String(formData.get("website") || "").trim() || null,
    industry: String(formData.get("industry") || "").trim() || null,
    companySize: String(formData.get("companySize") || "").trim() || null,
    taxId: String(formData.get("taxId") || "").trim() || null,
    billing: {
      addressLine1: String(formData.get("addressLine1") || "").trim() || null,
      addressLine2: String(formData.get("addressLine2") || "").trim() || null,
      city: String(formData.get("city") || "").trim() || null,
      state: String(formData.get("state") || "").trim() || null,
      postalCode: String(formData.get("postalCode") || "").trim() || null,
      country: String(formData.get("country") || "").trim() || null,
    },
    notes: String(formData.get("notes") || "").trim() || null,
    tags: String(formData.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    preferredCurrency: String(formData.get("preferredCurrency") || "").trim() || null,
    paymentTerms: String(formData.get("paymentTerms") || "").trim() || null,
  };

  const { error } = await supabase
    .from("clients")
    .update({ name, email: email || null, metadata, status: safeStatus })
    .eq("id", clientId)
    .eq("org_id", orgId);
  if (error) redirect(`${errorBase}?error=${encodeURIComponent(error.message)}`);

  const redirectPath = slug ? `/w/${slug}/clients/${clientId}` : "/workspaces";
  revalidatePath(redirectPath);
  revalidatePath(`/w/${slug}/clients`);
  redirect(redirectPath);
}

export async function addMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");

  const projectId = String(formData.get("projectId") || "");
  const title = String(formData.get("title") || "").trim();
  const amount = Number(formData.get("amount"));

  if (!projectId) redirect(`/dashboard/projects?error=Missing project.`);
  if (!title)
    redirect(
      `/dashboard/projects/${projectId}?error=Milestone title is required.`,
    );
  if (!Number.isFinite(amount) || amount <= 0)
    redirect(
      `/dashboard/projects/${projectId}?error=Amount must be greater than 0.`,
    );

  const { error } = await supabase.from("milestones").insert({
    org_id: orgId,
    project_id: projectId,
    title,
    amount,
    status: "draft",
  });
  if (error)
    redirect(
      `/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`,
    );

  revalidatePath(`/dashboard/projects/${projectId}`);
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
  if (!orgId) redirect("/workspaces");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "funded" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error || !m) redirect(`/dashboard/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  const tx = await onChainTx(supabase, orgId, m.project_id, id, "fund", Number(m.amount));
  await recordLedger(supabase, orgId, m.project_id, id, "fund", Number(m.amount), tx);
  revalidatePath(`/dashboard/projects/${m.project_id}`);
}

export async function submitMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "in_review" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id")
    .single();
  if (error || !m) redirect(`/dashboard/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  revalidatePath(`/dashboard/projects/${m.project_id}`);
}

export async function releaseMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "released" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error || !m) redirect(`/dashboard/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);

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
  revalidatePath(`/dashboard/projects/${m.project_id}`);
  revalidatePath("/invoices");
}

export async function approveMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "approved" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error || !m)
    redirect(`/dashboard/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);

  const tx = await onChainTx(supabase, orgId, m.project_id, id, "approve", Number(m.amount));
  await recordLedger(supabase, orgId, m.project_id, id, "approve", Number(m.amount), tx);
  revalidatePath(`/dashboard/projects/${m.project_id}`);
}

export async function refundMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "refunded" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error || !m) redirect(`/dashboard/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  const tx = await onChainTx(supabase, orgId, m.project_id, id, "refund", Number(m.amount));
  await recordLedger(supabase, orgId, m.project_id, id, "refund", Number(m.amount), tx);
  revalidatePath(`/dashboard/projects/${m.project_id}`);
}

export async function openDispute(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "disputed" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id")
    .single();
  if (error || !m) redirect(`/dashboard/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  revalidatePath(`/dashboard/projects/${m.project_id}`);
}

export async function resolveDispute(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");
  const id = String(formData.get("milestoneId") || "");
  const splitBp = Number(formData.get("splitBp"));
  if (!Number.isFinite(splitBp) || splitBp < 0 || splitBp > 10000)
    redirect(`/dashboard/projects?error=Split must be 0–10000 basis points.`);
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "released" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error || !m) redirect(`/dashboard/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`);
  await supabase.from("disputes").insert({
    org_id: orgId,
    project_id: m.project_id,
    milestone_id: id,
    split_bp: splitBp,
    status: "resolved",
  });
  const tx = await onChainTx(supabase, orgId, m.project_id, id, "dispute_resolve", Number(m.amount));
  await recordLedger(supabase, orgId, m.project_id, id, "dispute_resolve", Number(m.amount), tx);
  revalidatePath(`/dashboard/projects/${m.project_id}`);
}

const TESTNET_USDC =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

type ProposalMilestone = { amount: number; description: string };

export async function createProposal(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");

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
  if (!orgId) redirect("/workspaces");

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

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const full_name = String(formData.get("full_name") || "").trim();
  const custody_mode = String(formData.get("custody_mode") || "").trim();

  if (custody_mode !== "orka" && custody_mode !== "freighter") {
    redirect("/dashboard/settings?error=Invalid custody mode.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, custody_mode })
    .eq("id", user.id);
  if (error) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings");
}

export async function saveStellarAddress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const address = String(formData.get("address") || "").trim();
  const { error } = await supabase
    .from("profiles")
    .update({ stellar_address: address })
    .eq("id", user.id);
  if (error) {
    redirect(`/dashboard/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard/settings");
}

export async function freighterApplyTx(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");

  const milestoneId = String(formData.get("milestoneId") || "");
  const eventType = String(formData.get("eventType") || "");
  const txHash = String(formData.get("txHash") || "");

  if (eventType !== "fund" && eventType !== "release") {
    redirect("/dashboard/projects?error=Invalid Freighter event type.");
  }

  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: eventType === "fund" ? "funded" : "released" })
    .eq("id", milestoneId)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error || !m) {
    redirect(
      `/dashboard/projects?error=${encodeURIComponent(error?.message ?? "Failed")}`,
    );
  }

  await recordLedger(
    supabase,
    orgId,
    m.project_id,
    milestoneId,
    eventType,
    Number(m.amount),
    txHash,
  );

  if (eventType === "release") {
    await supabase.from("invoices").insert({
      org_id: orgId,
      project_id: m.project_id,
      milestone_id: milestoneId,
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      amount: Number(m.amount),
      currency: "USD",
      status: "issued",
    });
  }

  revalidatePath(`/dashboard/projects/${m.project_id}`);
  revalidatePath("/dashboard/payments");
}

export async function inviteMember(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/workspaces");
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "member");
  if (!EMAIL_RE.test(email)) redirect(`/dashboard/projects?error=${encodeURIComponent("A valid email is required.")}`);
  const { error } = await supabase
    .from("invitations")
    .insert({ org_id: orgId, email, role });
  if (error) redirect(`/dashboard/projects?error=${encodeURIComponent(error.message)}`);
  revalidatePath(`/dashboard/projects`);
}

export async function updateOrg(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const id = String(formData.get("orgId") || "").trim();
  if (!id) redirect("/workspaces?error=Missing workspace.");

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (member?.role !== "owner") {
    redirect(`/workspaces/${id}/settings?error=Only the owner can edit this workspace.`);
  }

  const name = String(formData.get("name") || "").trim();
  if (!name) redirect(`/workspaces/${id}/settings?error=Workspace name is required.`);

  const rawType = String(formData.get("type") || "").trim();
  const type = ["freelancer", "agency", "studio", "consultancy", "startup"].includes(rawType)
    ? rawType
    : null;

  const rawSlug = String(formData.get("slug") || "").trim();
  const slug =
    (rawSlug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || undefined;

  const admin = getSupabase();
  const update: Record<string, unknown> = { name, slug, type };
  const { error: updErr } = await admin.from("organizations").update(update).eq("id", id);
  if (updErr) {
    redirect(`/workspaces/${id}/settings?error=${encodeURIComponent(updErr.message)}`);
  }

  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    const ext = (logoFile.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await admin.storage
      .from("workspace-logos")
      .upload(path, logoFile, { upsert: true, contentType: logoFile.type || "image/png" });
    if (!upErr) {
      const { data: urlData } = admin.storage.from("workspace-logos").getPublicUrl(path);
      await admin.from("organizations").update({ logo_url: urlData.publicUrl }).eq("id", id);
    }
  }

  revalidatePath("/workspaces");
  revalidatePath(`/workspaces/${id}`);
  revalidatePath(`/workspaces/${id}/settings`);
  redirect(`/workspaces/${id}/settings?updated=1`);
}

export async function deleteOrg(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const id = String(formData.get("orgId") || "").trim();
  if (!id) redirect("/workspaces");

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (member?.role !== "owner") redirect("/workspaces");

  const admin = getSupabase();
  const { error } = await admin.from("organizations").delete().eq("id", id);
  if (error) redirect(`/workspaces/${id}/settings?error=${encodeURIComponent(error.message)}`);

  const cookieStore = await cookies();
  if (cookieStore.get("orka_active_org")?.value === id) {
    cookieStore.delete("orka_active_org");
  }

  revalidatePath("/workspaces");
  redirect("/workspaces");
}
