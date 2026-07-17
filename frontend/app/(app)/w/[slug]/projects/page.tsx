import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug, listProjects } from "@/lib/orka";
import { ProjectsList } from "./components/ProjectsList";

export const metadata = { title: "Projects · ORKA" };

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const projects = await listProjects(supabase, org.id);

  return <ProjectsList slug={slug} projects={projects} />;
}
