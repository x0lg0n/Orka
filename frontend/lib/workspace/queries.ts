import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  Activity,
  ActivityEventType,
  Approval,
  ApprovalType,
  DashboardData,
  MetricData,
  MetricKey,
  Milestone,
  Project,
  ProjectStatus,
  QuickSummaryData,
} from "@/types/dashboard";

// Mocked per the MVP scope (no real Stellar on-chain reads yet).
const MOCK_TX =
  "c0ffee254729094d7d243acad34df4ee98a7b5e8c7f27a1b3c9d4e5f6a7b8c9d";

function createServerSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase URL or API key");
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function money(
  amount: number | null | undefined,
  asset?: string | null,
): string {
  const n = amount ?? 0;
  const assetLabel = asset ?? "USDC";
  return `${assetLabel} ${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

interface MilestoneRow {
  project_id: string;
  amount: number;
  asset: string | null;
}

interface ProjectRow {
  id: string;
  title: string;
  status: string;
  client_name: string | null;
  milestones?: MilestoneRow[] | null;
}

interface NamedProjectRow {
  id: string;
  title: string;
  project_id: string;
  status: string;
  projects?: { title: string } | null;
}

interface LedgerRow {
  id: string;
  event_type: string;
  amount: number | null;
  asset: string | null;
  project_id: string | null;
  projects?: { title: string } | null;
  created_at: string;
}

function escrowForProject(
  projectId: string,
  milestones: MilestoneRow[],
): string {
  const total = milestones
    .filter((m) => m.project_id === projectId)
    .reduce((sum, m) => sum + (m.amount ?? 0), 0);
  return money(total);
}

function statusLabel(status: string): ProjectStatus {
  switch (status) {
    case "active":
      return "In Progress";
    case "completed":
      return "Completed";
    case "archived":
      return "Archived";
    default:
      return "Pending";
  }
}

export async function getProjects(
  supabase: SupabaseClient,
  orgId: string,
  slug: string,
): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, status, client_name, milestones(id, amount, asset)")
    .eq("org_id", orgId)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error || !data) return [];

  const rows = data as unknown as ProjectRow[];
  const milestones = rows.flatMap((p) => p.milestones ?? []);

  return rows.map((p) => ({
    id: p.id,
    name: p.title,
    client: p.client_name || "—",
    progress: p.status === "completed" ? 100 : p.status === "active" ? 60 : 0,
    escrow: escrowForProject(p.id, milestones),
    status: statusLabel(p.status),
    nextMilestone: "—",
    nextDate: "—",
    href: `/w/${slug}/projects/${p.id}`,
  }));
}

export async function getMilestones(
  supabase: SupabaseClient,
  orgId: string,
  slug: string,
): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from("milestones")
    .select("id, title, project_id, projects(title)")
    .eq("org_id", orgId)
    .in("status", ["funded", "in_review"])
    .order("created_at", { ascending: false })
    .limit(5);
  if (error || !data) return [];

  const rows = data as unknown as NamedProjectRow[];
  return rows.map((m) => ({
    id: m.id,
    project: (m.projects?.title as string) || "Project",
    projectId: m.project_id,
    name: m.title,
    date: "—",
    href: `/w/${slug}/projects/${m.project_id}`,
  }));
}

export async function getApprovals(
  supabase: SupabaseClient,
  orgId: string,
  slug: string,
): Promise<Approval[]> {
  // Review approvals: milestones awaiting review.
  const { data: review, error } = await supabase
    .from("milestones")
    .select("id, title, project_id, projects(title), status")
    .eq("org_id", orgId)
    .eq("status", "in_review")
    .order("created_at", { ascending: false })
    .limit(4);
  if (error || !review) return [];

  const rows = review as unknown as NamedProjectRow[];
  return rows.map((m) => ({
    id: m.id,
    project: (m.projects?.title as string) || "Project",
    projectId: m.project_id,
    description: `Review milestone "${m.title}"`,
    type: "review" as ApprovalType,
    href: `/w/${slug}/projects/${m.project_id}`,
  }));
}

export async function getActivity(
  supabase: SupabaseClient,
  orgId: string,
  slug: string,
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("ledger_events")
    .select(
      "id, event_type, amount, asset, project_id, projects(title), created_at",
    )
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(6);
  if (error || !data) return [];

  const VERBS: Record<string, { verb: string; event: ActivityEventType }> = {
    release: { verb: "released escrow for", event: "release" },
    fund: { verb: "funded", event: "fund" },
    approve: { verb: "approved milestone in", event: "sign" },
    submit: { verb: "submitted work to", event: "edit" },
    refund: { verb: "refunded", event: "refund" },
    dispute: { verb: "opened a dispute on", event: "dispute" },
    resolve: { verb: "resolved a dispute on", event: "dispute" },
  };

  const rows = data as unknown as LedgerRow[];
  return rows.map((e) => {
    const v = VERBS[e.event_type] ?? { verb: "updated", event: "edit" as ActivityEventType };
    const proj = (e.projects?.title as string) || "a project";
    const amt = e.amount ? ` ${money(e.amount, e.asset)}` : "";
    return {
      id: e.id,
      eventType: v.event,
      text: `${v.verb} ${proj}${amt}`,
      boldPart: proj,
      projectId: e.project_id ?? "",
      timestamp: new Date(e.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      href: e.project_id ? `/w/${slug}/projects/${e.project_id}` : undefined,
    };
  });
}

export async function getSummary(
  supabase: SupabaseClient,
  orgId: string,
  slug: string,
): Promise<{
  metrics: MetricData[];
  summary: QuickSummaryData;
}> {
  const [{ count: projectCount }, { data: mData }, { count: approvalCount }, { count: paidInvoices }, { count: clientCount }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId),
      supabase
        .from("milestones")
        .select("amount, asset, status")
        .eq("org_id", orgId)
        .in("status", ["funded", "in_review"]),
      supabase
        .from("milestones")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("status", "in_review"),
      supabase
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("status", "paid"),
      supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("org_id", orgId),
    ]);

  const milestoneRows = (mData as unknown as MilestoneRow[]) ?? [];
  const escrowTotal = milestoneRows.reduce((s, m) => s + (m.amount ?? 0), 0);

  const metrics: MetricData[] = [
    {
      title: "Active Projects",
      metricKey: "projects" as MetricKey,
      value: String(projectCount ?? 0),
      subtitle: "across your workspace",
      href: `/w/${slug}/projects`,
    },
    {
      title: "In Escrow",
      metricKey: "escrow" as MetricKey,
      value: money(escrowTotal),
      subtitle: "funded & in review",
      href: `/w/${slug}/payments`,
    },
    {
      title: "Pending Approvals",
      metricKey: "approvals" as MetricKey,
      value: String(approvalCount ?? 0),
      subtitle: "awaiting your review",
      href: `/w/${slug}/projects?tab=milestones`,
    },
    {
      title: "Payments Cleared",
      metricKey: "payments" as MetricKey,
      value: String(paidInvoices ?? 0),
      subtitle: "invoices paid",
      href: `/w/${slug}/invoices`,
    },
  ];

  const summary: QuickSummaryData = {
    period: "This month",
    revenue: money(escrowTotal),
    revenueTrend: "from funded milestones",
    revenueUp: true,
    completedProjects: projectCount ?? 0,
    completedTrend: "total projects",
    completedUp: true,
    totalClients: clientCount ?? 0,
    clientsTrend: "in your workspace",
    clientsUp: true,
  };

  return { metrics, summary };
}

export async function getDashboardData(
  orgId: string,
  slug: string,
  user: { id: string; firstName: string; lastName: string; avatar?: string },
): Promise<DashboardData> {
  const supabase = createServerSupabase();

  const [projects, milestones, approvals, activities, { metrics, summary }] =
    await Promise.all([
      getProjects(supabase, orgId, slug),
      getMilestones(supabase, orgId, slug),
      getApprovals(supabase, orgId, slug),
      getActivity(supabase, orgId, slug),
      getSummary(supabase, orgId, slug),
    ]);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
    },
    metrics,
    approvals,
    activities,
    milestones,
    projects,
    summary,
  };
}

export { MOCK_TX };
