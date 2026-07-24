"use client";
import { useState } from "react";
import { CheckCircle2, Clock, FileSignature } from "lucide-react";
import { signContractAgency } from "../../actions";

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
  icon,
}: {
  label: string;
  sig: string | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${sig ? "bg-emerald-50" : "bg-gray-100"}`}>
          {sig
            ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            : <Clock className="h-4 w-4 text-gray-400" />
          }
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{label}</p>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                sig
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              {sig ? "Signed" : "Pending"}
            </span>
          </div>
          {sig ? (
            <p className="mt-0.5 font-mono text-xs text-gray-400">
              {sig.slice(0, 16)}…{sig.slice(-8)}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-gray-400">Awaiting signature</p>
          )}
        </div>
      </div>
      {icon}
    </div>
  );
}

export function ContractSigningPanel({
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
    const res = await signContractAgency({ projectId, orgId });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSigned();
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FileSignature className="h-5 w-5 text-[#7c3aed]" />
        <h3 className="text-sm font-semibold text-gray-900">Signatures</h3>
      </div>

      <SigRow label="Agency" sig={agencySig} icon={<span className="h-5 w-5 rounded bg-[#7c3aed]/10 text-center text-[10px] font-bold leading-5 text-[#7c3aed]">A</span>} />
      <SigRow label="Client" sig={clientSig} icon={<span className="h-5 w-5 rounded bg-blue-50 text-center text-[10px] font-bold leading-5 text-blue-500">C</span>} />

      {!agencySig && (
        <div className="mt-5">
          <button
            onClick={handleSign}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6d28d9] disabled:opacity-50"
          >
            <FileSignature className="h-4 w-4" />
            {busy ? "Signing…" : "Sign as agency"}
          </button>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {agencySig && !clientSig && (
        <div className="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
          Signed by agency. Waiting for client to sign via the portal.
        </div>
      )}

      {agencySig && clientSig && (
        <div className="mt-5 rounded-lg bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
          Both parties have signed. Contract is complete.
        </div>
      )}
    </section>
  );
}
