import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getActiveOrgId } from "../../../lib/orka";
import {
  fundMilestone,
  releaseMilestone,
} from "../../../app/actions";
import type { MilestoneStatus } from "../../../lib/orka";
import FreighterMilestoneButton from "../_components/FreighterMilestoneButton";

type MilestoneRow = {
  id: string;
  title: string | null;
  amount: number | null;
  status: MilestoneStatus | string | null;
  project_title: string | null;
  chain_index: number | null;
  contract_id: string | null;
};

export default async function PaymentsPage() {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  const { data: profile } = await supabase
    .from("profiles")
    .select("custody_mode")
    .eq("id", user.id)
    .maybeSingle();
  const freighterMode = profile?.custody_mode === "freighter";

  const { data: milestones } = await supabase
    .from("milestones")
    .select("id, title, amount, status, chain_index, projects(title, contract_id)")
    .eq("org_id", orgId)
    .in("status", ["draft", "approved"])
    .order("created_at", { ascending: false });

  const rows: MilestoneRow[] = (milestones ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    amount: m.amount,
    status: m.status,
    project_title: m.projects?.title ?? null,
    chain_index: m.chain_index ?? null,
    contract_id: m.projects?.contract_id ?? null,
  }));

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="display mb-6 text-3xl uppercase">Payments</h1>

      {rows.length === 0 ? (
        <div className="rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
          <p className="text-sm font-bold text-ink/70">
            No milestones need funding or release right now.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((m) => (
            <li
              key={m.id}
              className="rounded-[28px] bg-white p-5 text-ink shadow-hard"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-black uppercase">{m.title ?? "Untitled"}</p>
                  <p className="text-xs font-bold uppercase text-ink/50">
                    {m.project_title ?? "—"}
                  </p>
                </div>
                <span className="rounded-full bg-lime px-3 py-1 text-xs font-black uppercase text-ink">
                  {m.status ?? "—"}
                </span>
              </div>

              <p className="mt-3 text-sm font-bold text-ink/70">
                {m.amount != null
                  ? `$${Number(m.amount).toLocaleString()}`
                  : "—"}
              </p>

              {freighterMode ? (
                m.contract_id ? (
                  <FreighterMilestoneButton
                    contractId={m.contract_id}
                    milestoneIds={m.chain_index != null ? [m.chain_index] : []}
                    milestoneId={m.chain_index ?? 0}
                    eventType={m.status === "draft" ? "fund" : "release"}
                    label={m.status === "draft" ? "Fund" : "Release"}
                  />
                ) : (
                  <p className="mt-4 text-xs font-bold uppercase text-ink/50">
                    No contract deployed for this project yet.
                  </p>
                )
              ) : m.status === "draft" ? (
                <form action={fundMilestone} className="mt-4">
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-orange px-5 py-2 text-sm font-black uppercase text-ink shadow-hard transition hover:-translate-y-0.5"
                  >
                    Fund
                  </button>
                </form>
              ) : (
                <form action={releaseMilestone} className="mt-4">
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-orange px-5 py-2 text-sm font-black uppercase text-ink shadow-hard transition hover:-translate-y-0.5"
                  >
                    Release
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
