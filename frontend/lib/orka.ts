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

// Returns the active organization's slug for URL routing (used by legacy dashboard route).
export async function getActiveOrgSlug(
  supabase: SupabaseClient,
): Promise<string | null> {
  const selectedOrgId = (await cookies()).get("orka_active_org")?.value;
  const from = selectedOrgId
    ? supabase
        .from("organization_members")
        .select("organizations(slug)")
        .eq("org_id", selectedOrgId)
        .maybeSingle()
    : supabase
        .from("organization_members")
        .select("organizations(slug)")
        .limit(1)
        .maybeSingle();
  const { data } = await from;
  const org = Array.isArray(
    (data as { organizations?: unknown })?.organizations,
  )
    ? ((data as { organizations?: unknown[] })?.organizations?.[0] as {
        slug?: string;
      })
    : (data as { organizations?: { slug?: string } })?.organizations;
  return org?.slug ?? null;
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

export type ClientStatus = "active" | "inactive" | "lead" | "archived";

export type ClientSummary = {
  id: string;
  name: string;
  email: string | null;
  status: ClientStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type ClientDetail = {
  id: string;
  org_id: string;
  name: string;
  email: string | null;
  status: ClientStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

// Lists the clients belonging to an organization (for the project create dropdown
// and the clients list view).
export async function listClients(
  supabase: SupabaseClient,
  orgId: string,
): Promise<ClientSummary[]> {
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, email, status, metadata, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as ClientSummary[];
}

// Fetches a single client by id, scoped to the organization (for the
// client detail page). Returns null if not found or outside the org.
export async function getClient(
  supabase: SupabaseClient,
  orgId: string,
  clientId: string,
): Promise<ClientDetail | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("id, org_id, name, email, status, metadata, created_at")
    .eq("id", clientId)
    .eq("org_id", orgId)
    .maybeSingle();
  if (error || !data) return null;
  return data as ClientDetail;
}

export type ProjectStatus =
  | "draft"
  | "active"
  | "completed"
  | "archived";

export type ProjectSummary = {
  id: string;
  title: string;
  code: string | null;
  client_name: string | null;
  client_email: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

// Lists the projects belonging to an organization (workspace project list view).
// When clientId is provided, scopes to that client's projects (client detail page).
export async function listProjects(
  supabase: SupabaseClient,
  orgId: string,
  clientId?: string,
): Promise<ProjectSummary[]> {
  let query = supabase
    .from("projects")
    .select("id, title, code, client_name, client_email, status, created_at, updated_at")
    .eq("org_id", orgId);
  if (clientId) query = query.eq("client_id", clientId);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as ProjectSummary[];
}

export type ProjectPageParams = {
  status?: ProjectStatus | "all";
  search?: string;
  limit?: number;
  offset?: number;
};

export type ProjectPage = {
  items: ProjectSummary[];
  total: number;
  hasMore: boolean;
  counts: Record<ProjectStatus, number>;
};

// Server-side paginated + filtered project fetch. Fetches only the visible
// slice so it scales to 100s/1000s of projects (vs. loading everything).
export async function listProjectsPage(
  supabase: SupabaseClient,
  orgId: string,
  { status = "all", search = "", limit = 10, offset = 0 }: ProjectPageParams = {},
): Promise<ProjectPage> {
  const base = supabase
    .from("projects")
    .select("id, title, code, client_name, client_email, status, created_at, updated_at", {
      count: "exact",
    })
    .eq("org_id", orgId);

  if (status !== "all") base.eq("status", status);
  if (search.trim()) base.ilike("title", `%${search.trim()}%`);

  const { data, error, count } = await base
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !data) {
    return {
      items: [],
      total: 0,
      hasMore: false,
      counts: { draft: 0, active: 0, completed: 0, archived: 0 },
    };
  }

  const { data: all } = await supabase
    .from("projects")
    .select("status")
    .eq("org_id", orgId);
  const counts: Record<ProjectStatus, number> = {
    draft: 0,
    active: 0,
    completed: 0,
    archived: 0,
  };
  for (const row of (all as { status: ProjectStatus }[]) ?? []) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  return {
    items: data as ProjectSummary[],
    total: count ?? 0,
    hasMore: (count ?? 0) > offset + limit,
    counts,
  };
}
