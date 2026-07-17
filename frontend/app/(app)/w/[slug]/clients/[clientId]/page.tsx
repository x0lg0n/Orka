import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug, getClient, listProjects } from "@/lib/orka";
import { ClientDetail } from "./components/ClientDetail";

export const metadata = { title: "Client · ORKA" };

export default async function ClientPage({
  params,
}: {
  params: Promise<{ slug: string; clientId: string }>;
}) {
  const { slug, clientId } = await params;

  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const client = await getClient(supabase, org.id, clientId);
  if (!client) redirect(`/w/${slug}/clients`);

  const projects = await listProjects(supabase, org.id, clientId);

  return <ClientDetail slug={slug} client={client} projects={projects} />;
}
