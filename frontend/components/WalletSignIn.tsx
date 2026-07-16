"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { connectAndSignLogin } from "@/lib/stellar";

const FN_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/wallet-login`;

export default function WalletSignIn() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onConnect() {
    setError("");
    setLoading(true);
    try {
      const { address, challenge, signature } = await connectAndSignLogin();

      const res = await fetch(FN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, challenge, signature }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.session) {
        setError(
          data?.error === "challenge_expired" ?
            "Challenge expired. Try again."
          : data?.error === "bad_signature" ?
            "Signature rejected. Try again."
          : "Wallet sign-in failed. Try again.",
        );
        return;
      }

      const supabase = createClient();
      const { error: setErr } = await supabase.auth.setSession(data.session);
      if (setErr) {
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
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <button
        type="button"
        onClick={onConnect}
        disabled={loading}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-night bg-lime px-7 text-sm font-black uppercase text-night transition hover:-translate-y-0.5 hover:bg-orange hover:text-white disabled:cursor-wait disabled:opacity-70">
        {loading ?
          <Loader2 size={18} className="animate-spin" />
        : <Wallet size={18} />}
        {loading ? "Signing…" : "Continue with Wallet"}
      </button>

      {error ?
        <p className="text-center text-sm font-bold text-coral" role="status">
          {error}
        </p>
      : <p className="text-center text-sm font-bold text-foreground/70">
          Sign with your Stellar wallet — no email, no password.
        </p>}

      <p className="mt-2 text-center text-sm font-bold text-muted-foreground">
        Prefer email?{" "}
        <Link href="/signup" className="text-lime underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
