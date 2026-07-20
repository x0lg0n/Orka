import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProposalReader } from "./components/ProposalReader";
import { ProposalCreate } from "./components/ProposalCreate";

export default async function ProjectProposalsPage({
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
    .select("id, title, blocks, tags, status, markdown")
    .eq("org_id", org.id)
    .eq("project_id", id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!proposal) {
    return <ProposalCreate slug={slug} projectId={id} onDone={() => location.reload()} />;
  }

  return (
    <ProposalReader
      slug={slug}
      projectId={id}
      proposal={{
        id: proposal.id as string,
        title: (proposal.title as string) ?? "Untitled proposal",
        blocks: (proposal.blocks as unknown[]) ?? [],
        tags: (proposal.tags as string[]) ?? [],
        status: (proposal.status as string) ?? "draft",
        markdown: (proposal.markdown as string) ?? "",
      }}
    />
  );
}
