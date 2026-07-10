"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Eye, EyeOff, Wallet, CheckCircle2 } from "lucide-react";
import { createClient } from "../lib/supabase/client";
import { getAddress, requestAccess, isAllowed } from "@stellar/freighter-api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = [
  { value: "agency", label: "Agency" },
  { value: "freelancer", label: "Freelancer" },
  { value: "client", label: "Client" },
] as const;

type Mode = "orka" | "freighter";

function maskKey(key: string) {
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

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
  return "We could not create your account just now. Please try again.";
}

const inputClass =
  "min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20";

export default function SignupForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("orka");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stellarAddress, setStellarAddress] = useState("");
  const [freighterError, setFreighterError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const errorId = "signup-error";

  async function connectFreighter() {
    setFreighterError("");
    if (typeof window === "undefined" || !(window as unknown as { freighter?: unknown }).freighter) {
      setFreighterError("Install Freighter to continue.");
      return;
    }
    try {
      const allowed = await isAllowed();
      if (!allowed) await requestAccess();
      const { address } = await getAddress();
      setStellarAddress(address);
    } catch {
      setFreighterError("Could not connect to Freighter. Please try again.");
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
          redirectTo: `${window.location.origin}/dashboard`,
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
    if (mode === "freighter" && !stellarAddress) {
      setError("Connect Freighter first.");
      return;
    }
    const fullName = name.trim();
    const emailVal = email.trim();
    if (!EMAIL_RE.test(emailVal)) {
      setError("Please add a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password should be at least 8 characters.");
      return;
    }
    if (!role) {
      setError("Please choose your role.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const meta: Record<string, string> = {
        full_name: fullName,
        role,
        custody_mode: mode,
      };
      if (mode === "freighter" && stellarAddress) {
        meta.stellar_address = stellarAddress;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: emailVal,
        password,
        options: {
          data: meta,
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        setError(getFriendlyError(signUpError.message));
        return;
      }
      if (data.session) {
        router.push("/dashboard");
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
      <div className="rounded-[14px] border-2 border-ink bg-lime p-5 text-ink shadow-hard">
        <p className="display text-2xl uppercase">Check your inbox!</p>
        <p className="mt-2 text-sm font-bold">
          We sent a confirmation link to {email.trim() || "your email"}. Open it to finish
          creating your ORKA account.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Mode toggle */}
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-full border-2 border-ink bg-white p-1">
        <button
          type="button"
          onClick={() => setMode("orka")}
          aria-pressed={mode === "orka"}
          className={`rounded-full px-4 py-2 text-sm font-black uppercase transition ${
            mode === "orka" ? "bg-ink text-white" : "text-ink hover:bg-bone"
          }`}>
          Orka-managed
        </button>
        <button
          type="button"
          onClick={() => setMode("freighter")}
          aria-pressed={mode === "freighter"}
          className={`rounded-full px-4 py-2 text-sm font-black uppercase transition ${
            mode === "freighter" ? "bg-ink text-white" : "text-ink hover:bg-bone"
          }`}>
          Freighter
        </button>
      </div>

      {error ?
        <div
          id={errorId}
          role="status"
          className="mb-4 flex items-start gap-3 rounded-[14px] border-2 border-ink/15 bg-bone px-4 py-3 text-sm font-bold leading-5 text-ink shadow-[4px_4px_0_rgba(6,26,43,0.15)]">
          <span className="grid size-6 shrink-0 place-items-center rounded-full bg-orange text-xs font-black text-white">
            !
          </span>
          <p>{error}</p>
        </div>
      : null}

      {/* Mode B panel */}
      {mode === "freighter" && !stellarAddress ?
        <div className="flex flex-col items-center gap-4 py-6">
          <button
            type="button"
            onClick={connectFreighter}
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">
            <Wallet size={18} /> Connect Freighter
          </button>
          {freighterError ?
            <p className="text-sm font-bold text-coral">{freighterError}</p>
          : <p className="text-sm font-bold text-ink/70">
              Self-custody via the Freighter browser extension.
            </p>}
        </div>
      :
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="su-name" className="mb-1 block text-sm font-bold text-ink">
              Full name
            </label>
            <input
              id="su-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className={inputClass}
              required
            />
          </div>

          {mode === "freighter" && stellarAddress ?
            <div className="flex items-center gap-2 rounded-[10px] border-2 border-teal bg-white px-4 py-3 text-sm font-bold text-ink">
              <CheckCircle2 size={18} className="text-teal" />
              Connected: {maskKey(stellarAddress)}
            </div>
          : null}

          <div>
            <label htmlFor="su-email" className="mb-1 block text-sm font-bold text-ink">
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
            <label htmlFor="su-password" className="mb-1 block text-sm font-bold text-ink">
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="su-role" className="mb-1 block text-sm font-bold text-ink">
              I am a…
            </label>
            <select
              id="su-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
              required>
              <option value="" disabled>
                Select your role
              </option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white disabled:cursor-wait disabled:opacity-70">
            {loading ? "Creating…" : "Create account"}
          </button>

          {mode === "orka" ?
            <>
              <div className="my-3 flex items-center gap-3 text-ink/50">
                <span className="h-px flex-1 bg-ink/15" />
                <span className="text-xs font-bold uppercase">or</span>
                <span className="h-px flex-1 bg-ink/15" />
              </div>
              <button
                type="button"
                onClick={onGoogle}
                disabled={googleLoading}
                className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-ink bg-white px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-bone disabled:cursor-wait disabled:opacity-70">
                <Mail size={18} /> Continue with Google
              </button>
            </>
          : null}
        </form>}

      <p className="mt-6 text-center text-sm font-bold text-ink/70">
        Already have an account?{" "}
        <Link href="/login" className="text-violet underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
