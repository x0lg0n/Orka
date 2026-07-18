import Link from "next/link";
import { Check, ExternalLink, Plus } from "lucide-react";
import { acceptProposal } from "@/app/actions";
import {
  AlertBanner,
  EmptyState,
  GlassPanel,
  PageHeader,
  StatusPill,
} from "@/components/dashboard/DashboardUI";

export interface ProposalListItem {
  id: string;
  client_address: string;
  freelancer_address: string;
  asset: string | null;
  status: string;
  contract_id: string | null;
  project_id: string | null;
  created_at: string;
}

export function ProposalsHeader({ slug }: { slug: string }) {
  return (
    <PageHeader
      eyebrow="Deal intake"
      title="Proposals"
      description="Draft, accept, and convert escrow proposals into active project contracts."
      action={
        <Link
          href={`/w/${slug}/proposals/new`}
          className="inline-flex items-center gap-2 rounded-[16px] border border-cyan-200/30 bg-cyan-300 px-4 py-2 text-sm font-black uppercase text-[#04101f] transition hover:-translate-y-0.5 hover:bg-lime focus:outline-none focus:ring-2 focus:ring-cyan-200/50"
        >
          <Plus className="size-4" aria-hidden />
          New proposal
        </Link>
      }
    />
  );
}

export function ProposalCard({
  proposal,
  slug,
}: {
  proposal: ProposalListItem;
  slug: string;
}) {
  const p = proposal;
  return (
    <li
      className="rounded-[24px] border border-white/10 bg-white/[0.065] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <StatusPill status={p.status} />
            {p.contract_id && (
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-slate-400">
                {p.contract_id.slice(0, 12)}...
              </span>
            )}
          </div>
          <dl className="grid gap-3 text-sm font-bold lg:grid-cols-2">
            <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Client
              </dt>
              <dd className="mt-1 break-all text-slate-100">
                {p.client_address}
              </dd>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-black/20 p-3">
              <dt className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Freelancer
              </dt>
              <dd className="mt-1 break-all text-slate-100">
                {p.freelancer_address}
              </dd>
            </div>
          </dl>
        </div>

        {p.status === "draft" ? (
          <form action={acceptProposal.bind(null, p.id)}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-[16px] border border-cyan-200/30 bg-cyan-300 px-4 py-2 text-sm font-black uppercase text-[#04101f] transition hover:-translate-y-0.5 hover:bg-lime focus:outline-none focus:ring-2 focus:ring-cyan-200/50"
            >
              <Check className="size-4" aria-hidden />
              Accept
            </button>
          </form>
        ) : (
          <Link
            href={`/w/${slug}/projects/${p.project_id ?? ""}`}
            className="inline-flex items-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black uppercase text-white transition hover:-translate-y-0.5 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-cyan-200/50"
          >
            <ExternalLink className="size-4" aria-hidden />
            View
          </Link>
        )}
      </div>
    </li>
  );
}
