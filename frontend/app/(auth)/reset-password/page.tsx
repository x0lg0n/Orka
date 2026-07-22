"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthPageHeader from "@/components/auth/AuthPageHeader";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
  }

  return (
    <section>
      <AuthPageHeader
        title="Set a new password"
        description="Choose a strong password with at least eight characters."
      />

      {done ? (
        <p className="auth-success-message mt-8 p-4" role="status">
          Password updated. You can now log in.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <label htmlFor="new-password" className="auth-field-label">New password</label>
          <input
            id="new-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="auth-input"
          />
          {error ? (
            <p className="auth-error-message px-3 py-2" role="alert">{error}</p>
          ) : null}
          <button
            type="submit"
            className="auth-primary-button"
          >
            Update password
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
