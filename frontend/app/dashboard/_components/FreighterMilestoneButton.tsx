"use client";

import { useState } from "react";
import { orkaClient, submitFreighterXdr } from "../../../lib/stellar";
import { freighterApplyTx } from "../../../app/actions";

export default function FreighterMilestoneButton({
  contractId,
  milestoneIds,
  milestoneId,
  dbId,
  eventType,
  label,
}: {
  contractId: string;
  milestoneIds: number[];
  milestoneId: number;
  dbId: string;
  eventType: "fund" | "release";
  label: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setError(null);
    setPending(true);
    try {
      const client = orkaClient("freighter");
      const res =
        eventType === "fund"
          ? await client.fundEscrow({ contractId, milestoneIds })
          : await client.releaseMilestone({ contractId, milestoneId });
      const txXdr = (res as { txXdr: string }).txXdr;
      const txHash = await submitFreighterXdr(txXdr);

      const fd = new FormData();
      fd.set("milestoneId", String(dbId));
      fd.set("eventType", eventType);
      fd.set("txHash", txHash);
      await freighterApplyTx(fd);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-2">
      <button
        type="button"
        onClick={handle}
        disabled={pending}
        className="w-fit rounded-[16px] border border-cyan-200/30 bg-cyan-300 px-5 py-2 text-sm font-black uppercase text-[#04101f] transition hover:-translate-y-0.5 hover:bg-lime disabled:opacity-40"
      >
        {pending ? "Awaiting wallet..." : label}
      </button>
      {error && (
        <p className="rounded-[14px] border border-orange/25 bg-orange/10 px-3 py-2 text-xs font-bold uppercase text-orange">
          {error}
        </p>
      )}
    </div>
  );
}
