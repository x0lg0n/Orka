"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthPageHeader from "@/components/auth/AuthPageHeader";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <section>
      <AuthPageHeader
        title="Reset your password"
        description="Enter the email linked to your account and we’ll send a secure reset link."
      />

      {sent ? (
        <p className="auth-success-message mt-8 p-4" role="status">
          If that account exists, a reset link is on its way.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label htmlFor="reset-email" className="auth-field-label">Email address</label>
          <input
            id="reset-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="auth-input"
          />
          {error ? (
            <p className="auth-error-message px-3 py-2" role="alert">{error}</p>
          ) : null}
          <button
            type="submit"
            className="auth-primary-button"
          >
            Send reset link
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
