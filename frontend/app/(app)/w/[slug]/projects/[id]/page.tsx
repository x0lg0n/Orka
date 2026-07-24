import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { deriveWorkflowState, type ProjectStage } from "@/lib/workflow";
import { ProjectOverviewView } from "./overview/components/ProjectOverviewView";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", org.id)
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: proposal } = await supabase
    .from("proposals")
    .select("status")
    .eq("project_id", id)
    .maybeSingle();

  const { data: escrow } = await supabase
    .from("escrow_contracts")
    .select("contract_address, total_funded, total_amount, status")
    .eq("project_id", id)
    .maybeSingle();

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  let client = null;
  if (project.client_id) {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("id", project.client_id)
      .eq("org_id", org.id)
      .single();
    client = data;
  }

  let owner = null;
  if (project.created_by) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", project.created_by)
      .single();
    owner = data;
  }

  const { data: files } = await supabase
    .from("files")
    .select("id, name, size, created_at, review_status")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: activity } = await supabase
    .from("activity")
    .select("id, type, payload, created_at, actor_id")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { count: memberCount } = await supabase
    .from("project_members")
    .select("user_id", { count: "exact", head: true })
    .eq("project_id", id);

  const allMilestones = milestones ?? [];
  const allFiles = files ?? [];
  const allActivity = activity ?? [];

  const totalMilestones = allMilestones.length;
  const releasedMilestones = allMilestones.filter((m) => m.status === "released");
  const fundedMilestones = allMilestones.filter(
    (m) => m.status === "funded" || m.status === "in_review",
  );
  const pendingMilestones = allMilestones.filter((m) => m.status === "draft");
  const refundedMilestones = allMilestones.filter((m) => m.status === "refunded");

  const totalBudget = allMilestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const fundedAmount = fundedMilestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const releasedAmount = releasedMilestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const pendingAmount = pendingMilestones.reduce((sum, m) => sum + Number(m.amount), 0);
  const refundedAmount = refundedMilestones.reduce((sum, m) => sum + Number(m.amount), 0);

  const projectStage: ProjectStage = deriveWorkflowState({
    proposal: proposal ? { status: proposal.status } : null,
    contract: project
      ? {
          client_sig: project.client_sig ?? null,
          freelancer_sig: project.freelancer_sig ?? null,
          status: project.status ?? null,
        }
      : null,
    escrow: escrow
      ? {
          contract_address: escrow.contract_address ?? null,
          total_funded: Number(escrow.total_funded ?? 0),
          total_amount: Number(escrow.total_amount ?? 0),
        }
      : null,
    milestones: allMilestones.map((m) => ({ status: m.status as never })),
  }).stage;

  const progressPct =
    totalMilestones > 0
      ? Math.round((releasedMilestones.length / totalMilestones) * 100)
      : 0;

  const milestoneAsset = allMilestones.length > 0 ? allMilestones[0].asset : "XLM";

  const escrowFundedPct =
    totalBudget > 0
      ? Math.round(((fundedAmount + releasedAmount) / totalBudget) * 100)
      : 0;

  return (
    <ProjectOverviewView
      slug={slug}
      projectId={id}
      project={project}
      milestones={allMilestones}
      client={client}
      owner={owner}
      files={allFiles}
      activity={allActivity}
      memberCount={memberCount ?? 0}
      projectStage={projectStage}
      stats={{
        progressPct,
        totalMilestones,
        releasedCount: releasedMilestones.length,
        fundedCount: fundedMilestones.length,
        pendingCount: pendingMilestones.length,
        refundedCount: refundedMilestones.length,
        completedCount: releasedMilestones.length,
        inProgressCount: fundedMilestones.length,
        upcomingCount: pendingMilestones.length,
        totalBudget,
        fundedAmount,
        releasedAmount,
        pendingAmount,
        refundedAmount,
        milestoneAsset,
        escrowFundedPct,
        contractAddress: escrow?.contract_address,
        escrowStatus: escrow?.status,
      }}
    />
  );
}
