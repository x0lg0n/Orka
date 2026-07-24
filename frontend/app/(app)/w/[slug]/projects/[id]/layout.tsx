import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProjectHeader } from "./components/ProjectHeader";
import { ProjectTabs } from "./components/ProjectTabs";

async function getProject(slug: string, projectId: string) {
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", org.id)
    .eq("id", projectId)
    .single();

  if (error || !project) notFound();

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("position", { ascending: true });

  return { project, milestones: milestones ?? [] };
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const { project, milestones } = await getProject(slug, id);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-gray-50">
      <div className="shrink-0 px-6 pt-6">
        <ProjectHeader
          slug={slug}
          projectId={id}
          title={project.title}
          status={project.status}
          clientName={project.client_name}
          createdAt={project.created_at}
          updatedAt={project.updated_at}
          sharedToken={project.shared_token}
        />
        <ProjectTabs slug={slug} projectId={id} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
