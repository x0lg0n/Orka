import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { AlertBanner, GlassPanel, PageHeader } from "@/components/dashboard/DashboardUI";
import NewProposalForm from "@/components/dashboard/NewProposalForm";

export default async function NewProposalPage({
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

  const { error } = await searchParams;

  return (
    <div>
      <Link
        href={`/w/${slug}/proposals`}
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
