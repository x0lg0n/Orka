# Real Data Dashboard Foundation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all mocked dashboard data with real, RLS-scoped Supabase data via a shared query foundation, with on-brand empty states and zero mock data surviving on the frontend.

**Architecture:** A single typed query module (`lib/workspace/queries.ts`) runs parallel Supabase queries scoped to `orgId` and maps rows → the existing `DashboardData` types. The dashboard page becomes a server component that fetches and passes data to presentational client components whose design is unchanged except for dropping `LucideIcon` props (icons become component-internal). This module is the reusable foundation every other workspace route will import.

**Tech Stack:** Next.js 16 App Router (server components), `@supabase/supabase-js` (via existing `createClient`), TypeScript (strict), Tailwind v4. Design skills: frontend-design / apple-design / emil-design-eng for any visual changes; design-review at the end.

## Global Constraints

- No mock data anywhere on the frontend — every workspace route sources real DB tables; absent data shows an honest empty state. (from spec §0, §1)
- Money displays as `asset + numeric` (e.g. `USDC 1,250`); no fake USD FX conversion. (spec §1)
- All queries rely on existing `auth_is_org_member` RLS; no raw SQL; follow `lib/orka.ts` conventions. (spec §2, §3)
- Visual design of presentational components is unchanged; only prop shapes change. Icons become component-internal, mapped by type/event. (spec §4)
- Design work must use available design skills and be scalable + beautiful. (spec §0)
- `pnpm build` must pass and `pnpm lint` must be clean for changed files. (spec §8)

---

## File Structure

**Create**
- `lib/workspace/queries.ts` — the shared real-data foundation. Typed functions `getProjects`, `getMilestones`, `getApprovals`, `getActivity`, `getSummary`, `getDashboardData`.
- `components/dashboard/EmptyState.tsx` — reusable on-brand empty placeholder.

**Modify**
- `types/dashboard.ts` — drop `LucideIcon`/`iconBg` from `MetricData`, `Milestone`, `Activity`; add `metricKey`/`eventType` discriminators where needed; add `DashboardData` already present.
- `components/dashboard/home/MetricCard.tsx` — remove `icon`/`iconBg` props; map icon internally by `metricKey`.
- `components/dashboard/home/MetricCards.tsx` — pass `metricKey` instead of `icon`/`iconBg`.
- `components/dashboard/home/RecentActivity.tsx` — remove `icon`/`iconBg` props; map internally by `eventType`.
- `components/dashboard/home/ActionRequired.tsx` — already internal; no icon change (verify `Approval` type still has `type`).
- `components/dashboard/home/UpcomingMilestones.tsx` — already uses `Calendar` internally; no icon change.
- `components/dashboard/home/DashboardContent.tsx` — accept `data: DashboardData` prop; remove mock import.
- `app/(app)/w/[slug]/dashboard/page.tsx` — become a server component that fetches and passes `data`.
- `lib/dashboard/mock-data.ts` — **delete** at the end.

---

## Task 1: Update dashboard types (drop LucideIcon, add discriminators)

**Files:**
- Modify: `types/dashboard.ts`

**Interfaces:**
- Consumes: nothing (leaf type change).
- Produces: updated `MetricData`, `Activity`, `Milestone`, `Approval` shapes consumed by Task 2 (queries) and Tasks 3–5 (components).

- [ ] **Step 1: Rewrite `types/dashboard.ts` without `LucideIcon` imports**

Replace the entire file with the version below. `MetricData` gains `metricKey` (used by `MetricCard` to pick an icon internally). `Activity` gains `eventType` (used by `RecentActivity` to pick an icon). `Milestone` drops `icon`. `Approval` keeps `type`.

