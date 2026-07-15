import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import {
  ActivityFeed,
  CashFlowChart,
  GlassPanel,
  MetricCard,
  PageHeader,
  StatusPill,
  metricIcons,
} from "@/app/dashboard/_components/DashboardUI";

export const metadata = {
  title: "Dashboard · ORKA",
  description: "Your ORKA workspace.",
};

type MilestoneRow = {
  amount: number | null;
  status: string | null;
};

type LedgerRow = {
  id: string;
  event_type: string | null;
  amount: number | null;
  status: string | null;
};

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup");

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  const orgId = org?.id ?? null;

  const [
    profileResult,
    proposalsResult,
    projectsResult,
    milestonesResult,
    ledgerResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, custody_mode, stellar_address")
      .eq("id", user.id)
      .maybeSingle(),
    orgId
      ? supabase
          .from("proposals")
          .select("id, status", { count: "exact" })
          .eq("org_id", orgId)
      : Promise.resolve({ data: null, count: 0 }),
    orgId
      ? supabase
          .from("projects")
          .select("id, status, contract_id", { count: "exact" })
          .eq("org_id", orgId)
      : Promise.resolve({ data: null, count: 0 }),
    orgId
      ? supabase.from("milestones").select("amount, status").eq("org_id", orgId)
      : Promise.resolve({ data: null }),
    orgId
      ? supabase
          .from("ledger_events")
          .select("id, event_type, amount, status")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false })
          .limit(5)
      : Promise.resolve({ data: null }),
  ]);

  const profile = profileResult.data;
  const proposals = proposalsResult.data ?? [];
  const projects = projectsResult.data ?? [];
  const milestones = (milestonesResult.data as MilestoneRow[] | null) ?? [];
  const ledger = (ledgerResult.data as LedgerRow[] | null) ?? [];
  const activeProjects = projects.filter((project) => project.contract_id).length;
  const proposalDrafts = proposals.filter((proposal) => proposal.status === "draft").length;
  const payable = milestones
    .filter((milestone) => milestone.status === "draft" || milestone.status === "approved")
    .reduce((sum, milestone) => sum + Number(milestone.amount ?? 0), 0);
  const funded = milestones
    .filter((milestone) => milestone.status === "funded")
    .reduce((sum, milestone) => sum + Number(milestone.amount ?? 0), 0);
  const released = milestones
    .filter((milestone) => milestone.status === "released")
    .reduce((sum, milestone) => sum + Number(milestone.amount ?? 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow="Workspace command"
        title="Dashboard"
        description="Monitor proposal intake, escrow milestones, and payment movement from one operating surface."
        action={
          <Link
            href={`/w/${slug}/proposals/new`}
            className="inline-flex items-center gap-2 rounded-[16px] border border-cyan-200/30 bg-cyan-300 px-4 py-2 text-sm font-black uppercase text-[#04101f] transition hover:-translate-y-0.5 hover:bg-lime focus:outline-none focus:ring-2 focus:ring-cyan-200/50"
          >
            New proposal
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Proposals"
          value={String(proposalsResult.count ?? proposals.length)}
          detail={`${proposalDrafts} waiting for acceptance`}
          icon={metricIcons.proposals}
          tone="cyan"
          spark={[2, 3, proposals.length + 1, 4, proposalDrafts + 2, 5]}
        />
        <MetricCard
          label="Projects"
          value={String(projectsResult.count ?? projects.length)}
          detail={`${activeProjects} active contracts`}
          icon={metricIcons.projects}
          tone="lime"
          spark={[1, 2, activeProjects + 1, 3, projects.length + 1, 4]}
        />
        <MetricCard
          label="Payable"
          value={`$${payable.toLocaleString()}`}
          detail="Needs funding or release"
          icon={metricIcons.payments}
          tone="orange"
          spark={[1, payable ? 3 : 1, 2, 5, payable ? 6 : 2, 4]}
        />
        <MetricCard
          label="Released"
          value={`$${released.toLocaleString()}`}
          detail="Completed milestone value"
          icon={metricIcons.value}
          tone="violet"
          spark={[1, 2, 4, released ? 7 : 2, 5, 8]}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <CashFlowChart funded={funded} released={released} pending={payable} />
        <ActivityFeed
          items={ledger.map((event) => ({
            id: event.id,
            label: event.event_type ?? "Ledger event",
            amount: event.amount,
            status: event.status,
          }))}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <GlassPanel className="p-5 lg:col-span-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200/70">
            Account
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info label="Email" value={user.email ?? "-"} />
            <Info
              label="Email confirmed"
              value={user.email_confirmed_at ? "Yes" : "Check inbox"}
            />
            <Info label="Name" value={profile?.full_name ?? "-"} />
            <Info label="Custody" value={profile?.custody_mode ?? "orka"} />
            <Info
              label="Stellar address"
              value={profile?.stellar_address ?? "Not connected"}
              wide
            />
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200/70">
            Next actions
          </p>
          <div className="mt-5 flex flex-col gap-3">
            <ActionRow
              icon={<Clock3 className="size-4" aria-hidden />}
              label="Review drafts"
              status={`${proposalDrafts} open`}
            />
            <ActionRow
              icon={<CheckCircle2 className="size-4" aria-hidden />}
              label="Release ready funds"
              status={`$${payable.toLocaleString()}`}
            />
            <Link
              href={`/w/${slug}/payments`}
              className="mt-2 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 py-3 text-center text-sm font-black uppercase text-white transition hover:-translate-y-0.5 hover:bg-white/[0.1]"
            >
              Open payments
            </Link>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border border-white/10 bg-black/20 p-4 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function ActionRow({
  icon,
  label,
  status,
}: {
  icon: ReactNode;
  label: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/20 p-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-9 place-items-center rounded-[14px] bg-cyan-300/15 text-cyan-100">
          {icon}
        </span>
        <p className="truncate text-sm font-black uppercase text-white">{label}</p>
      </div>
      <StatusPill status={status} />
    </div>
  );
}
