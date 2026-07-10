import type { SupabaseClient } from "@supabase/supabase-js";

export const MILESTONE_STATUS = [
  "draft",
  "funded",
  "in_review",
  "released",
  "refunded",
  "disputed",
] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUS)[number];

// Simulated on-chain tx hash. Stands in for the Soroban tx the Rust
// backend would return. Mocked per the MVP scope (no real Stellar).
export function fakeTx(): string {
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 64; i++) out += hex[Math.floor(Math.random() * 16)];
  return out;
}

// Returns the user's first org id, or null if they have none yet.
export async function getActiveOrgId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data } = await supabase
    .from("organization_members")
    .select("org_id")
    .limit(1)
    .maybeSingle();
  return data?.org_id ?? null;
}
