"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthPageHeader from "@/components/auth/AuthPageHeader";

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
    <section>
      <AuthPageHeader
        title="You’re invited"
        description="Create an account to join this ORKA workspace."
      />

      {done ? (
        <p className="auth-success-message mt-8 p-4" role="status">
          Account created. Check your email to finish verifying.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="invite-email" className="auth-field-label">Email address</label>
          <input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="auth-input"
          />
          </div>
          <div>
            <label htmlFor="invite-password" className="auth-field-label">Create password</label>
          <input
            id="invite-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="auth-input"
          />
          </div>
          {error ? <p className="auth-error-message px-3 py-2" role="alert">{error}</p> : null}
          <button
            type="submit"
            className="auth-primary-button"
          >
            Create account
          </button>
        </form>
      )}

      <Link
        href="/signin"
        className="auth-text-link mt-6 block text-center text-sm"
      >
        Back to signin
      </Link>
    </section>
  );
}
