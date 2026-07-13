import { redirect } from "next/navigation";
import { CircleDollarSign, ShieldCheck } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { getActiveOrgId } from "../../../lib/orka";
import {
  fundMilestone,
  releaseMilestone,
} from "../../../app/actions";
import type { MilestoneStatus } from "../../../lib/orka";
import FreighterMilestoneButton from "../_components/FreighterMilestoneButton";
import {
  EmptyState,
  GlassPanel,
  PageHeader,
  StatusPill,
} from "../_components/DashboardUI";

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
    <div>
      <PageHeader
        eyebrow="Escrow queue"
        title="Payments"
        description="Milestones that need funding or release are collected here for fast review."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No payment actions"
          description="No milestones need funding or release right now."
        />
      ) : (
        <ul className="grid gap-4">
          {rows.map((m) => (
            <li key={m.id}>
              <GlassPanel className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-black uppercase text-white">
                      {m.title ?? "Untitled"}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      {m.project_title ?? "-"}
                    </p>
                    <p className="mt-3 text-2xl font-black text-white">
                      {m.amount != null
                        ? `$${Number(m.amount).toLocaleString()}`
                        : "-"}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase text-slate-500">
                      USDC testnet
                    </p>
                  </div>
                  <StatusPill status={m.status} />
                </div>

                <div className="mt-5">
                  {freighterMode ? (
                    m.contract_id ? (
                      <FreighterMilestoneButton
                        contractId={m.contract_id}
                        milestoneIds={m.chain_index != null ? [m.chain_index] : []}
                        milestoneId={m.chain_index ?? 0}
                        dbId={m.id}
                        eventType={m.status === "draft" ? "fund" : "release"}
                        label={m.status === "draft" ? "Fund" : "Release"}
                      />
                    ) : (
                      <p className="rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-xs font-bold uppercase text-slate-400">
                        No contract deployed for this project yet.
                      </p>
                    )
                  ) : m.status === "draft" ? (
                    <form action={fundMilestone}>
                      <input type="hidden" name="milestoneId" value={m.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-[16px] border border-cyan-200/30 bg-cyan-300 px-4 py-2 text-sm font-black uppercase text-[#04101f] transition hover:-translate-y-0.5 hover:bg-lime focus:outline-none focus:ring-2 focus:ring-cyan-200/50"
                      >
                        <CircleDollarSign className="size-4" aria-hidden />
                        Fund
                      </button>
                    </form>
                  ) : (
                    <form action={releaseMilestone}>
                      <input type="hidden" name="milestoneId" value={m.id} />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-[16px] border border-cyan-200/30 bg-cyan-300 px-4 py-2 text-sm font-black uppercase text-[#04101f] transition hover:-translate-y-0.5 hover:bg-lime focus:outline-none focus:ring-2 focus:ring-cyan-200/50"
                      >
                        <ShieldCheck className="size-4" aria-hidden />
                        Release
                      </button>
                    </form>
                  )}
                </div>
              </GlassPanel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
