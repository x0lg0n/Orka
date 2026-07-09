"use client";

import { FormEvent, useState } from "react";

type WaitlistResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

function getFriendlyError(status: number, error?: string) {
  if (status === 400) {
    return error || "Please check your email and try again.";
  }

  if (status === 503) {
    return "Waitlist is taking a short break. Please try again in a minute.";
  }

  return "We could not save your spot just now. Please try again shortly.";
}

export default function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const errorId = compact ? "hero-waitlist-error" : "footer-waitlist-error";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please add a valid email address.");
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

      const data = (await res.json().catch(() => ({}))) as WaitlistResponse;

      if (!res.ok) {
        setError(getFriendlyError(res.status, data.error));
        return;
      }

      setSubmitted(true);
      formElement.reset();
    } catch {
      setError("We could not connect just now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[14px] border-2 border-ink bg-lime p-5 text-ink shadow-hard">
        <p className="display text-2xl uppercase">You&apos;re on the list!</p>
        <p className="mt-2 text-sm font-bold">
          We&apos;ll reach out when design partner slots open.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className={compact ? "flex flex-col gap-3 sm:flex-row" : "flex flex-col gap-3 md:flex-row md:items-end"}>
        <div className="flex-1">
          <input
            name="name"
            placeholder="Your name"
            className="min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20"
          />
        </div>
        <div className="flex-[1.5]">
          <input
            name="email"
            type="email"
            placeholder="Email address"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            className="min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Joining..." : (
            <>
              Join waitlist
              <span className="grid size-6 place-items-center rounded-full bg-ink text-white transition group-hover:bg-white group-hover:text-ink">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
              </span>
            </>
          )}
        </button>
      </form>
      {error ? (
        <div
          id={errorId}
          role="status"
          className="mt-3 flex items-start gap-3 rounded-[14px] border-2 border-ink/15 bg-bone px-4 py-3 text-sm font-bold leading-5 text-ink shadow-[4px_4px_0_rgba(6,26,43,0.15)]"
        >
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-orange text-xs font-black text-white">
            !
          </span>
          <p>{error}</p>
        </div>
      ) : null}
    </div>
  );
}
