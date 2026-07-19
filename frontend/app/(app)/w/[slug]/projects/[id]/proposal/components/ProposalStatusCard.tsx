"use client";

import { Check } from "lucide-react";
import { type ProposalRow, type ProposalActivityItem } from "./types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TIMELINE_STEPS = [
  { key: "draft", label: "Draft Created" },
  { key: "sent", label: "Sent to Client" },
  { key: "viewed", label: "Viewed by Client" },
  { key: "accepted", label: "Accepted" },
] as const;

export function ProposalStatusCard({
  proposal,
  activity,
}: {
  proposal: ProposalRow;
  activity: ProposalActivityItem[];
}) {
  const statusOrder = ["draft", "sent", "viewed", "accepted"];
  const currentIndex = statusOrder.indexOf(proposal.status);

  const getDateForStatus = (status: string): string | null => {
    const item = activity.find((a) => a.type === `proposal_${status}`);
    if (item) return formatDate(item.created_at);
    if (status === proposal.status) return formatDate(proposal.updated_at);
    return null;
  };

  const isRejected = proposal.status === "rejected";
  const isExpired = proposal.status === "expired";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Proposal Status
      </h3>
      <div className="space-y-0">
        {TIMELINE_STEPS.map((step, i) => {
          const date = getDateForStatus(step.key);
          const isCompleted = i <= currentIndex && !isRejected;

          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isCompleted ? "bg-emerald-500" : "bg-gray-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                  )}
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 ${
                      i < currentIndex ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              <div className="pb-4">
                <div
                  className={`text-sm font-medium ${
                    isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </div>
                {date && (
                  <div className="text-xs text-gray-400">{date}</div>
                )}
              </div>
            </div>
          );
        })}

        {isRejected && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                <span className="text-xs font-bold text-white">✕</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-red-600">Rejected</div>
              <div className="text-xs text-gray-400">
                {formatDate(proposal.updated_at)}
              </div>
            </div>
          </div>
        )}

        {isExpired && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400">
                <span className="text-xs font-bold text-white">—</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Expired</div>
              <div className="text-xs text-gray-400">
                {formatDate(proposal.updated_at)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
