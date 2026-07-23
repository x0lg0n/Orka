import Link from "next/link";
import { Lock, ExternalLink, ShieldCheck, ArrowRight } from "lucide-react";

type EscrowRow = {
  id: string;
  status: string;
  contract_address: string | null;
  total_amount?: number;
  total_funded?: number;
  asset: string;
  created_at: string;
} | null;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function escrowStatusBadge(status: string) {
  const map: Record<string, { label: string; color: string }> = {
    funded: {
      label: "Funded",
      color: "bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20",
    },
    released: {
      label: "Released",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    pending: {
      label: "Pending",
      color: "bg-amber-50 text-amber-600 border-amber-200",
    },
  };
  return (
    map[status] ?? {
      label: status,
      color: "bg-gray-50 text-gray-600 border-gray-200",
    }
  );
}

function statRow(label: string, value: string, accent?: string) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-semibold ${accent ?? "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}

export function EscrowDetailsCard({
  escrow,
  slug,
  projectId,
}: {
  escrow: EscrowRow;
  slug: string;
  projectId: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#7c3aed] opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#7c3aed]" />
        <h3 className="text-sm font-semibold text-gray-900">Escrow Details</h3>
      </div>

      {escrow ? (
        <>
          <div className="mt-3 space-y-0.5 rounded-lg bg-gray-50/50 px-3 py-2">
            {statRow("Status", "", "")}
            <div className="mb-1.5">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${escrowStatusBadge(escrow.status).color}`}
              >
                {escrowStatusBadge(escrow.status).label}
              </span>
            </div>
            {statRow(
              "Total Amount",
              `${Number(escrow.total_amount ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${escrow.asset ?? "XLM"}`,
            )}
            {statRow(
              "Funded",
              `${Number(escrow.total_funded ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${escrow.asset ?? "XLM"}`,
              escrow.total_funded && escrow.total_amount && escrow.total_funded >= escrow.total_amount
                ? "text-emerald-600"
                : "text-amber-600",
            )}
            {statRow(
              "Created",
              formatDate(escrow.created_at),
              "text-gray-500",
            )}
          </div>

          <Link
            href={`/w/${slug}/projects/${projectId}/escrow`}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#7c3aed]/20 hover:bg-[#7c3aed]/5 hover:text-[#7c3aed]"
          >
            <Lock className="h-3 w-3" />
            View Escrow
            <ArrowRight className="h-3 w-3" />
          </Link>
        </>
      ) : (
        <div className="mt-4 flex flex-col items-center py-4 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <p className="mt-2 text-xs text-gray-400">No escrow configured</p>
        </div>
      )}
    </div>
  );
}
