import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getActiveOrgId } from "../../../lib/orka";
import { acceptProposal } from "../../actions";

const STATUS_PILL: Record<string, string> = {
  draft: "bg-one text-ink",
  active: "bg-lime text-ink",
  closed: "bg-ink text-white",
};

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const { data: proposals } = await supabase
    .from("proposals")
    .select("id, client_address, freelancer_address, asset, status, contract_id, project_id, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const { error } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="display text-3xl uppercase">Proposals</h1>
        <Link
          href="/dashboard/proposals/new"
          className="rounded-full bg-lime px-5 py-2 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white"
        >
          New proposal
        </Link>
      </div>

      {error && (
        <p className="mb-5 rounded-2xl bg-orange/20 px-4 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      {!proposals || proposals.length === 0 ? (
        <div className="rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
          <p className="text-sm font-bold text-ink/70">
            No proposals yet. Create your first one.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {proposals.map((p) => (
            <li
              key={p.id}
              className="rounded-[28px] bg-white p-5 text-ink shadow-hard"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                        STATUS_PILL[p.status] ?? "bg-one text-ink"
                      }`}
                    >
                      {p.status}
                    </span>
                    {p.contract_id && (
                      <span className="text-xs font-bold text-ink/60">
                        {p.contract_id.slice(0, 12)}…
                      </span>
                    )}
                  </div>
                  <dl className="flex flex-col gap-1 text-sm font-bold">
                    <div className="flex flex-col sm:flex-row sm:gap-2">
                      <dt className="uppercase text-ink/60">Client</dt>
                      <dd className="break-all">{p.client_address}</dd>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:gap-2">
                      <dt className="uppercase text-ink/60">Freelancer</dt>
                      <dd className="break-all">{p.freelancer_address}</dd>
                    </div>
                  </dl>
                </div>

                {p.status === "draft" ? (
                  <form action={acceptProposal.bind(null, p.id)}>
                    <button
                      type="submit"
                      className="rounded-full bg-ink px-5 py-2 text-sm font-black uppercase text-white transition hover:-translate-y-0.5 hover:bg-orange"
                    >
                      Accept
                    </button>
                  </form>
                ) : (
                  <Link
                    href={`/dashboard/projects/${p.project_id ?? ""}`}
                    className="rounded-full border-2 border-ink bg-white px-5 py-2 text-sm font-black uppercase text-ink transition hover:bg-bone"
                  >
                    View
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
