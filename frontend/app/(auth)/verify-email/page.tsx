"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthPageHeader from "@/components/auth/AuthPageHeader";

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
    <section>
      <AuthPageHeader
        title="Verify your email"
        description="Enter the six-digit code from your confirmation email."
      />

      {done ? (
        <p className="auth-success-message mt-8 p-4" role="status">
          Email verified. You&apos;re all set.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="verify-email" className="auth-field-label">Email address</label>
          <input
            id="verify-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="auth-input"
          />
          </div>
          <div>
            <label htmlFor="verify-code" className="auth-field-label">Verification code</label>
          <input
            id="verify-code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="auth-input text-center font-mono tracking-[0.35em]"
          />
          </div>
          {error ? <p className="auth-error-message px-3 py-2" role="alert">{error}</p> : null}
          <button
            type="submit"
            className="auth-primary-button"
          >
            Verify
          </button>
          <button
            type="button"
            onClick={onResend}
            className="auth-text-link block w-full text-center text-sm"
          >
            Resend code
          </button>
        </form>
      )}

      <Link
        href="/login"
        className="auth-text-link mt-6 block text-center text-sm"
      >
        Back to login
      </Link>
    </section>
  );
}
