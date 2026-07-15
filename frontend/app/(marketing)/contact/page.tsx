"use client";

import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="display text-4xl uppercase text-night">Contact</h1>
      <p className="mt-3 text-sm font-bold text-night/70">
        Tell us what you&apos;re building. We reply within one business day.
      </p>

      {sent ? (
        <p className="mt-8 rounded-[16px] bg-hover p-4 text-sm font-bold text-night">
          Thanks — we&apos;ll be in touch shortly.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            required
            placeholder="Your name"
            className="w-full rounded-[12px] border border-night/15 bg-white px-4 py-3 text-sm font-bold text-night outline-none focus:border-lime"
          />
          <input
            type="email"
            required
            placeholder="you@company.com"
            className="w-full rounded-[12px] border border-night/15 bg-white px-4 py-3 text-sm font-bold text-night outline-none focus:border-lime"
          />
          <textarea
            required
            rows={5}
            placeholder="How can we help?"
            className="w-full rounded-[12px] border border-night/15 bg-white px-4 py-3 text-sm font-bold text-night outline-none focus:border-lime"
          />
          <button
            type="submit"
            className="flex min-h-12 items-center justify-center rounded-full bg-lime px-7 text-sm font-black uppercase text-night transition hover:-translate-y-0.5 hover:bg-orange hover:text-white"
          >
            Send message
          </button>
        </form>
      )}
    </section>
  );
}
