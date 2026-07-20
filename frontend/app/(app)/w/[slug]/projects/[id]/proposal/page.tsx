import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProposalDetailView } from "./components/ProposalDetailView";

export default async function ProjectProposalPage({
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
    .from("project_proposals")
    .select("*")
    .eq("org_id", org.id)
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!proposal) {
    return (
      <ProposalDetailView
        slug={slug}
        projectId={id}
        project={project}
        proposal={null}
        sections={[]}
        pricing={[]}
        notes={[]}
        activity={[]}
        client={null}
      />
    );
  }

  const { data: sections } = await supabase
    .from("proposal_sections")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("position", { ascending: true });

  const { data: pricing } = await supabase
    .from("proposal_pricing")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("position", { ascending: true });

  const { data: notes } = await supabase
    .from("proposal_notes")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("created_at", { ascending: false });

  const { data: activity } = await supabase
    .from("proposal_activity")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("created_at", { ascending: false });

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

  return (
    <ProposalDetailView
      slug={slug}
      projectId={id}
      project={project}
      proposal={proposal}
      sections={sections ?? []}
      pricing={pricing ?? []}
      notes={notes ?? []}
      activity={activity ?? []}
      client={client}
    />
  );
}
