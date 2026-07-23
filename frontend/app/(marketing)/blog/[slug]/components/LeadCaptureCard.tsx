"use client";

import { useState } from "react";
import { ArrowRight, User, Mail } from "lucide-react";

export default function LeadCaptureCard() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-violet/20 bg-violet/5 p-6 text-center">
        <p className="text-[14px] font-bold text-violet">Thanks! We&apos;ll be in touch.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-night/10 bg-white p-6">
      <h3 className="text-[18px] font-black text-night">
        Run your agency smarter with ORKA
      </h3>
      <p className="mt-2 text-[13px] font-bold leading-5 text-night/50">
        Proposals, contracts, milestones, escrow and payments — all in one place.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="relative">
          <User
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-night/30"
          />
          <input
            type="text"
            placeholder="Full name"
            required
            className="w-full rounded-xl border border-night/10 bg-night/[0.02] py-2.5 pl-9 pr-3 text-[13px] font-bold text-night placeholder:text-night/30 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
          />
        </div>
        <div className="relative">
          <Mail
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-night/30"
          />
          <input
            type="email"
            placeholder="Work email"
            required
            className="w-full rounded-xl border border-night/10 bg-night/[0.02] py-2.5 pl-9 pr-3 text-[13px] font-bold text-night placeholder:text-night/30 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
          />
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet py-2.5 text-[13px] font-black text-white transition-colors hover:bg-violet/90"
        >
          Explore Platform <ArrowRight size={14} />
        </button>
      </form>
      <p className="mt-2 text-center text-[10px] font-bold text-night/30">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
