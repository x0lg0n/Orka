"use client";

import { useState } from "react";
import { connectFreighter } from "@/lib/stellar";
import { saveStellarAddress } from "@/app/actions";

export default function ConnectFreighter({
  currentAddress,
}: {
  currentAddress: string | null;
}) {
  const [address, setAddress] = useState<string | null>(currentAddress);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleConnect() {
    setError(null);
    setPending(true);
    try {
      const pk = await connectFreighter();
      setAddress(pk);
      const fd = new FormData();
      fd.set("address", pk);
      await saveStellarAddress(fd);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect Freighter");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.065] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-6">
      <span className="text-sm font-black uppercase tracking-[0.1em] text-slate-400">
        Freighter wallet
      </span>
      <div className="mt-3 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleConnect}
          disabled={pending}
          className="w-fit rounded-[16px] border border-cyan-200/30 bg-cyan-300 px-6 py-3 text-sm font-black uppercase text-[#04101f] transition hover:-translate-y-0.5 hover:bg-lime disabled:opacity-40"
        >
          {pending ? "Connecting..." : "Connect Freighter"}
        </button>

        {address && (
          <p className="break-all text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
            Connected: <span className="text-white">{address}</span>
          </p>
        )}

        {error && (
          <p className="rounded-[18px] border border-orange/25 bg-orange/10 px-4 py-3 text-sm font-bold text-orange">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
