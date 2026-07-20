// frontend/app/p/[projectToken]/components/PortalContractActions.tsx
"use client";

import { useState, useTransition } from "react";
import {
  portalSignContract,
  portalFundEscrow,
} from "../actions";

type Mode = "orka" | "freighter";

export function PortalContractActions({
  token,
  contractAddress,
  contractId,
  custodyMode,
  signed,
  funded,
  totalAmount,
  milestoneIds,
}: {
  token: string;
  contractAddress: string | null;
  contractId: string | null;
  custodyMode: Mode;
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
    "inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50";

  return (
    <div className="space-y-2">
      {!signed && !done ? (
        <button
          type="button"
          disabled={pending}
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
          disabled={pending}
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
          {done === "sign" ? "Signature submitted" : "Funding submitted"} — awaiting on-chain confirmation.
        </span>
      ) : null}

      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : null}

      {contractId ? null : (
        <p className="text-xs text-muted-foreground">
          No on-chain contract yet.
        </p>
      )}
    </div>
  );
}
