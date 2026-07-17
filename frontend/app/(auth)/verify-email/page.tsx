"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const btn =
  "mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-night bg-lime px-7 text-sm font-black uppercase text-night transition hover:-translate-y-0.5 hover:bg-orange hover:text-white";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    if (error) setError(error.message);
    else setDone(true);
  }

  async function onResend() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) setError(error.message);
  }

  return (
    <div>
      <h1 className="display text-3xl uppercase">Verify email</h1>
      <p className="mt-2 text-sm font-bold text-muted-foreground">
        Enter the code we sent to confirm your address.
      </p>

      {done ? (
        <p className="mt-6 rounded-[12px] bg-muted p-3 text-sm font-bold text-foreground">
          Email verified. You&apos;re all set.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-[12px] border border-border bg-background px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-lime"
          />
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="w-full rounded-[12px] border border-border bg-background px-4 py-3 text-sm font-bold tracking-[0.3em] text-foreground outline-none focus:border-lime"
          />
          {error ? <p className="text-sm font-bold text-coral">{error}</p> : null}
          <button type="submit" className={btn}>
            Verify
          </button>
          <button
            type="button"
            onClick={onResend}
            className="block w-full text-center text-xs font-bold text-muted-foreground underline-offset-4 hover:underline"
          >
            Resend code
          </button>
        </form>
      )}

      <Link
        href="/login"
        className="mt-6 block text-xs font-bold text-muted-foreground underline-offset-4 hover:underline"
      >
        Back to login
      </Link>
    </div>
  );
}
