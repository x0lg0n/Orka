"use client";

import { useState, useTransition } from "react";
import {
  portalSignContract,
  portalFundEscrow,
} from "../actions";
import { AlertCircle } from "lucide-react";

type Mode = "orka" | "freighter";

export function PortalContractActions({
  token,
  contractAddress,
  contractId,
  custodyMode,
  clientAddress,
  signed,
  funded,
  totalAmount,
  milestoneIds,
}: {
  token: string;
  contractAddress: string | null;
  contractId: string | null;
  custodyMode: Mode;
  clientAddress: string | null;
  signed: boolean;
  funded: boolean;
  totalAmount: number;
  milestoneIds: number[];
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(
    key: string,
    fn: () => Promise<{ ok: true; txHash: string } | { ok: false; error: string }>,
  ) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) setDone(key);
      else setError(res.error);
    });
  }

  const btn =
    "inline-flex items-center rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-semibold text-white hover:bg-[#6d28d9] disabled:opacity-50";

  const needsWallet = custodyMode === "freighter" && !clientAddress;

  return (
    <div className="space-y-2">
      {needsWallet ? (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
          <span>Connect your wallet above to sign the contract and fund escrow.</span>
        </div>
      ) : null}

      {!signed && !done ? (
        <button
          type="button"
          disabled={pending || needsWallet}
          onClick={() =>
            run("sign", () => portalSignContract({ token, mode: custodyMode }))
          }
          className={btn}
        >
          {pending && done !== "sign"
            ? "Pending confirmation…"
            : "Sign contract"}
        </button>
      ) : null}

      {signed && !funded && contractAddress && !done ? (
        <button
          type="button"
          disabled={pending || needsWallet}
          onClick={() =>
            run("fund", () =>
              portalFundEscrow({
                token,
                contractAddress,
                amount: totalAmount,
                milestoneIds,
                mode: custodyMode,
              }),
            )
          }
          className={btn}
        >
          {pending && done !== "fund" ? "Pending confirmation…" : "Fund escrow"}
        </button>
      ) : null}

      {done ? (
        <span className="text-xs font-medium text-emerald-600">
          {done === "sign" ? "Signature submitted" : "Funding submitted"}
        </span>
      ) : null}

      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : null}

      {contractId ? null : (
        <p className="text-xs text-gray-500">
          No on-chain contract yet.
        </p>
      )}
    </div>
  );
}
