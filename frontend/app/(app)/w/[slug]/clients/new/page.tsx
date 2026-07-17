import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { NewClientForm } from "./components/NewClientForm";

export const metadata = { title: "New Client · ORKA" };

export default async function NewClientPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  return <NewClientForm slug={slug} orgId={org.id} />;
}
