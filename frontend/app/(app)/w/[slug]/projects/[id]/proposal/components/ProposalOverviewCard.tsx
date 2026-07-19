"use client";

import { Check, Edit } from "lucide-react";
import { PROPOSAL_STATUS_CONFIG, type ProposalRow, type ProjectRow, type ClientRow } from "./types";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency: string): string {
  return `${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${currency}`;
}

function getDaysRemaining(validUntil: string | null): number | null {
  if (!validUntil) return null;
  const now = new Date();
  const expiry = new Date(validUntil);
  const diffMs = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function ProposalOverviewCard({
  proposal,
  project,
  client,
}: {
  proposal: ProposalRow;
  project: ProjectRow;
  client: ClientRow;
}) {
  const statusConfig = PROPOSAL_STATUS_CONFIG[proposal.status];
  const daysRemaining = getDaysRemaining(proposal.valid_until);
  const summaryItems = proposal.summary
    ? proposal.summary.split("\n").filter((s) => s.trim())
    : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Proposal Overview */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Proposal Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Client</span>
              <span className="font-medium text-gray-900">
                {client?.name ?? project.client_name ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Project</span>
              <span className="font-medium text-gray-900">{project.title}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Proposal Amount</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(proposal.amount, proposal.currency)}
                {proposal.usd_equivalent != null && (
                  <span className="ml-1 text-gray-400">
                    ≈ ${Number(proposal.usd_equivalent).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Valid Until</span>
              <span className="font-medium text-gray-900">
                {formatDate(proposal.valid_until)}
                {daysRemaining != null && (
                  <span className="ml-1 text-gray-400">
                    ({daysRemaining} days)
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
            </div>
            {proposal.accepted_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Accepted Date</span>
                <span className="font-medium text-gray-900">
                  {formatDate(proposal.accepted_at)}
                </span>
              </div>
            )}
            {proposal.payment_terms && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Terms</span>
                <span className="max-w-[200px] text-right font-medium text-gray-900">
                  {proposal.payment_terms}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" />
            Edit Proposal
          </button>
        </div>

        {/* Right: Proposal Summary */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Proposal Summary
          </h3>
          {summaryItems.length > 0 ? (
            <ul className="space-y-2.5">
              {summaryItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No summary provided.</p>
          )}
        </div>
      </div>
    </div>
  );
}
