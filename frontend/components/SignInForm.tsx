"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import WalletSignIn from "@/components/WalletSignIn";
import { createClient } from "@/lib/supabase/client";

type SignInMode = "email" | "wallet";

function getFriendlyError(message: string) {
  const value = message.toLowerCase();
  if (value.includes("invalid login credentials")) {
    return "That email or password does not match our records.";
  }
  if (value.includes("email not confirmed")) {
    return "Confirm your email before signing in.";
  }
  return "We could not sign you in just now. Please try again.";
}

export default function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<SignInMode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(getFriendlyError(signInError.message));
        return;
      }

      router.push("/workspaces");
      router.refresh();
    } catch {
      setError("We could not connect just now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-lg border bg-muted p-1" role="group" aria-label="Sign-in method">
        <button
          type="button"
          onClick={() => {
            setError("");
            setMode("email");
          }}
          aria-pressed={mode === "email"}
          className={`flex-1 rounded-md px-4 py-2 text-xs font-bold transition ${
            mode === "email" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Orka-managed
        </button>
        <button
          type="button"
          onClick={() => {
            setError("");
            setMode("wallet");
          }}
          aria-pressed={mode === "wallet"}
          className={`flex-1 rounded-md px-4 py-2 text-xs font-bold transition ${
            mode === "wallet" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Wallet
        </button>
      </div>

      {mode === "wallet" ? (
        <WalletSignIn intent="signin" />
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="signin-email" className="auth-field-label">Email address</label>
            <input
              id="signin-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="auth-input"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-4">
              <label htmlFor="signin-password" className="auth-field-label mb-0">Password</label>
              <Link href="/forgot-password" className="auth-text-link text-xs">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="auth-input pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/30"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error ? <p className="auth-error-message px-3 py-2" role="alert">{error}</p> : null}

          <button type="submit" disabled={loading} className="auth-primary-button">
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            disabled={googleLoading}
            className="auth-secondary-button"
          >
            <Image
              src="/Icons/google-circle-solid.svg"
              alt=""
              width={18}
              height={18}
              className={googleLoading ? "animate-pulse" : undefined}
            />
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </button>
        </form>
      )}

      {mode === "email" ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to ORKA? <Link href="/signup" className="auth-inline-link">Create an account</Link>
        </p>
      ) : null}
    </div>
  );
}
