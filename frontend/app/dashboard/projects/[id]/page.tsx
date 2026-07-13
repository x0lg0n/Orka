import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, CircleDollarSign, Send, ShieldCheck } from "lucide-react";
import { createClient } from "../../../../lib/supabase/server";
import { getActiveOrgId } from "../../../../lib/orka";
import {
  fundMilestone,
  submitMilestone,
  approveMilestone,
  releaseMilestone,
} from "../../../../app/actions";
import FreighterMilestoneButton from "../../_components/FreighterMilestoneButton";
import {
  EmptyState,
  GlassPanel,
  PageHeader,
  StatusPill,
} from "../../_components/DashboardUI";

const btn =
  "inline-flex items-center gap-2 rounded-[16px] border border-cyan-200/30 px-4 py-2 text-xs font-black uppercase transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-200/50 disabled:opacity-40";

type MilestoneRow = {
  id: string;
  title: string | null;
  amount: number | null;
  status: string;
  chain_index: number | null;
};

type ProjectRow = {
  id: string;
  title: string | null;
  description: string | null;
  client_name: string | null;
  freelancer_name: string | null;
  contract_id: string | null;
};

export const metadata = { title: "Project · ORKA" };

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  if (!(await getActiveOrgId(supabase))) redirect("/onboarding");

  const { data: profile } = await supabase
    .from("profiles")
    .select("custody_mode")
    .eq("id", user.id)
    .maybeSingle();
  const freighterMode = profile?.custody_mode === "freighter";

  const { data: project } = (await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()) as { data: ProjectRow | null };

  const { data: milestones } = (await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("chain_index", { ascending: true })) as {
    data: MilestoneRow[] | null;
  };

  return (
    <div>
      <Link
        href="/dashboard/projects"
        className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase text-cyan-200 transition hover:text-lime"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back
      </Link>
      <PageHeader
        eyebrow="Project escrow"
        title={project?.title ?? "Untitled"}
        description={project?.description ?? "Milestone funding, review, approval, and release controls for this project."}
      />

      <GlassPanel className="p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <Info label="Client" value={project?.client_name ?? "-"} />
          <Info label="Freelancer" value={project?.freelancer_name ?? "-"} />
          <Info
            label="Contract"
            value={project?.contract_id ? project.contract_id.slice(0, 18) + "..." : "Not deployed"}
          />
        </div>
      </GlassPanel>

      <p className="mt-4 rounded-[18px] border border-orange-300/25 bg-orange-300/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-orange-100">
        Demo mode: chain actions are simulated (no real Stellar). Any workspace member can act as client or freelancer.
      </p>

      <div className="mt-6 grid gap-4">
        {milestones?.map((m) => (
          <GlassPanel key={m.id} className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="font-black uppercase text-white">{m.title}</p>
                <p className="mt-1 text-sm font-bold text-slate-400">
                  {m.amount != null ? `$${Number(m.amount).toLocaleString()} USDC` : "No amount"}
                </p>
              </div>
              <StatusPill status={m.status} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {m.status === "draft" &&
                (freighterMode ? (
                  project?.contract_id ? (
                    <FreighterMilestoneButton
                      contractId={project.contract_id}
                      milestoneIds={m.chain_index != null ? [m.chain_index] : []}
                      milestoneId={m.chain_index ?? 0}
                      dbId={m.id}
                      eventType="fund"
                      label="Fund"
                    />
                  ) : (
                    <span className={`${btn} bg-cyan-300 text-[#04101f] opacity-40`}>
                      No contract
                    </span>
                  )
                ) : (
                  <form action={fundMilestone}>
                    <input type="hidden" name="milestoneId" value={m.id} />
                    <button className={`${btn} bg-cyan-300 text-[#04101f]`}>
                      <CircleDollarSign className="size-4" aria-hidden />
                      Fund
                    </button>
                  </form>
                ))}
              {m.status === "funded" && (
                <form action={submitMilestone}>
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <button className={`${btn} bg-violet text-white`}>
                    <Send className="size-4" aria-hidden />
                    Submit work
                  </button>
                </form>
              )}
              {m.status === "in_review" && (
                <form action={approveMilestone}>
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <button className={`${btn} bg-lime text-[#04101f]`}>
                    <CheckCircle2 className="size-4" aria-hidden />
                    Approve
                  </button>
                </form>
              )}
              {m.status === "approved" &&
                (freighterMode ? (
                  project?.contract_id ? (
                    <FreighterMilestoneButton
                      contractId={project.contract_id}
                      milestoneIds={m.chain_index != null ? [m.chain_index] : []}
                      milestoneId={m.chain_index ?? 0}
                      dbId={m.id}
                      eventType="release"
                      label="Release"
                    />
                  ) : (
                    <span className={`${btn} bg-cyan-300 text-[#04101f] opacity-40`}>
                      No contract
                    </span>
                  )
                ) : (
                  <form action={releaseMilestone}>
                    <input type="hidden" name="milestoneId" value={m.id} />
                    <button className={`${btn} bg-cyan-300 text-[#04101f]`}>
                      <ShieldCheck className="size-4" aria-hidden />
                      Release
                    </button>
                  </form>
                ))}
            </div>
          </GlassPanel>
        ))}
        {(!milestones || milestones.length === 0) && (
          <EmptyState
            title="No milestones yet"
            description="Milestones created from accepted proposal terms will appear here."
          />
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-bold text-white">{value}</p>
    </div>
  );
}
