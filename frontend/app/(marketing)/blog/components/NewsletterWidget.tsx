"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

export default function NewsletterWidget() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  }

  return (
    <div className="rounded-2xl border border-night/10 bg-white p-5">
      <h3 className="text-[15px] font-black text-night">
        Weekly Agency Growth Tips
      </h3>
      <p className="mt-1 text-[12px] font-bold leading-5 text-night/50">
        Join 2,000+ founders getting one actionable tip every week.
      </p>
      {submitted ? (
        <div className="mt-4 rounded-xl bg-teal/10 px-4 py-3 text-center text-[13px] font-bold text-teal">
          Thanks for subscribing!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
          <div className="relative">
            <Mail
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-night/30"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-night/10 bg-night/[0.02] py-2.5 pl-9 pr-3 text-[13px] font-bold text-night placeholder:text-night/30 focus:border-violet focus:outline-none focus:ring-2 focus:ring-violet/20"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-violet py-2.5 text-[13px] font-black text-white transition-colors hover:bg-violet/90"
          >
            Subscribe
          </button>
        </form>
      )}
      <p className="mt-2 text-center text-[10px] font-bold text-night/30">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
