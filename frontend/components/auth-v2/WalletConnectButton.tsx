"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Loader2, Check, Copy, AlertCircle } from "lucide-react";
import { useWalletAuth } from "@/hooks/useWalletAuth";

interface WalletConnectButtonProps {
  onConnect: (address: string) => void;
}

export function WalletConnectButton({ onConnect }: WalletConnectButtonProps) {
  const { address, shortenedAddress, loading, error, connect, isConnected } = useWalletAuth();
  const [copied, setCopied] = useState(false);

  // Notify parent when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      onConnect(address);
    }
  }, [isConnected, address, onConnect]);

  const handleConnect = useCallback(async () => {
    await connect();
  }, [connect]);

  const handleCopy = useCallback(async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [address]);

  return (
    <div className="flex flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.button
            key="connect"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-xl bg-[#9474ff] px-6 text-[14px] font-bold text-white shadow-[0_4px_24px_rgba(148,116,255,0.3)] transition-all hover:bg-[#8363ff] hover:shadow-[0_6px_32px_rgba(148,116,255,0.4)] disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Wallet size={18} />
            )}
            {loading ? "Connecting…" : "Connect Freighter Wallet"}
          </motion.button>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex w-full items-center justify-between rounded-xl border border-[#22bd93]/30 bg-[#22bd93]/10 px-4 py-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#22bd93]/20">
                <Check size={16} className="text-[#22bd93]" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-[#22bd93]">Connected</p>
                <p className="font-mono text-[13px] font-bold text-white">{shortenedAddress}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              {copied ? <Check size={14} className="text-[#22bd93]" /> : <Copy size={14} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg bg-[#ff4f42]/10 px-3 py-2 text-[12px] text-[#ff4f42]"
        >
          <AlertCircle size={14} />
          {error}
        </motion.div>
      )}
    </div>
  );
}
