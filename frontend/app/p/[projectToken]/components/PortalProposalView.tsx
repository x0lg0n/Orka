"use client";
import { useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { portalAcceptProposal, portalRequestChanges } from "../actions";

export function PortalProposalView({
  token,
  proposal,
}: {
  token: string;
  proposal: { id: string; title: string | null; markdown: string | null; status: string };
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function accept() {
    setBusy(true);
    await portalAcceptProposal({ token });
    setBusy(false);
    setDone(true);
  }
  async function request() {
    setBusy(true);
    await portalRequestChanges({ token, note });
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return <p className="text-sm text-gray-500">Thank you — your response was recorded.</p>;
  }

  const responded = proposal.status === "accepted" || proposal.status === "changes_requested";

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold tracking-tight text-gray-900">
        {proposal.title ?? "Proposal"}
      </h2>
      <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-white p-6 text-sm leading-relaxed text-gray-500 shadow-sm">
        {proposal.markdown}
      </div>
      {!responded && (
        <div className="flex items-start gap-3">
          <button
            onClick={accept}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6d28d9] disabled:opacity-50"
          >
            <Check className="h-4 w-4" /> Accept proposal
          </button>
          <div className="flex flex-1 flex-col gap-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Request changes…"
              className="w-full rounded-lg border border-gray-200 bg-white p-2 text-sm outline-none focus:border-[#7c3aed]"
            />
            <button
              onClick={request}
              disabled={busy}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" /> Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
