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
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader
        slug={slug}
        projectId={id}
        title={project.title}
        status={project.status}
      />
      <ProjectTabs slug={slug} projectId={id} />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}
