"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/signup");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={loading}
      className="rounded-full border border-border px-4 py-2 text-sm font-black uppercase text-foreground transition hover:bg-muted disabled:cursor-wait disabled:opacity-70">
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
