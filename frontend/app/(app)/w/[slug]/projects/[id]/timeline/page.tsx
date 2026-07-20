import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProjectTimelineView } from "./components/ProjectTimelineView";

export default async function ProjectTimelinePage({
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

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: activity } = await supabase
    .from("activity")
    .select("id, type, payload, created_at, actor_id")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: escrow } = await supabase
    .from("escrow_contracts")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { count: memberCount } = await supabase
    .from("project_members")
    .select("user_id", { count: "exact", head: true })
    .eq("project_id", id);

  const allMilestones = milestones ?? [];
  const allFiles = files ?? [];
  const allContracts = contracts ?? [];
  const allPayments = payments ?? [];
  const allInvoices = invoices ?? [];
  const allActivity = activity ?? [];
  const allComments = comments ?? [];
  const allEscrow = escrow ?? [];

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
  const pendingMilestones = allMilestones.filter((m) => m.status === "draft");

  const releasedAmount = releasedMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );
  const fundedAmount = fundedMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );
  const pendingAmount = pendingMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );

  const progressPct =
    allMilestones.length > 0
      ? Math.round((releasedMilestones.length / allMilestones.length) * 100)
      : 0;

  const milestoneAsset = allMilestones.length > 0 ? allMilestones[0].asset : "XLM";

  return (
    <ProjectTimelineView
      slug={slug}
      projectId={id}
      project={project}
      milestones={allMilestones}
      owner={owner}
      files={allFiles}
      contracts={allContracts}
      payments={allPayments}
      invoices={allInvoices}
      activity={allActivity}
      comments={allComments}
      escrow={allEscrow}
      memberCount={memberCount ?? 0}
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
        pendingCount: pendingMilestones.length,
      }}
    />
  );
}
