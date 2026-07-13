"use client";

import { useState } from "react";
import { createProposal } from "../../../actions";

const TESTNET_USDC =
  "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export default function NewProposalForm() {
  const [rows, setRows] = useState<{ amount: string; description: string }[]>([
    { amount: "", description: "" },
  ]);

  return (
    <form action={createProposal} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm font-bold uppercase tracking-[0.1em] text-slate-400">
        Client address
        <input
          name="client_address"
          required
          placeholder="G..."
          className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-base font-bold normal-case tracking-normal text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-200/50"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-bold uppercase tracking-[0.1em] text-slate-400">
        Freelancer address
        <input
          name="freelancer_address"
          required
          placeholder="G..."
          className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-base font-bold normal-case tracking-normal text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-200/50"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-bold uppercase tracking-[0.1em] text-slate-400">
        Asset (testnet USDC)
        <input
          name="asset"
          defaultValue={TESTNET_USDC}
          className="rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-base font-bold normal-case tracking-normal text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-200/50"
        />
      </label>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-bold uppercase tracking-[0.1em] text-slate-400">
          Milestones
        </span>
        {rows.map((row, i) => (
          <div key={i} className="flex flex-col gap-3 sm:flex-row">
            <input
              name="amount"
              inputMode="decimal"
              value={row.amount}
              onChange={(e) =>
                setRows((r) =>
                  r.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)),
                )
              }
              placeholder="Amount"
              className="w-full rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-base font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-200/50 sm:w-36"
            />
            <input
              name="description"
              value={row.description}
              onChange={(e) =>
                setRows((r) =>
                  r.map((x, j) =>
                    j === i ? { ...x, description: e.target.value } : x,
                  ),
                )
              }
              placeholder="Description"
              className="min-w-0 flex-1 rounded-[18px] border border-white/10 bg-black/25 px-4 py-3 text-base font-bold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-200/50"
            />
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
                className="rounded-[18px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-black uppercase text-white transition hover:bg-white/[0.1]"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((r) => [...r, { amount: "", description: "" }])}
          className="self-start rounded-[16px] border border-white/10 bg-white/[0.06] px-5 py-2 text-sm font-black uppercase text-white transition hover:-translate-y-0.5 hover:bg-white/[0.1]"
        >
          + Add milestone
        </button>
      </div>

      <button
        type="submit"
        className="self-start rounded-[16px] border border-cyan-200/30 bg-cyan-300 px-6 py-3 text-sm font-black uppercase text-[#04101f] transition hover:-translate-y-0.5 hover:bg-lime focus:outline-none focus:ring-2 focus:ring-cyan-200/50"
      >
        Create proposal
      </button>
    </form>
  );
}
