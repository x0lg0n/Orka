import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug, listClients } from "@/lib/orka";
import { ClientsView } from "./components/ClientsView";

export const metadata = { title: "Clients · ORKA" };

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const clients = await listClients(supabase, org.id);

  return <ClientsView slug={slug} clients={clients} />;
}
