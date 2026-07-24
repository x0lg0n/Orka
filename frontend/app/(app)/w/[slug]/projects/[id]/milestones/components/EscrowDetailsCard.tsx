import Link from "next/link";
import { ShieldCheck, ExternalLink, Lock } from "lucide-react";

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

function FieldRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-semibold ${accent ?? "text-gray-900"}`}>{value}</span>
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
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#7c3aed]" />
          <h3 className="text-sm font-semibold text-gray-900">Escrow</h3>
        </div>
      </div>

      <div className="p-4">
        {escrow ? (
          <>
            <div className="space-y-0.5 rounded-lg bg-gray-50/50 px-3 py-2">
              <div className="mb-1.5">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${escrowStatusBadge(escrow.status).color}`}
                >
                  {escrowStatusBadge(escrow.status).label}
                </span>
              </div>
              <FieldRow
                label="Total"
                value={`${Number(escrow.total_amount ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${escrow.asset ?? "XLM"}`}
              />
              <FieldRow
                label="Funded"
                value={`${Number(escrow.total_funded ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${escrow.asset ?? "XLM"}`}
                accent={
                  escrow.total_funded && escrow.total_amount && escrow.total_funded >= escrow.total_amount
                    ? "text-emerald-600"
                    : "text-amber-600"
                }
              />
              <FieldRow
                label="Created"
                value={formatDate(escrow.created_at)}
                accent="text-gray-500"
              />
              {escrow.contract_address && (
                <div className="flex items-center gap-1.5 py-1.5">
                  <span className="text-xs text-gray-500">Contract</span>
                  <code className="ml-auto truncate rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-600">
                    {escrow.contract_address.slice(0, 12)}...
                  </code>
                </div>
              )}
            </div>

            <Link
              href={`/w/${slug}/projects/${projectId}/escrow`}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-600 transition hover:border-[#7c3aed]/20 hover:bg-[#7c3aed]/5 hover:text-[#7c3aed]"
            >
              <ExternalLink className="h-3 w-3" />
              View Escrow Details
            </Link>
          </>
        ) : (
          <div className="flex flex-col items-center py-5 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-gray-200">
              <Lock className="h-4 w-4 text-gray-300" />
            </div>
            <p className="mt-2 text-xs text-gray-400">No escrow deployed</p>
            <p className="mt-0.5 text-[11px] text-gray-300">
              Create milestones then deploy escrow
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
