import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ContractDetailView } from "./components/ContractDetailView";

export default async function ContractPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  return <ContractDetailView slug={slug} orgId={org?.id ?? ""} projectId={id} />;
}
