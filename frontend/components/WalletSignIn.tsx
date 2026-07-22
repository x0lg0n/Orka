"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { connectAndSignLogin } from "@/lib/stellar";

type WalletSignInProps = {
  intent?: "signin" | "signup";
};

export default function WalletSignIn({ intent = "signin" }: WalletSignInProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onConnect() {
    setError("");
    setLoading(true);
    try {
      const { address, challenge, signature } = await connectAndSignLogin();
      const supabase = createClient();
      const { data, error: functionError } = await supabase.functions.invoke("wallet-login", {
        body: { address, challenge, signature, intent },
      });

      if (functionError || !data?.token_hash || !data?.verification_type) {
        let code = data?.error as string | undefined;
        if (!code && functionError && "context" in functionError) {
          const response = functionError.context;
          if (response instanceof Response) {
            const body = await response.clone().json().catch(() => ({}));
            code = body?.error;
          }
        }
        setError(
          code === "challenge_expired" ?
            "Challenge expired. Try again."
          : code === "bad_signature" ?
            "Signature rejected. Try again."
          : code === "wallet_not_registered" ?
            "This wallet does not have an ORKA account yet. Create one first."
          : code === "session_failed" ?
            "Your wallet was verified, but ORKA could not start a session. Check the wallet-login function logs."
          : "Wallet sign-in is unavailable right now. Check the wallet-login function logs in Supabase.",
        );
        return;
      }

      const { error: verifyErr } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: data.verification_type,
      });
      if (verifyErr) {
        setError("Could not start your session. Try again.");
        return;
      }
      router.push("/workspaces");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("not available") || msg.includes("not installed")) {
        setError("Install the Freighter extension to continue.");
      } else if (msg.includes("reject") || msg.includes("denied")) {
        setError("Connection request was denied. Approve it in Freighter and retry.");
      } else {
        setError("Could not reach wallet sign-in. Make sure the wallet-login Edge Function is deployed, then try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onConnect}
        disabled={loading}
        className="auth-primary-button"
      >
        {loading ?
          <Loader2 size={18} className="animate-spin" />
        : <Wallet size={18} />}
        {loading ? "Signing…" : intent === "signup" ? "Create account with Wallet" : "Continue with Wallet"}
      </button>

      {error ?
        <p className="auth-error-message px-3 py-2 text-center" role="alert">
          {error}
        </p>
      : <p className="text-center text-sm text-muted-foreground">
        {intent === "signup" ?
          "Your Stellar wallet will be your ORKA account — no email or password needed."
        : "Sign with the Stellar wallet connected to your ORKA account."}
        </p>}

      <p className="text-center text-sm text-muted-foreground">
        {intent === "signup" ?
          <>Already have an account? <Link href="/login" className="auth-inline-link">Sign in</Link></>
        : <>Prefer email? <Link href="/signup" className="auth-inline-link">Create an account</Link></>}
      </p>
    </div>
  );
}
