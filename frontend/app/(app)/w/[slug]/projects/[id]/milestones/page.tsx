import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { deriveWorkflowState } from "@/lib/workflow";
import { ProjectMilestonesView } from "./components/ProjectMilestonesView";

export default async function ProjectMilestonesPage({
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

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("position", { ascending: true });

  const { data: escrow } = await supabase
    .from("escrow_contracts")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let owner = null;
  if (project.created_by) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", project.created_by)
      .single();
    owner = data;
  }

  const allMilestones = milestones ?? [];

  const totalBudget = allMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );
  const releasedMilestones = allMilestones.filter(
    (m) => m.status === "released"
  );
  const fundedMilestones = allMilestones.filter(
    (m) => m.status === "funded" || m.status === "in_review"
  );
  const draftMilestones = allMilestones.filter((m) => m.status === "draft");
  const approvedMilestones = allMilestones.filter(
    (m) => m.status === "approved"
  );

  const releasedAmount = releasedMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );
  const fundedAmount = fundedMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );
  const pendingAmount = draftMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );

  const progressPct =
    allMilestones.length > 0
      ? Math.round(
          ((releasedMilestones.length + approvedMilestones.length) /
            allMilestones.length) *
            100
        )
      : 0;

  const milestoneAsset =
    allMilestones.length > 0 ? allMilestones[0].asset : "XLM";

  const escrowRow = escrow;

  const workflowState = deriveWorkflowState({
    contract: {
      client_sig: project.client_sig,
      freelancer_sig: project.freelancer_sig,
      status: project.status,
    },
    escrow: escrow
      ? {
          contract_address: escrow.contract_address ?? null,
          total_funded: Number(escrow.total_funded ?? 0),
          total_amount: Number(escrow.total_amount ?? 0),
        }
      : null,
    milestones: allMilestones.map((m) => ({ status: m.status })),
  });

  return (
    <ProjectMilestonesView
      slug={slug}
      projectId={id}
      project={project}
      milestones={allMilestones}
      owner={owner}
      escrow={escrowRow}
      workflowState={workflowState}
      role="agency"
      orgId={org.id}
      mode="orka"
      stats={{
        progressPct,
        totalBudget,
        releasedAmount,
        fundedAmount,
        pendingAmount,
        milestoneAsset,
        totalMilestones: allMilestones.length,
        releasedCount: releasedMilestones.length,
        fundedCount: fundedMilestones.length,
        draftCount: draftMilestones.length,
        approvedCount: approvedMilestones.length,
      }}
    />
  );
}
