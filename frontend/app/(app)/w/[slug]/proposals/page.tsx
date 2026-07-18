import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { AlertBanner, EmptyState } from "@/components/dashboard/DashboardUI";
import {
  ProposalCard,
  ProposalsHeader,
  type ProposalListItem,
} from "./components/ProposalCard";

export default async function ProposalsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: proposals } = await supabase
    .from("proposals")
    .select(
      "id, client_address, freelancer_address, asset, status, contract_id, project_id, created_at",
    )
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const { error } = await searchParams;

  const rows = (proposals as ProposalListItem[] | null) ?? [];

  return (
    <div>
      <ProposalsHeader slug={slug} />

      {error && <AlertBanner>{error}</AlertBanner>}

      {rows.length === 0 ? (
        <EmptyState
          title="No proposals yet"
          description="Create your first proposal to define counterparties, assets, and milestone terms."
        />
      ) : (
        <ul className="grid gap-4">
          {rows.map((p) => (
            <ProposalCard key={p.id} proposal={p} slug={slug} />
          ))}
        </ul>
      )}
    </div>
  );
}
