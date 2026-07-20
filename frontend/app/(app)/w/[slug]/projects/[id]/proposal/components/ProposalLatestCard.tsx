"use client";

import { FileText, Eye, MoreHorizontal } from "lucide-react";
import { PROPOSAL_STATUS_CONFIG, type ProposalRow, type OwnerRow } from "./types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency: string): string {
  return `${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${currency}`;
}

export function ProposalLatestCard({
  proposal,
  owner,
}: {
  proposal: ProposalRow;
  owner: OwnerRow;
}) {
  const statusConfig = PROPOSAL_STATUS_CONFIG[proposal.status];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Latest Version
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <FileText className="h-5 w-5 text-[#7c3aed]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {proposal.title}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              by {owner?.full_name ?? "Unknown"} on {formatDate(proposal.created_at)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {formatCurrency(proposal.amount, proposal.currency)}
          </span>
          {proposal.usd_equivalent != null && (
            <span className="text-xs text-gray-400">
              ≈ ${Number(proposal.usd_equivalent).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          )}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            Preview PDF
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
