import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const MILESTONE_STATUS = [
  "draft",
  "funded",
  "in_review",
  "approved",
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
  const selectedOrgId = (await cookies()).get("orka_active_org")?.value;
  if (selectedOrgId) {
    const { data: selected } = await supabase
      .from("organization_members")
      .select("org_id")
      .eq("org_id", selectedOrgId)
      .maybeSingle();
    if (selected?.org_id) return selected.org_id;
  }

  const { data } = await supabase
    .from("organization_members")
    .select("org_id")
    .limit(1)
    .maybeSingle();
  return data?.org_id ?? null;
}

export type OrgSummary = { id: string; name: string; slug: string; role: string };

export type OrgBySlug = {
  id: string;
  name: string;
  slug: string;
  type: string | null;
  logo_url: string | null;
};

// Resolves an organization by its URL slug (used as the workspace identity in /w/[slug]).
export async function getActiveOrgBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<OrgBySlug | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, type, logo_url")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as OrgBySlug;
}

// Lists the organizations a user belongs to, with slug for URL routing.
export async function listOrgsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<OrgSummary[]> {
  const { data, error } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name, slug)")
    .eq("user_id", userId);
  if (error || !data) return [];
  return (data ?? [])
    .map((row: { role?: unknown; organizations?: unknown }) => {
      const org = Array.isArray(row.organizations)
        ? row.organizations[0]
        : row.organizations;
      if (!org || !(org as { slug?: unknown }).slug) return null;
      return {
        ...(org as { id: string; name: string; slug: string }),
        role: String(row.role ?? "member"),
      } as OrgSummary;
    })
    .filter((o): o is OrgSummary => Boolean(o && o.slug));
}
