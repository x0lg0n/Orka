// frontend/app/p/[projectToken]/components/PortalMilestoneActions.tsx
"use client";

import { useState, useTransition } from "react";
import {
  portalApproveMilestone,
  portalReleaseMilestone,
} from "../actions";

type Mode = "orka" | "freighter";

export function PortalMilestoneActions({
  token,
  contractAddress,
  milestoneId,
  status,
  mode,
}: {
  token: string;
  contractAddress: string;
  milestoneId: string;
  status: string;
  mode: Mode;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Release is only available once the milestone has been approved by the
  // client. The contract/backend still enforces client+operator multi-sig.
  const canRelease = status === "approved";

  function run(fn: () => Promise<{ ok: true; txHash: string } | { ok: false; error: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) setDone(true);
      else setError(res.error);
    });
  }

  const btn =
    "inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50";

  return (
    <div className="flex items-center gap-2">
      {!done ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(() =>
              portalApproveMilestone({ token, contractAddress, milestoneId, mode }),
            )
          }
          className={btn}
        >
          {pending ? "Pending confirmation…" : "Approve"}
        </button>
      ) : null}

      {canRelease && !done ? (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(() =>
              portalReleaseMilestone({ token, contractAddress, milestoneId, mode }),
            )
          }
          className={btn}
        >
          {pending ? "Pending confirmation…" : "Release"}
        </button>
      ) : null}

      {done ? (
        <span className="text-xs font-medium text-emerald-600">
          Submitted — awaiting on-chain confirmation.
        </span>
      ) : null}

      {error ? (
        <span className="text-xs font-medium text-red-600">{error}</span>
      ) : null}
    </div>
  );
}
