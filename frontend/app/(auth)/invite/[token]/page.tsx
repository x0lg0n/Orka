"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const btn =
  "mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-night bg-lime px-7 text-sm font-black uppercase text-night transition hover:-translate-y-0.5 hover:bg-orange hover:text-white";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { invite_token: token },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    else setDone(true);
  }

  return (
    <div>
      <h1 className="display text-3xl uppercase">Accept invite</h1>
      <p className="mt-2 text-sm font-bold text-night/70">
        You&apos;ve been invited to a workspace. Create your account to join.
      </p>

      {done ? (
        <p className="mt-6 rounded-[12px] bg-hover p-3 text-sm font-bold text-night">
          Account created. Check your email to finish verifying.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-[12px] border border-night/15 bg-white px-4 py-3 text-sm font-bold text-night outline-none focus:border-lime"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-[12px] border border-night/15 bg-white px-4 py-3 text-sm font-bold text-night outline-none focus:border-lime"
          />
          {error ? <p className="text-sm font-bold text-coral">{error}</p> : null}
          <button type="submit" className={btn}>
            Create account
          </button>
        </form>
      )}

      <Link
        href="/login"
        className="mt-6 block text-xs font-bold text-night/60 underline-offset-4 hover:underline"
      >
        Back to login
      </Link>
    </div>
  );
}
