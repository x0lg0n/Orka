"use client";

import { useState } from "react";
import { connectFreighter } from "../../../../lib/stellar";
import { saveStellarAddress } from "../../../../app/actions";

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
    <div className="rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
      <span className="text-sm font-black uppercase text-ink/70">
        Freighter wallet
      </span>
      <div className="mt-3 flex flex-col gap-3">
        <button
          type="button"
          onClick={handleConnect}
          disabled={pending}
          className="w-fit rounded-full bg-orange px-6 py-2 text-sm font-black uppercase text-ink shadow-hard transition hover:-translate-y-0.5 disabled:opacity-40"
        >
          {pending ? "Connecting…" : "Connect Freighter"}
        </button>

        {address && (
          <p className="text-xs font-bold uppercase text-ink/70">
            Connected: <span className="text-ink">{address}</span>
          </p>
        )}

        {error && (
          <p className="rounded-2xl bg-orange/20 px-4 py-2 text-sm font-bold text-ink">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
