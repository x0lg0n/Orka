"use client";

import { useState } from "react";
import { ArrowRight, User, Mail, Loader2 } from "lucide-react";

export default function LeadCaptureCard() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!name.trim()) return "Name is required";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
      setName("");
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-violet/20 bg-violet/5 p-6 text-center">
        <p className="text-base font-bold text-violet">Thanks! We&apos;ll be in touch.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-night/10 bg-white p-6">
      <h3 className="text-lead font-black text-night">
        Run your agency smarter with ORKA
      </h3>
      <p className="mt-2 text-base font-bold leading-5 text-night/50">
        Proposals, contracts, milestones, escrow and payments — all in one place.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3" noValidate>
        <div className="relative">
          <User
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-night/30"
            aria-hidden="true"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            placeholder="Full name"
            required
            disabled={loading}
            aria-label="Full name"
            className="w-full rounded-xl border border-night/10 bg-night/[0.02] py-2.5 pl-9 pr-3 text-base font-bold text-night placeholder:text-night/30 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
          />
        </div>
        <div className="relative">
          <Mail
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-night/30"
            aria-hidden="true"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            placeholder="Work email"
            required
            disabled={loading}
            aria-label="Work email"
            aria-invalid={!!error}
            className={`w-full rounded-xl border bg-night/[0.02] py-2.5 pl-9 pr-3 text-base font-bold text-night placeholder:text-night/30 focus:outline-none focus:ring-2 focus:ring-violet/20 ${
              error ? "border-coral/50 focus:border-coral" : "border-night/10 focus:border-violet"
            }`}
          />
        </div>
        {error && (
          <p className="text-xs font-bold text-coral">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet py-2.5 text-base font-black text-white transition-colors hover:bg-violet/90 disabled:opacity-60"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Sending..." : "Explore Platform"}
          {!loading && <ArrowRight size={14} />}
        </button>
      </form>
      <p className="mt-2 text-center text-2xs font-bold text-night/30">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