```ts
export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export type MetricKey = "projects" | "escrow" | "approvals" | "payments";

export interface MetricData {
  title: string;
  metricKey: MetricKey;
  value: string;
  subtitle: string;
  trend?: string;
  trendUp?: boolean;
}

export interface Milestone {
  id: string;
  project: string;
  name: string;
  date: string;
}

export type ApprovalType = "review" | "sign" | "release";

export interface Approval {
  id: string;
  project: string;
  description: string;
  type: ApprovalType;
}

export type ActivityEventType =
  | "release"
  | "sign"
  | "edit"
  | "fund"
  | "dispute"
  | "refund";

export interface Activity {
  id: string;
  eventType: ActivityEventType;
  text: string;
  boldPart: string;
  timestamp: string;
}

export type ProjectStatus = "Pending" | "In Progress" | "Completed" | "Archived";

export interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  escrow: string;
  status: ProjectStatus;
  nextMilestone: string;
  nextDate: string;
}

export interface QuickSummaryData {
  period: string;
  revenue: string;
  revenueTrend: string;
  revenueUp: boolean;
  completedProjects: number;
  completedTrend: string;
  completedUp: boolean;
  totalClients: number;
  clientsTrend: string;
  clientsUp: boolean;
}

export interface DashboardData {
  user: DashboardUser;
  metrics: MetricData[];
  approvals: Approval[];
  activities: Activity[];
  milestones: Milestone[];
  projects: Project[];
  summary: QuickSummaryData;
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd frontend && pnpm exec tsc --noEmit 2>&1 | grep -i "types/dashboard" | head`
Expected: no output referencing `types/dashboard.ts` (other files will error until later tasks fix them — that is expected here).

- [ ] **Step 3: Commit**

```bash
git add types/dashboard.ts
git commit -m "refactor(types): drop LucideIcon from dashboard types, add metric/event discriminators"
```

---

## Task 2: Build the shared query foundation `lib/workspace/queries.ts`

**Files:**
- Create: `lib/workspace/queries.ts`

**Interfaces:**
- Consumes: `SupabaseClient` from `@supabase/supabase-js`; types from `@/types/dashboard`.
- Produces: `getProjects`, `getMilestones`, `getApprovals`, `getActivity`, `getSummary`, `getDashboardData` — imported by Task 6 (dashboard page).

Helper: relative time formatter (server-safe, no `Date` mutation beyond `now`).

