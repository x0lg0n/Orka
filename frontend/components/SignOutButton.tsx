"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
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
      className="flex w-full items-center justify-center gap-2.5"
    >
      <LogOut className="size-4 text-white/50" aria-hidden />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
