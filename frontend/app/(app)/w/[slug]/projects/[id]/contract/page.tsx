import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ContractEmpty } from "./components/ContractEmpty";
import { ContractReaderClient } from "./components/ContractReaderClient";

export default async function ContractPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: contract } = await supabase
    .from("project_contracts")
    .select("id, blocks, markdown, status, agency_sig, client_sig, updated_at")
    .eq("project_id", id)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!contract) {
    return <ContractEmpty slug={slug} projectId={id} orgId={org.id} />;
  }

  return (
    <ContractReaderClient
      key={String(contract.updated_at)}
      slug={slug}
      projectId={id}
      orgId={org.id}
      blocks={(contract.blocks as unknown[]) ?? []}
      agencySig={(contract.agency_sig as string | null) ?? null}
      clientSig={(contract.client_sig as string | null) ?? null}
      status={(contract.status as string) ?? "draft"}
      contractId={contract.id as string}
    />
  );
}
