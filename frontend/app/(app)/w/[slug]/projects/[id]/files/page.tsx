import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProjectFilesView } from "./components/ProjectFilesView";

export default async function ProjectFilesPage({
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

  const { data: files } = await supabase
    .from("files")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: activity } = await supabase
    .from("activity")
    .select("id, type, payload, created_at, actor_id")
    .eq("project_id", id)
    .eq("type", "file")
    .order("created_at", { ascending: false })
    .limit(5);

  let uploader = null;
  if (project.created_by) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", project.created_by)
      .single();
    uploader = data;
  }

  return (
    <ProjectFilesView
      slug={slug}
      projectId={id}
      project={project}
      files={files ?? []}
      recentActivity={activity ?? []}
      uploader={uploader}
    />
  );
}
