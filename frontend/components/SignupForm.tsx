"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import WalletSignIn from "@/components/WalletSignIn";
import { createClient } from "../lib/supabase/client";

type Mode = "orka" | "freighter";

function getFriendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "This email is already registered. Try logging in instead.";
  }
  if (m.includes("password") && m.includes("8")) {
    return "Password should be at least 8 characters.";
  }
  if (m.includes("invalid email") || m.includes("email address")) {
    return "Please enter a valid email address.";
  }
  if (m.includes("database error saving new user")) {
    return "Account setup is blocked by the Supabase profile trigger. Apply frontend/supabase/auth_signup_fix.sql, then try again.";
  }
  return "We could not create your account just now. Please try again.";
}

const inputClass =
  "auth-input";

export default function SignupForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("orka");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const errorId = "signup-error";

  async function onGoogle() {
    setError("");
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/workspaces`,
        },
      });
      if (googleError) setError(getFriendlyError(googleError.message));
    } catch {
      setError("We could not connect just now. Check your connection and try again.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailVal = email.trim();
    if (password.length < 8) {
      setError("Password should be at least 8 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      // Existing ORKA profile triggers may require these fields even though the
      // streamlined signup no longer asks the user to complete them up front.
      const profileName = emailVal.split("@")[0].replace(/[._-]+/g, " ").trim();
      const meta: Record<string, string> = {
        full_name: profileName || emailVal,
        role: "freelancer",
        custody_mode: mode,
      };
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailVal,
        password,
        options: {
          data: meta,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/workspaces`,
        },
      });

      if (signUpError) {
        setError(getFriendlyError(signUpError.message));
        return;
      }
      if (data.session) {
        router.push("/workspaces");
        return;
      }
      setSuccess(true);
    } catch {
      setError("We could not connect just now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="auth-success-message p-5" role="status">
        <p className="text-base font-bold">Check your inbox</p>
        <p className="mt-2 text-sm text-current/85">
          We sent a confirmation link to {email.trim() || "your email"}. Open it to finish
          creating your ORKA account.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex gap-1 rounded-lg border bg-muted p-1" role="group" aria-label="Account type">
        <button
          type="button"
          onClick={() => setMode("orka")}
          aria-pressed={mode === "orka"}
          className={`flex-1 rounded-md px-4 py-2 text-xs font-bold transition ${
            mode === "orka" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}>
          Orka-managed
        </button>
        <button
          type="button"
          onClick={() => setMode("freighter")}
          aria-pressed={mode === "freighter"}
          className={`flex-1 rounded-md px-4 py-2 text-xs font-bold transition ${
            mode === "freighter" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}>
          Wallet
        </button>
      </div>

      {error ?
        <div
          id={errorId}
          role="status"
          className="auth-error-message mb-5 flex items-start gap-3 px-4 py-3">
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-coral text-[10px] font-black text-white">
            !
          </span>
          <p>{error}</p>
        </div>
      : null}

      {mode === "freighter" ?
        <WalletSignIn intent="signup" />
      :
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="su-email" className="auth-field-label">
              Email
            </label>
            <input
              id="su-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="su-password" className="auth-field-label">
              Password
            </label>
            <div className="relative">
              <input
                id="su-password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-primary-button">
            {loading ? "Creating…" : "Create account"}
          </button>

          {mode === "orka" ?
            <>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs font-bold uppercase">or</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <button
                type="button"
                onClick={onGoogle}
                disabled={googleLoading}
                className="auth-secondary-button">
                <Image src="/Icons/google-circle-solid.svg" alt="" width={18} height={18} />
                Continue with Google
              </button>
            </>
          : null}
        </form>}

      {mode === "orka" ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="auth-inline-link">
            Sign in
          </Link>
        </p>
      ) : null}
    </div>
  );
}