- [ ] **Step 1: Write `lib/workspace/queries.ts`**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Activity,
  Approval,
  DashboardData,
  MetricData,
  Milestone,
  Project,
  ProjectStatus,
  QuickSummaryData,
} from "@/types/dashboard";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  const months = Math.round(days / 30);
  return `${months} month${months > 1 ? "s" : ""} ago`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtAmount(amount: number, asset: string): string {
  return `${asset} ${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

const STATUS_MAP: Record<string, ProjectStatus> = {
  draft: "Pending",
  active: "In Progress",
  completed: "Completed",
  archived: "Archived",
};

export async function getProjects(
  supabase: SupabaseClient,
  orgId: string,
): Promise<Project[]> {
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, status, client_id, clients(name)")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error || !projects) return [];

  const { data: milestones } = await supabase
    .from("milestones")
    .select("project_id, amount, asset, status")
    .eq("org_id", orgId);

  const msByProject = new Map<string, typeof milestones>();
  for (const ms of milestones ?? []) {
    const list = msByProject.get(ms.project_id) ?? [];
    list.push(ms);
    msByProject.set(ms.project_id, list);
  }

  return (projects as Array<{
    id: string;
    title: string;
    status: string;
    client_id: string | null;
    clients: { name: string } | null;
  }>).map((p) => {
    const ms = msByProject.get(p.id) ?? [];
    const total = ms.length || 1;
    const done = ms.filter((m) => m.status === "released").length;
    const progress = Math.round((done / total) * 100);
    const escrow = ms
      .filter((m) => m.status === "funded" || m.status === "in_review")
      .reduce((sum, m) => sum + Number(m.amount), 0);
    const asset = ms[0]?.asset ?? "USDC";
    const next = ms.find((m) => m.status !== "released" && m.status !== "refunded");
    return {
      id: p.id,
      name: p.title,
      client: p.clients?.name ?? "—",
      progress,
      escrow: fmtAmount(escrow, asset),
      status: STATUS_MAP[p.status] ?? "Pending",
      nextMilestone: next ? `Milestone` : "—",
      nextDate: "—",
    } satisfies Project;
  });
}

export async function getMilestones(
  supabase: SupabaseClient,
  orgId: string,
): Promise<Milestone[]> {
  const { data, error } = await supabase
    .from("milestones")
    .select("id, title, status, project_id, projects(title)")
    .eq("org_id", orgId)
    .neq("status", "released")
    .neq("status", "refunded")
    .order("created_at", { ascending: true })
    .limit(5);
  if (error || !data) return [];
  return (data as Array<{
    id: string;
    title: string;
    project_id: string;
    projects: { title: string } | null;
  }>).map((m) => ({
    id: m.id,
    project: m.projects?.title ?? "Untitled",
    name: m.title,
    date: "Upcoming",
  }));
}

export async function getApprovals(
  supabase: SupabaseClient,
  orgId: string,
): Promise<Approval[]> {
  const { data, error } = await supabase
    .from("milestones")
    .select("id, title, project_id, status, projects(title)")
    .eq("org_id", orgId)
    .in("status", ["in_review", "funded"])
    .limit(5);
  if (error || !data) return [];
  return (data as Array<{
    id: string;
    title: string;
    status: string;
    projects: { title: string } | null;
  }>).map((m) => {
    const type = m.status === "in_review" ? "review" : "sign";
    const description =
      type === "review"
        ? `${m.title} is waiting for your review`
        : `${m.title} is pending your signature`;
    return {
      id: m.id,
      project: m.projects?.title ?? "Untitled",
      description,
      type,
    } satisfies Approval;
  });
}

export async function getActivity(
  supabase: SupabaseClient,
  orgId: string,
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("ledger_events")
    .select("id, event_type, amount, asset, project_id, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error || !data) return [];
  return (data as Array<{
    id: string;
    event_type: string;
    amount: number | null;
    asset: string | null;
    project_id: string | null;
    created_at: string;
  }>).map((e) => {
    const amt = e.amount != null ? fmtAmount(Number(e.amount), e.asset ?? "USDC") : "";
    const map: Record<string, { type: Activity["eventType"]; text: string; bold: string }> = {
      release: { type: "release", text: "Payment released", bold: amt },
      fund: { type: "fund", text: "Escrow funded", bold: amt },
      sign: { type: "sign", text: "Contract signed", bold: "" },
      submit: { type: "edit", text: "Work submitted", bold: "" },
      dispute: { type: "dispute", text: "Dispute opened", bold: "" },
      refund: { type: "refund", text: "Payment refunded", bold: amt },
    };
    const m = map[e.event_type] ?? { type: "edit" as const, text: e.event_type, bold: "" };
    return {
      id: e.id,
      eventType: m.type,
      text: m.text,
      boldPart: m.bold || "workspace",
      timestamp: relativeTime(e.created_at),
    } satisfies Activity;
  });
}

export async function getSummary(
  supabase: SupabaseClient,
  orgId: string,
): Promise<QuickSummaryData> {
  const [{ data: released }, { count: clientCount }, { count: doneCount }] =
    await Promise.all([
      supabase
        .from("ledger_events")
        .select("amount, asset")
        .eq("org_id", orgId)
        .eq("event_type", "release"),
      supabase.from("clients").select("id", { count: "exact", head: true }).eq("org_id", orgId),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .eq("status", "completed"),
    ]);

  const revenue = (released ?? []).reduce(
    (sum, r) => sum + Number(r.amount ?? 0),
    0,
  );
  const asset = (released ?? [])[0]?.asset ?? "USDC";
  return {
    period: "This Month",
    revenue: fmtAmount(revenue, asset),
    revenueTrend: "—",
    revenueUp: true,
    completedProjects: doneCount ?? 0,
    completedTrend: "—",
    completedUp: true,
    totalClients: clientCount ?? 0,
    clientsTrend: "—",
    clientsUp: true,
  };
}

export async function getDashboardData(
  supabase: SupabaseClient,
  orgId: string,
): Promise<DashboardData> {
  const [projects, milestones, approvals, activities, summary] = await Promise.all([
    getProjects(supabase, orgId),
    getMilestones(supabase, orgId),
    getApprovals(supabase, orgId),
    getActivity(supabase, orgId),
    getSummary(supabase, orgId),
  ]);

  const metrics: MetricData[] = [
    {
      title: "Total Projects",
      metricKey: "projects",
      value: String(projects.length),
      subtitle: "Across this workspace",
    },
    {
      title: "Funds in Escrow",
      metricKey: "escrow",
      value:
        projects.reduce((sum, p) => {
          const n = Number(p.escrow.split(" ")[1]?.replace(/,/g, "") ?? 0);
          return Number.isFinite(n) ? sum + n : sum;
        }, 0) > 0
          ? projects
              .map((p) => p.escrow)
              .filter((e) => e !== "USDC 0")
              .slice(0, 1)
              .join("")
          : "USDC 0",
      subtitle: "Held in active milestones",
    },
    {
      title: "Pending Approvals",
      metricKey: "approvals",
      value: String(approvals.length),
      subtitle: approvals.length ? "Requires your action" : "All caught up",
      trend: approvals.length ? "Action needed" : undefined,
      trendUp: false,
    },
    {
      title: "Payments Received",
      metricKey: "payments",
      value: summary.revenue,
      subtitle: "Released to date",
    },
  ];

  return {
    user: { id: "", firstName: "", lastName: "" },
    metrics,
    approvals,
    activities,
    milestones,
    projects,
    summary,
  };
}
```

- [ ] **Step 2: Verify it type-checks against the new types**

Run: `cd frontend && pnpm exec tsc --noEmit 2>&1 | grep -i "workspace/queries" | head`
Expected: no output referencing `lib/workspace/queries.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/workspace/queries.ts
git commit -m "feat(data): add shared RLS-scoped dashboard query foundation"
```

---

## Task 3: Create `EmptyState` component

**Files:**
- Create: `components/dashboard/EmptyState.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `EmptyState` used by every widget in Task 4/5 and future routes.

- [ ] **Step 1: Write `components/dashboard/EmptyState.tsx`**

On-brand, calm placeholder. Neutral ink, no fake numbers. Respects reduced motion via Tailwind `motion-reduce:`.

```tsx
import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      {icon && (
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#f0f0f5] text-[#8b95aa]">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-[#11182d]">{title}</p>
      {description && (
        <p className="max-w-xs text-xs text-[#8b95aa]">{description}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/dashboard/EmptyState.tsx
git commit -m "feat(ui): add reusable on-brand EmptyState placeholder"
```

---

## Task 4: Update `MetricCard` / `MetricCards` to be icon-internal

**Files:**
- Modify: `components/dashboard/home/MetricCard.tsx`
- Modify: `components/dashboard/home/MetricCards.tsx`

**Interfaces:**
- Consumes: `MetricData` from `@/types/dashboard` (now has `metricKey`, no `icon`/`iconBg`).
- Produces: same rendered card, icon chosen internally by `metricKey`.

- [ ] **Step 1: Rewrite `MetricCard.tsx`**

```tsx
import { FolderKanban, Lock, Clock, CircleDollarSign } from "lucide-react";
import type { MetricData, MetricKey } from "@/types/dashboard";

const ICONS: Record<MetricKey, { Icon: typeof FolderKanban; bg: string }> = {
  projects: { Icon: FolderKanban, bg: "bg-purple-100 text-purple-600" },
  escrow: { Icon: Lock, bg: "bg-purple-100 text-purple-600" },
  approvals: { Icon: Clock, bg: "bg-yellow-100 text-yellow-600" },
  payments: { Icon: CircleDollarSign, bg: "bg-green-100 text-green-600" },
};

interface MetricCardProps {
  title: string;
  metricKey: MetricKey;
  value: string;
  subtitle: string;
  trend?: string;
  trendUp?: boolean;
}

export function MetricCard({
  title,
  metricKey,
  value,
  subtitle,
}: MetricCardProps) {
  const { Icon, bg } = ICONS[metricKey];
  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-[#5f6b86]">{title}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[#11182d]">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-[#5f6b86]">{subtitle}</p>
    </div>
  );
}
```

- [ ] **Step 2: Update `MetricCards.tsx` to pass `metricKey`**

Replace its body so the map passes `metricKey` (no `icon`/`iconBg`):

```tsx
import type { MetricData } from "@/types/dashboard";
import { MetricCard } from "./MetricCard";

interface MetricCardsProps {
  metrics: MetricData[];
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.length === 0 ? (
        <p className="col-span-full text-sm text-[#8b95aa]">No metrics yet.</p>
      ) : (
        metrics.map((metric) => <MetricCard key={metric.title} {...metric} />)
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify lint/build for these two files**

Run: `cd frontend && pnpm exec tsc --noEmit 2>&1 | grep -iE "MetricCard" | head`
Expected: no output referencing MetricCard/MetricCards.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/home/MetricCard.tsx components/dashboard/home/MetricCards.tsx
git commit -m "refactor(ui): MetricCard picks icon internally by metricKey"
```

---

## Task 5: Update `RecentActivity` to be icon-internal + add empty states

**Files:**
- Modify: `components/dashboard/home/RecentActivity.tsx`
- Modify: `components/dashboard/home/ActionRequired.tsx` (add empty state only)
- Modify: `components/dashboard/home/UpcomingMilestones.tsx` (add empty state only)

**Interfaces:**
- Consumes: `Activity` (now has `eventType`, no `icon`/`iconBg`), `Approval`, `Milestone` from `@/types/dashboard`; `EmptyState` from Task 3.
- Produces: same visual design, internal icon mapping, graceful empty state.

- [ ] **Step 1: Rewrite `RecentActivity.tsx`**

```tsx
import { ArrowRight, CircleDollarSign, FileSignature, FileEdit, Wallet, AlertTriangle, Undo2 } from "lucide-react";
import type { Activity, ActivityEventType } from "@/types/dashboard";
import { EmptyState } from "@/components/dashboard/EmptyState";

const ICONS: Record<ActivityEventType, { Icon: typeof CircleDollarSign; bg: string }> = {
  release: { Icon: CircleDollarSign, bg: "bg-green-100 text-green-600" },
  sign: { Icon: FileSignature, bg: "bg-purple-100 text-purple-600" },
  edit: { Icon: FileEdit, bg: "bg-yellow-100 text-yellow-600" },
  fund: { Icon: Wallet, bg: "bg-blue-100 text-blue-600" },
  dispute: { Icon: AlertTriangle, bg: "bg-red-100 text-red-600" },
  refund: { Icon: Undo2, bg: "bg-gray-100 text-gray-600" },
};

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <h2 className="mb-4 text-base font-bold text-[#11182d]">Recent Activity</h2>
      {activities.length === 0 ? (
        <EmptyState title="No activity yet" description="Ledger events will appear here as work progresses." />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {activities.map((activity) => {
              const { Icon, bg } = ICONS[activity.eventType];
              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="text-sm text-[#5f6b86]">
                      {activity.text}{" "}
                      <span className="font-semibold text-[#11182d]">{activity.boldPart}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[#8b95aa]">{activity.timestamp}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#7c3aed] transition-colors duration-150 hover:text-[#6d28d9]">
            View all activity
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add empty state to `ActionRequired.tsx`**

Wrap the list: after the `</div>` that closes the header row (line 34 area), change the list render to show `EmptyState` when `approvals.length === 0`:

```tsx
      <div className="flex flex-col gap-3">
        {approvals.length === 0 ? (
          <EmptyState title="Nothing to action" description="Approvals and signatures will show up here." />
        ) : (
          approvals.map((approval) => {
            const config = actionConfig[approval.type];
            const Icon = config.icon;
            return (
              <div key={approval.id} className="flex items-center gap-3 rounded-lg border border-[#e5e8f0] p-3 transition-colors duration-150 hover:bg-[#f7f8fc]">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#11182d]">{approval.project}</p>
                  <p className="text-xs text-[#5f6b86]">{approval.description}</p>
                </div>
                <button className="flex shrink-0 items-center gap-1 rounded-lg border border-[#e5e8f0] px-3 py-1.5 text-xs font-semibold text-[#5f6b86] transition-colors duration-150 hover:border-[#7c3aed] hover:text-[#7c3aed]">
                  {config.buttonLabel}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
```

Add the import at the top of `ActionRequired.tsx` (after the existing `lucide-react` import line):
```tsx
import { EmptyState } from "@/components/dashboard/EmptyState";
```

- [ ] **Step 3: Add empty state to `UpcomingMilestones.tsx`**

Replace the `<div className="flex flex-col gap-3">…</div>` block (lines 20–36) with:

```tsx
      <div className="flex flex-col gap-3">
        {milestones.length === 0 ? (
          <EmptyState title="No upcoming milestones" description="Funded milestones will be listed here." />
        ) : (
          milestones.map((milestone) => (
            <div key={milestone.id} className="rounded-lg border border-[#e5e8f0] p-3 transition-colors duration-150 hover:bg-[#f7f8fc]">
              <p className="text-sm font-semibold text-[#11182d]">{milestone.project}</p>
              <p className="mt-0.5 text-xs text-[#5f6b86]">{milestone.name}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#8b95aa]">
                <Calendar className="h-3 w-3" />
                <span>{milestone.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
```

Add the import at the top of `UpcomingMilestones.tsx`:
```tsx
import { EmptyState } from "@/components/dashboard/EmptyState";
```

- [ ] **Step 4: Verify types/lint**

Run: `cd frontend && pnpm exec tsc --noEmit 2>&1 | grep -iE "RecentActivity|ActionRequired|UpcomingMilestones" | head`
Expected: no output referencing these files.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/home/RecentActivity.tsx components/dashboard/home/ActionRequired.tsx components/dashboard/home/UpcomingMilestones.tsx
git commit -m "refactor(ui): internal icons + empty states for activity/approvals/milestones"
```

---

## Task 6: Wire `DashboardContent` + dashboard page to real data

**Files:**
- Modify: `components/dashboard/home/DashboardContent.tsx`
- Modify: `app/(app)/w/[slug]/dashboard/page.tsx`
- Modify: `app/(app)/w/[slug]/layout.tsx` (pass `user` name into page — see note)

**Interfaces:**
- Consumes: `DashboardData` from `@/types/dashboard`; `getDashboardData` from `@/lib/workspace/queries`; `createClient` + `getActiveOrgBySlug` from existing modules.
- Produces: a server-rendered dashboard with real data; no mock import.

Note: `DashboardContent` currently takes `slug: string` and renders `DashboardHeader user={currentUser}`. The page will fetch data and pass `data`. The user's first name for the header comes from the layout's resolved `name`. Pass `firstName` into the page via the layout, OR resolve in the page. Simplest: resolve profile name in the page (it already has `createClient` + `user`). We pass `data` plus a `firstName` string.

- [ ] **Step 1: Rewrite `DashboardContent.tsx`**

```tsx
"use client";

import { DashboardHeader } from "@/components/dashboard/home/DashboardHeader";
import { MetricCards } from "@/components/dashboard/home/MetricCards";
import { ActionRequired } from "@/components/dashboard/home/ActionRequired";
import { RecentActivity } from "@/components/dashboard/home/RecentActivity";
import { UpcomingMilestones } from "@/components/dashboard/home/UpcomingMilestones";
import { ActiveProjectsTable } from "@/components/dashboard/home/ActiveProjectsTable";
import { AICopilot } from "@/components/dashboard/home/AICopilot";
import { QuickSummary } from "@/components/dashboard/home/QuickSummary";
import type { DashboardData } from "@/types/dashboard";

export function DashboardContent({
  data,
  firstName,
}: {
  data: DashboardData;
  firstName: string;
}) {
  return (
    <div className="dashboard-light flex flex-col gap-6">
      <DashboardHeader user={{ id: data.user.id, firstName, lastName: "" }} workspace="" />

      <MetricCards metrics={data.metrics} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ActionRequired approvals={data.approvals} />
            <RecentActivity activities={data.activities} />
          </div>

          <ActiveProjectsTable projects={data.projects} />
        </div>

        <div className="flex flex-col gap-6">
          <UpcomingMilestones milestones={data.milestones} />
          <AICopilot />
          <QuickSummary summary={data.summary} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite the dashboard page as a server component**

```tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { getDashboardData } from "@/lib/workspace/queries";
import { DashboardContent } from "@/components/dashboard/home/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard · ORKA",
  description: "Your ORKA workspace dashboard.",
};

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) {
    return <DashboardContent data={EMPTY_DASHBOARD} firstName="" />;
  }
  const data = await getDashboardData(supabase, org.id);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id ?? "")
    .maybeSingle();
  const firstName =
    (profile?.full_name as string | null) ??
    (user?.user_metadata?.full_name as string | null) ??
    "";

  return <DashboardContent data={data} firstName={firstName} />;
}

const EMPTY_DASHBOARD = {
  user: { id: "", firstName: "", lastName: "" },
  metrics: [],
  approvals: [],
  activities: [],
  milestones: [],
  projects: [],
  summary: {
    period: "This Month",
    revenue: "USDC 0",
    revenueTrend: "—",
    revenueUp: true,
    completedProjects: 0,
    completedTrend: "—",
    completedUp: true,
    totalClients: 0,
    clientsTrend: "—",
    clientsUp: true,
  },
} as const;
```

- [ ] **Step 3: Delete `lib/dashboard/mock-data.ts`**

Run: `cd frontend && git rm lib/dashboard/mock-data.ts`
Expected: file removed from git index.

- [ ] **Step 4: Build**

Run: `cd frontend && pnpm build 2>&1 | tail -15`
Expected: `✓ Compiled successfully` and static generation completes without errors.

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/w/\[slug\]/dashboard/page.tsx components/dashboard/home/DashboardContent.tsx
git commit -m "feat(dashboard): server-render real data, remove mock source"
```

---

## Task 7: Full verification + no-mock gate

**Files:** (no new files)

**Interfaces:**
- Consumes: the whole frontend tree.

- [ ] **Step 1: Grep for any remaining mock imports in workspace routes**

Run: `cd frontend && rg -l "mock-data|currentUser|metrics|approvals|activities" --glob 'app/**' --glob 'components/**' | grep -v "types/dashboard" | head`
Expected: no files referencing the deleted `mock-data` symbols (only legitimate local variable names remain; if any route still imports mock data, it must be fixed before merge).

- [ ] **Step 2: Run lint**

Run: `cd frontend && pnpm lint 2>&1 | grep -E "error|warning" | grep -v "theme-toggle" | head`
Expected: only the pre-existing unrelated `theme-toggle.tsx` set-state-in-effect warning remains; no new errors for changed files.

- [ ] **Step 3: Run build once more (clean)**

Run: `cd frontend && pnpm build 2>&1 | grep -E "Compiled|Failed|error" | head`
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Final commit if any cleanup was needed**

```bash
git add -A
git commit -m "chore: verify no mocked data remains in workspace routes"
```
(Only if Step 1/2 surfaced fixes; otherwise skip.)

---

## Self-Review Notes (plan author)

- **Spec coverage:** §2 (server fetch) → Task 6; §3 (query fns) → Task 2; §4 (icon-internal + empty states) → Tasks 4 & 5; §5 (types + delete mock) → Tasks 1 & 6; §6 (rollout) is explicitly follow-on; §7 (errors/empty) → Task 5 empty states + EMPTY_DASHBOARD; §8 (build/lint + grep gate) → Task 7.
- **Placeholder scan:** no TBD/TODO; every code step shows full code.
- **Type consistency:** `MetricData.metricKey`, `Activity.eventType`, `Approval.type`, `Project.status` match between types (Task 1), queries (Task 2), and components (Tasks 4–5). `getDashboardData` returns `DashboardData` consumed by Task 6.
- **Known simplification:** `Project.nextMilestone`/`nextDate` are stubbed (`"Milestone"`/`"—"`) because milestones lack a due-date column in the current schema; this is honest (no fake date) and matches the "only what schema supports" decision. A future migration adding `due_date` will populate it.
