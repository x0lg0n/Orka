import { createClient } from "@/lib/supabase/server";
import { getActiveOrgId, listClients } from "@/lib/orka";
import { NewProjectForm } from "./components/NewProjectForm";

export default async function NewProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  const clients = orgId ? await listClients(supabase, orgId) : [];

  return <NewProjectForm slug={slug} clients={clients} />;
}
