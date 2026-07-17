"use client";

import { useState, useCallback } from "react";
import { connectFreighter, shortenAddress } from "@/lib/auth-v2/freighter";

interface UseWalletAuthReturn {
  address: string | null;
  shortenedAddress: string | null;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  isConnected: boolean;
}

export function useWalletAuth(): UseWalletAuthReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const addr = await connectFreighter();
      setAddress(addr);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("not available") || msg.includes("not installed")) {
        setError("Install the Freighter extension to continue.");
      } else if (msg.includes("reject") || msg.includes("denied")) {
        setError("Connection request was denied. Approve it in Freighter and retry.");
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    address,
    shortenedAddress: address ? shortenAddress(address) : null,
    loading,
    error,
    connect,
    isConnected: !!address,
  };
}
