import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "../../../../lib/supabase/server";
import { getActiveOrgId } from "../../../../lib/orka";
import { AlertBanner, GlassPanel, PageHeader } from "../../_components/DashboardUI";
import NewProposalForm from "../_components/NewProposalForm";

export default async function NewProposalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const { error } = await searchParams;

  return (
    <div>
      <Link
        href="/dashboard/proposals"
        className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase text-cyan-200 transition hover:text-lime"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </Link>

      <PageHeader
        eyebrow="Proposal builder"
        title="New proposal"
        description="Capture counterparties, testnet asset, and milestone terms before converting the proposal into an escrow project."
      />

      <GlassPanel className="p-5 sm:p-6">
        {error && <AlertBanner>{error}</AlertBanner>}
        <NewProposalForm />
      </GlassPanel>
    </div>
  );
}
