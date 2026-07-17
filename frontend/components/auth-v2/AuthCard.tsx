"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { WalletConnectButton } from "./WalletConnectButton";
import { EmailForm } from "./EmailForm";

interface AuthCardProps {
  variant: "sign-in" | "sign-up";
}

export function AuthCard({ variant }: AuthCardProps) {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleWalletConnect = useCallback((address: string) => {
    setWalletAddress(address);
  }, []);

  const handleEmailSubmit = useCallback(
    async (email: string) => {
      if (!walletAddress) return;
      setLoading(true);

      try {
        const endpoint = variant === "sign-up" ? "/api/auth-v2/register" : "/api/auth-v2/login";
        const body =
          variant === "sign-up"
            ? { wallet_address: walletAddress, email }
            : { wallet_address: walletAddress };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Something went wrong. Try again.");
          return;
        }

        toast.success(variant === "sign-up" ? "Account created!" : "Welcome back!");
        router.push("/workspaces");
      } catch {
        toast.error("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, variant, router]
  );

  const handleSocialClick = useCallback((provider: string) => {
    toast.info(`${provider} coming soon`);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="mx-auto flex w-full max-w-[400px] flex-col px-6 py-8 lg:px-8"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-white">
          {variant === "sign-in" ? "Welcome back 👋" : "Create your account"}
        </h1>
        <p className="mt-1 text-[14px] text-white/50">
          {variant === "sign-in"
            ? "Sign in to your Orka account"
            : "Join Orka and grow your business"}
        </p>
      </div>

      {/* Social Buttons */}
      <div className="mb-4">
        <p className="mb-3 text-[12px] font-semibold text-white/40">Continue with</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleSocialClick("Google")}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-[12px] font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialClick("X (Twitter)")}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 text-[12px] font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </button>
          <button
            type="button"
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#9474ff]/30 bg-[#9474ff]/10 text-[12px] font-bold text-[#9474ff] transition-all hover:bg-[#9474ff]/20"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
            </svg>
            Freighter
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-[12px]">
          <span className="bg-[#0a1c2e] px-3 text-white/30">or</span>
        </div>
      </div>

      {/* Wallet Connect */}
      <div className="mb-4">
        <WalletConnectButton onConnect={handleWalletConnect} />
      </div>

      {/* Email Form */}
      <AnimatePresence>
        {walletAddress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmailForm onSubmit={handleEmailSubmit} loading={loading} variant={variant} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Switch link */}
      <p className="mt-6 text-center text-[13px] text-white/40">
        {variant === "sign-in" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/auth-v2/sign-up" className="font-bold text-[#9474ff] hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth-v2/sign-in" className="font-bold text-[#9474ff] hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>

      {/* Security footer */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-white/25">
        <Shield size={12} />
        Your data is protected with enterprise-grade security
      </div>
    </motion.div>
  );
}
