import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProjectEscrowView } from "./components/ProjectEscrowView";

export default async function EscrowPage({
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
    .select("id, shared_token")
    .eq("org_id", org.id)
    .eq("id", id)
    .single();

  if (!project) redirect(`/w/${slug}/projects`);

  const { data: contract } = await supabase
    .from("contracts")
    .select("client_sig, freelancer_sig, status")
    .eq("project_id", id)
    .maybeSingle();

  const { data: escrow } = await supabase
    .from("escrow_contracts")
    .select("id, status, contract_address, total_amount, total_funded, asset, deployed_at, custody_mode")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: milestones } = await supabase
    .from("milestones")
    .select("id, status")
    .eq("project_id", id);

  const role =
    contract?.client_sig && contract?.freelancer_sig
      ? "client"
      : "agency";

  return (
    <ProjectEscrowView
      slug={slug}
      orgId={org.id}
      projectId={id}
      project={project}
      contract={contract}
      escrow={escrow}
      milestones={milestones ?? []}
      role={role}
    />
  );
}
