"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";

export default function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateEmail(value: string) {
    if (!value.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateEmail(email);
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
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to subscribe");
      setSubmitted(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-night/10 bg-white p-5">
      <h3 className="text-md font-black text-night">
        Weekly Agency Growth Tips
      </h3>
      <p className="mt-1 text-sm font-bold leading-5 text-night/50">
        Join 2,000+ founders getting one actionable tip every week.
      </p>
      {submitted ? (
        <div className="mt-4 rounded-xl bg-teal/10 px-4 py-3 text-center text-base font-bold text-teal">
          Thanks for subscribing!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2" noValidate>
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
              placeholder="Enter your email"
              required
              disabled={loading}
              aria-label="Email for newsletter"
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
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      )}
      <p className="mt-2 text-center text-2xs font-bold text-night/30">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
