"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wallet } from "lucide-react";

type WalletRow = {
  id: string;
  address: string;
  wallet_type: string;
  network: string;
  is_primary: boolean;
  alias?: string | null;
};

export default function PersonalSettingsClient({
  profile,
  wallets,
}: {
  profile: { id: string; full_name: string | null; avatar_url: string | null;
    stellar_address: string | null };
  wallets: WalletRow[];
}) {
  const [name, setName] = useState(profile.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function onSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    const supabase = createClient();
    const { error: e } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() })
      .eq("id", profile.id);
    setSaving(false);
    if (e) setError("Could not save. Try again.");
    else setSaved(true);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="display text-3xl uppercase">Personal Settings</h1>
        <p className="mt-1 text-sm font-bold text-muted-foreground">
          Your identity across ORKA. Wallet-first accounts start here — add the
          details you want later.
        </p>
      </header>

      {/* Profile */}
      <section className="rounded-[18px] border bg-card p-6 text-card-foreground">
        <h2 className="text-lg font-extrabold">Profile</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="ps-name" className="mb-1 block text-sm font-bold">
              Full name
            </label>
            <input
              id="ps-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="min-h-12 w-full rounded-[10px] border-2 border-border bg-background px-4 text-sm font-bold outline-none focus:border-ring focus:ring-4 focus:ring-ring/20"
            />
          </div>
          {error ?
            <p className="text-sm font-bold text-coral" role="status">{error}</p>
          : null}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex min-h-12 items-center justify-center rounded-full border-2 border-border bg-lime px-7 text-sm font-black uppercase text-night transition hover:-translate-y-0.5 hover:bg-orange hover:text-white disabled:opacity-70"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {saved ?
              <span className="text-sm font-bold text-teal">Saved.</span>
            : null}
          </div>
        </div>
      </section>

      {/* Wallet */}
      <section className="rounded-[18px] border bg-card p-6 text-card-foreground">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <Wallet size={18} /> Wallet
        </h2>
        <p className="mt-1 text-sm font-bold text-muted-foreground">
          Your Stellar wallet is your ORKA identity.
        </p>
        <div className="mt-4 space-y-2">
          {wallets.length === 0 ?
            <p className="text-sm font-bold text-muted-foreground">
              No wallet linked.
            </p>
          : wallets.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between rounded-[10px] border-2 border-border bg-background px-4 py-3 text-sm font-bold"
            >
              <span className="font-mono">
                {w.address.slice(0, 6)}…{w.address.slice(-4)}
              </span>
              <span className="flex items-center gap-2 text-muted-foreground">
                {w.wallet_type}
                {w.is_primary ?
                  <span className="rounded-full bg-lime px-2 py-0.5 text-xs font-black uppercase text-night">
                    primary
                  </span>
                : null}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
