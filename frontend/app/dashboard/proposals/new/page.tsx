import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import { getActiveOrgId } from "../../../../lib/orka";
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
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-3xl uppercase">New proposal</h1>
        <Link
          href="/dashboard/proposals"
          className="rounded-full border-2 border-ink bg-white px-5 py-2 text-sm font-black uppercase text-ink transition hover:bg-bone"
        >
          Back
        </Link>
      </div>

      <div className="rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
        {error && (
          <p className="mb-5 rounded-2xl bg-orange/20 px-4 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
        <NewProposalForm />
      </div>
    </div>
  );
}
