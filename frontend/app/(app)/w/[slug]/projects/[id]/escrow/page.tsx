import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProjectEscrowView } from "./components/ProjectEscrowView";

export default async function EscrowPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  return <ProjectEscrowView slug={slug} orgId={org?.id ?? ""} projectId={id} />;
}
