"use client";

import { useState, useTransition } from "react";
import { getAddress, requestAccess, isAllowed } from "@stellar/freighter-api";
import { portalConnectWallet } from "../actions";
import { CheckCircle, AlertCircle, Wallet } from "lucide-react";

export function PortalWalletConnect({
  token,
  initialAddress,
  mode,
}: {
  token: string;
  initialAddress: string | null;
  mode: "orka" | "freighter";
}) {
  const [address, setAddress] = useState(initialAddress);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setError(null);
    try {
      let allowed = false;
      try {
        allowed = (await isAllowed()).isAllowed;
      } catch {
        allowed = false;
      }
      if (!allowed) {
        try {
          await requestAccess();
        } catch {
          setError("Freighter extension not available or access denied.");
          return;
        }
      }
      const { address: addr } = await getAddress();
      if (!addr) {
        setError("No Stellar address found in Freighter.");
        return;
      }

      startTransition(async () => {
        const res = await portalConnectWallet({ token, address: addr });
        if (res.ok) {
          setAddress(addr);
        } else {
          setError(res.error);
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    }
  }

  if (mode === "orka") {
    if (address) {
      return (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
          <span>Orka-managed: <span className="font-mono">{address.slice(0, 4)}&hellip;{address.slice(-4)}</span></span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
        <span>Awaiting key provisioning&hellip;</span>
      </div>
    );
  }

  if (address) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
        <span>Connected: <span className="font-mono">{address.slice(0, 4)}&hellip;{address.slice(-4)}</span></span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={pending}
        onClick={connect}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <Wallet className="h-4 w-4" />
        {pending ? "Connecting&hellip;" : "Connect Wallet"}
      </button>
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
