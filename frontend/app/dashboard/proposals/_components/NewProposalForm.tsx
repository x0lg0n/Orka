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
      <label className="flex flex-col gap-1 text-sm font-bold uppercase text-ink/70">
        Client address
        <input
          name="client_address"
          required
          placeholder="G..."
          className="rounded-2xl border-2 border-ink bg-white px-4 py-2 text-base font-normal text-ink outline-none focus:border-orange"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold uppercase text-ink/70">
        Freelancer address
        <input
          name="freelancer_address"
          required
          placeholder="G..."
          className="rounded-2xl border-2 border-ink bg-white px-4 py-2 text-base font-normal text-ink outline-none focus:border-orange"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-bold uppercase text-ink/70">
        Asset (testnet USDC)
        <input
          name="asset"
          defaultValue={TESTNET_USDC}
          className="rounded-2xl border-2 border-ink bg-white px-4 py-2 text-base font-normal text-ink outline-none focus:border-orange"
        />
      </label>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-bold uppercase text-ink/70">Milestones</span>
        {rows.map((row, i) => (
          <div key={i} className="flex gap-3">
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
              className="w-32 rounded-2xl border-2 border-ink bg-white px-4 py-2 text-base font-normal text-ink outline-none focus:border-orange"
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
              className="flex-1 rounded-2xl border-2 border-ink bg-white px-4 py-2 text-base font-normal text-ink outline-none focus:border-orange"
            />
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
                className="rounded-2xl border-2 border-ink bg-white px-3 py-2 text-sm font-black uppercase text-ink hover:bg-bone"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => setRows((r) => [...r, { amount: "", description: "" }])}
          className="self-start rounded-full border-2 border-ink bg-white px-5 py-2 text-sm font-black uppercase text-ink transition hover:bg-bone"
        >
          + Add milestone
        </button>
      </div>

      <button
        type="submit"
        className="self-start rounded-full bg-lime px-6 py-3 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white"
      >
        Create proposal
      </button>
    </form>
  );
}
