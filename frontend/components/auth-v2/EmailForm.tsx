"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowRight } from "lucide-react";

interface EmailFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading: boolean;
  variant: "sign-in" | "sign-up";
}

export function EmailForm({ onSubmit, loading, variant }: EmailFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    await onSubmit(email);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="auth-v2-email" className="text-[13px] font-bold text-white/70">
          Email address
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            id="auth-v2-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-[14px] text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#9474ff]/50 focus:ring-2 focus:ring-[#9474ff]/20"
          />
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={loading || !email || !email.includes("@")}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#9474ff] text-[14px] font-bold text-white shadow-[0_4px_24px_rgba(148,116,255,0.3)] transition-all hover:bg-[#8363ff] disabled:cursor-wait disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            {variant === "sign-up" ? "Create Account" : "Continue"}
            <ArrowRight size={16} />
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
