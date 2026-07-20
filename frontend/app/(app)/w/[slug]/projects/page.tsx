import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug, listProjectsPage } from "@/lib/orka";
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

  const page = await listProjectsPage(supabase, org.id, { limit: 10, offset: 0 });

  return (
    <ProjectsList
      slug={slug}
      initialItems={page.items}
      initialTotal={page.total}
      initialHasMore={page.hasMore}
      initialCounts={page.counts}
    />
  );
}
