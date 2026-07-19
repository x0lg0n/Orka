import Link from "next/link";
import { Lock, ExternalLink } from "lucide-react";

type EscrowRow = {
  id: string;
  status: string;
  amount: number;
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
      color: "bg-[#7c3aed]/10 text-[#7c3aed]",
    },
    released: {
      label: "Released",
      color: "bg-emerald-50 text-emerald-600",
    },
    pending: {
      label: "Pending",
      color: "bg-amber-50 text-amber-600",
    },
  };
  return (
    map[status] ?? {
      label: status,
      color: "bg-gray-100 text-gray-600",
    }
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Escrow Details</h3>

      {escrow ? (
        <>
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Escrow ID</span>
              <span className="font-mono text-xs text-gray-700">
                {escrow.id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${escrowStatusBadge(escrow.status).color}`}
              >
                {escrowStatusBadge(escrow.status).label}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Funded Amount</span>
              <span className="font-medium text-gray-900">
                {Number(escrow.amount).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })}{" "}
                {escrow.asset}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Funded Date</span>
              <span className="text-gray-700">
                {formatDate(escrow.created_at)}
              </span>
            </div>
          </div>

          <Link
            href={`/w/${slug}/projects/${projectId}/escrow`}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Lock className="h-3.5 w-3.5" />
            View Escrow
            <ExternalLink className="h-3 w-3" />
          </Link>
        </>
      ) : (
        <div className="mt-4 flex flex-col items-center py-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <p className="mt-2 text-sm text-gray-400">No escrow configured</p>
        </div>
      )}
    </div>
  );
}
