import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProjectPaymentsView } from "./components/ProjectPaymentsView";

export default async function PaymentsPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  return <ProjectPaymentsView slug={slug} orgId={org?.id ?? ""} projectId={id} />;
}
