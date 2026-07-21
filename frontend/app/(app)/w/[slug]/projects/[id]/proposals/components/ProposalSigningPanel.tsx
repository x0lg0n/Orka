"use client";
import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { signProposalAgency } from "../../actions";

type Props = {
  projectId: string;
  orgId: string;
  agencySig: string | null;
  clientSig: string | null;
  status: string;
  onSigned: () => void;
};

function SigRow({
  label,
  sig,
}: {
  label: string;
  sig: string | null;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {sig ? (
          <p className="font-mono text-xs text-gray-500">
            {sig.slice(0, 12)}…{sig.slice(-6)}
          </p>
        ) : (
          <p className="text-xs text-gray-400">Pending signature</p>
        )}
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
          sig
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {sig ? (
          <><CheckCircle2 className="h-3 w-3" /> Signed</>
        ) : (
          <><Clock className="h-3 w-3" /> Pending</>
        )}
      </span>
    </div>
  );
}

export function ProposalSigningPanel({
  projectId,
  orgId,
  agencySig,
  clientSig,
  status,
  onSigned,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSign() {
    setBusy(true);
    setError(null);
    const res = await signProposalAgency({ projectId, orgId });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSigned();
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Signatures</h3>
      <SigRow label="Agency" sig={agencySig} />
      <SigRow label="Client" sig={clientSig} />

      {!agencySig && (
        <div className="mt-4">
          <button
            onClick={handleSign}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {busy ? "Signing…" : "Sign as agency"}
          </button>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {agencySig && !clientSig && (
        <p className="mt-3 text-xs text-gray-500">
          Sent to client. Waiting for them to sign via the portal.
        </p>
      )}

      {agencySig && clientSig && (
        <p className="mt-3 text-xs font-medium text-green-700">
          Both parties have signed. Proposal is accepted.
        </p>
      )}
    </section>
  );
}
