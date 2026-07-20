import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug, getClient } from "@/lib/orka";
import { EditClientForm } from "./components/EditClientForm";

export const metadata = { title: "Edit Client · ORKA" };

export default async function EditClientPage({
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

  return (
    <EditClientForm
      slug={slug}
      orgId={org.id}
      clientId={client.id}
      client={client}
    />
  );
}
