# Project Overview Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Project Overview page at `/w/[workspace]/projects/[projectId]/overview` — a comprehensive dashboard showing project stats, milestones, escrow, activity, files, and client info.

**Architecture:** Server component `page.tsx` fetches all data (project, milestones, client, files, activity, owner profile) and passes computed values to a client component `ProjectOverviewView`. 11 co-located sub-components render each section. Recharts `PieChart` for the escrow donut.

**Tech Stack:** Next.js App Router, TypeScript, Supabase SSR client, Recharts, Tailwind CSS, lucide-react icons

## Global Constraints

- Do NOT modify: auth, sidebar, workspace layout, `projects/[id]/layout.tsx`, `ProjectHeader.tsx`, `ProjectTabs.tsx`, project creation flow, other pages
- Use existing UI patterns: white cards (`rounded-xl border border-gray-200 bg-white p-5 shadow-sm`), purple accent (`#7c3aed`), Tailwind classes
- All data fetched dynamically — no hardcoded values
- Must work for every workspace and every project
- Use `createClient` from `@/lib/supabase/server` for data fetching (RLS-aware)
- Preserve workspace slug in all internal links: `/w/${slug}/...`

---

## File Map

| File | Purpose |
|------|---------|
| `app/(app)/w/[slug]/projects/[id]/overview/page.tsx` | Server component — fetches all data, renders `ProjectOverviewView` |
| `app/(app)/w/[slug]/projects/[id]/overview/components/ProjectOverviewView.tsx` | Main client wrapper — receives all data as props, renders grid layout |
| `app/(app)/w/[slug]/projects/[id]/overview/components/ProjectStatsRow.tsx` | 5 stat cards row |
| `app/(app)/w/[slug]/projects/[id]/overview/components/ProjectOverviewCard.tsx` | Project details card |
| `app/(app)/w/[slug]/projects/[id]/overview/components/MilestoneProgressCard.tsx` | Milestone progress visualization |
| `app/(app)/w/[slug]/projects/[id]/overview/components/ClientInfoCard.tsx` | Client information card |
| `app/(app)/w/[slug]/projects/[id]/overview/components/EscrowOverviewCard.tsx` | Escrow donut chart + legend |
| `app/(app)/w/[slug]/projects/[id]/overview/components/RecentActivityCard.tsx` | Activity timeline |
| `app/(app)/w/[slug]/projects/[id]/overview/components/QuickActionsCard.tsx` | Quick action list |
| `app/(app)/w/[slug]/projects/[id]/overview/components/ProjectFilesCard.tsx` | Project files display |
| `app/(app)/w/[slug]/projects/[id]/overview/components/UpcomingMilestonesCard.tsx` | Upcoming milestones list |

---

### Task 1: Create server-side page.tsx with data fetching

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/page.tsx`

**Interfaces:**
- Consumes: URL params `{ slug, id }`, Supabase SSR client, `getActiveOrgBySlug` from `@/lib/orka`
- Produces: Passes `OverviewData` prop to `ProjectOverviewView`

- [ ] **Step 1: Create the overview directory**

```bash
mkdir -p "frontend/app/(app)/w/[slug]/projects/[id]/overview/components"
```

- [ ] **Step 2: Write page.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/page.tsx`:

```tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProjectOverviewView } from "./components/ProjectOverviewView";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", org.id)
    .eq("id", id)
    .single();

  if (!project) notFound();

  // Fetch milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  // Fetch client
  let client = null;
  if (project.client_id) {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("id", project.client_id)
      .eq("org_id", org.id)
      .single();
    client = data;
  }

  // Fetch owner profile
  let owner = null;
  if (project.created_by) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", project.created_by)
      .single();
    owner = data;
  }

  // Fetch files
  const { data: files } = await supabase
    .from("files")
    .select("id, name, size, created_at, review_status")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  // Fetch recent activity
  const { data: activity } = await supabase
    .from("activity")
    .select("id, type, payload, created_at, actor_id")
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Fetch team members count
  const { count: memberCount } = await supabase
    .from("project_members")
    .select("user_id", { count: "exact", head: true })
    .eq("project_id", id);

  const allMilestones = milestones ?? [];
  const allFiles = files ?? [];
  const allActivity = activity ?? [];

  // Compute stats
  const totalMilestones = allMilestones.length;
  const releasedMilestones = allMilestones.filter(
    (m) => m.status === "released"
  );
  const fundedMilestones = allMilestones.filter(
    (m) => m.status === "funded" || m.status === "in_review"
  );
  const pendingMilestones = allMilestones.filter(
    (m) => m.status === "draft"
  );
  const refundedMilestones = allMilestones.filter(
    (m) => m.status === "refunded"
  );

  const totalBudget = allMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );
  const fundedAmount = fundedMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );
  const releasedAmount = releasedMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );
  const pendingAmount = pendingMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );
  const refundedAmount = refundedMilestones.reduce(
    (sum, m) => sum + Number(m.amount),
    0
  );

  const progressPct =
    totalMilestones > 0
      ? Math.round((releasedMilestones.length / totalMilestones) * 100)
      : 0;

  const milestoneAsset =
    allMilestones.length > 0 ? allMilestones[0].asset : "XLM";

  const escrowFundedPct =
    totalBudget > 0
      ? Math.round(
          ((fundedAmount + releasedAmount) / totalBudget) * 100
        )
      : 0;

  return (
    <ProjectOverviewView
      slug={slug}
      projectId={id}
      project={project}
      milestones={allMilestones}
      client={client}
      owner={owner}
      files={allFiles}
      activity={allActivity}
      memberCount={memberCount ?? 0}
      stats={{
        progressPct,
        totalMilestones,
        releasedCount: releasedMilestones.length,
        fundedCount: fundedMilestones.length,
        pendingCount: pendingMilestones.length,
        refundedCount: refundedMilestones.length,
        completedCount: releasedMilestones.length,
        inProgressCount: fundedMilestones.length,
        upcomingCount: pendingMilestones.length,
        totalBudget,
        fundedAmount,
        releasedAmount,
        pendingAmount,
        refundedAmount,
        milestoneAsset,
        escrowFundedPct,
      }}
    />
  );
}
```

- [ ] **Step 3: Verify build compiles**

Run: `cd frontend && pnpm build 2>&1 | head -30`
Expected: May fail with "Cannot find module './components/ProjectOverviewView'" — that's fine, Task 2 creates it.

---

### Task 2: Create ProjectOverviewView client wrapper

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/components/ProjectOverviewView.tsx`

**Interfaces:**
- Consumes: All data from `page.tsx` via props
- Produces: Full page layout rendering all sub-components

- [ ] **Step 1: Create ProjectOverviewView.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/ProjectOverviewView.tsx`:

```tsx
"use client";

import { ProjectStatsRow } from "./ProjectStatsRow";
import { ProjectOverviewCard } from "./ProjectOverviewCard";
import { MilestoneProgressCard } from "./MilestoneProgressCard";
import { ClientInfoCard } from "./ClientInfoCard";
import { EscrowOverviewCard } from "./EscrowOverviewCard";
import { RecentActivityCard } from "./RecentActivityCard";
import { QuickActionsCard } from "./QuickActionsCard";
import { ProjectFilesCard } from "./ProjectFilesCard";
import { UpcomingMilestonesCard } from "./UpcomingMilestonesCard";

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  status: string;
  client_name: string | null;
  client_email: string | null;
  client_id: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

type MilestoneRow = {
  id: string;
  title: string;
  amount: number;
  asset: string;
  status: string;
  due_date: string | null;
};

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
} | null;

type OwnerRow = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

type FileRow = {
  id: string;
  name: string;
  size: number | null;
  created_at: string;
  review_status: string;
};

type ActivityRow = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
  actor_id: string | null;
};

type OverviewStats = {
  progressPct: number;
  totalMilestones: number;
  releasedCount: number;
  fundedCount: number;
  pendingCount: number;
  refundedCount: number;
  completedCount: number;
  inProgressCount: number;
  upcomingCount: number;
  totalBudget: number;
  fundedAmount: number;
  releasedAmount: number;
  pendingAmount: number;
  refundedAmount: number;
  milestoneAsset: string;
  escrowFundedPct: number;
};

export function ProjectOverviewView({
  slug,
  projectId,
  project,
  milestones,
  client,
  owner,
  files,
  activity,
  memberCount,
  stats,
}: {
  slug: string;
  projectId: string;
  project: ProjectRow;
  milestones: MilestoneRow[];
  client: ClientRow;
  owner: OwnerRow;
  files: FileRow[];
  activity: ActivityRow[];
  memberCount: number;
  stats: OverviewStats;
}) {
  return (
    <div className="space-y-6">
      <ProjectStatsRow stats={stats} asset={stats.milestoneAsset} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ProjectOverviewCard
          description={project.description}
          owner={owner}
          metadata={project.metadata}
          createdAt={project.created_at}
          updatedAt={project.updated_at}
        />
        <MilestoneProgressCard
          slug={slug}
          projectId={projectId}
          completedCount={stats.completedCount}
          inProgressCount={stats.inProgressCount}
          upcomingCount={stats.upcomingCount}
          pendingCount={stats.pendingCount}
          totalCount={stats.totalMilestones}
          progressPct={stats.progressPct}
        />
        <ClientInfoCard
          slug={slug}
          client={client}
          projectClientId={project.client_id}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <EscrowOverviewCard
          fundedAmount={stats.fundedAmount}
          releasedAmount={stats.releasedAmount}
          pendingAmount={stats.pendingAmount}
          refundedAmount={stats.refundedAmount}
          totalBudget={stats.totalBudget}
          asset={stats.milestoneAsset}
          escrowFundedPct={stats.escrowFundedPct}
        />
        <RecentActivityCard
          slug={slug}
          projectId={projectId}
          activity={activity}
        />
        <QuickActionsCard slug={slug} projectId={projectId} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProjectFilesCard
          slug={slug}
          projectId={projectId}
          files={files}
        />
        <UpcomingMilestonesCard
          slug={slug}
          projectId={projectId}
          milestones={milestones}
          asset={stats.milestoneAsset}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build compiles (will fail on missing sub-components — expected)**

Run: `cd frontend && pnpm build 2>&1 | head -40`
Expected: Fails on missing sub-component imports — each subsequent task creates them.

---

### Task 3: Create ProjectStatsRow

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/components/ProjectStatsRow.tsx`

**Interfaces:**
- Consumes: `stats` object and `asset` string from `ProjectOverviewView`
- Produces: 5 stat cards in a horizontal row

- [ ] **Step 1: Create ProjectStatsRow.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/ProjectStatsRow.tsx`:

```tsx
import {
  TrendingUp,
  Wallet,
  Lock,
  ArrowUpCircle,
  Clock,
} from "lucide-react";

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  badge,
  badgeColor,
  progress,
  progressColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  badgeColor?: string;
  progress?: number;
  progressColor?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {badge && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}
          >
            {badge}
          </span>
        )}
      </div>
      {sub && <p className="mt-1 text-sm text-gray-400">{sub}</p>}
      {progress != null && (
        <div className="mt-3 h-2 w-full rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${progressColor ?? "bg-[#7c3aed]"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ProjectStatsRow({
  stats,
  asset,
}: {
  stats: {
    progressPct: number;
    totalMilestones: number;
    releasedCount: number;
    totalBudget: number;
    fundedAmount: number;
    releasedAmount: number;
    pendingAmount: number;
  };
  asset: string;
}) {
  const xlmToUsd = 1.4687;
  const fmt = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const usd = (n: number) => `≈ $${(n * xlmToUsd).toFixed(2)} USD`;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        icon={TrendingUp}
        iconBg="bg-purple-50"
        iconColor="text-[#7c3aed]"
        label="Project Progress"
        value={`${stats.progressPct}%`}
        badge="On Track"
        badgeColor="bg-emerald-50 text-emerald-600"
        progress={stats.progressPct}
        sub={`${stats.releasedCount} of ${stats.totalMilestones} milestones completed`}
      />
      <StatCard
        icon={Wallet}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        label="Total Budget"
        value={`${fmt(stats.totalBudget)} ${asset}`}
        sub={usd(stats.totalBudget)}
      />
      <StatCard
        icon={Lock}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-500"
        label="Escrow Funded"
        value={`${fmt(stats.fundedAmount + stats.releasedAmount)} ${asset}`}
        sub={`✓ ${stats.fundedAmount + stats.releasedAmount > 0 ? "100" : "0"}% Funded`}
      />
      <StatCard
        icon={ArrowUpCircle}
        iconBg="bg-blue-50"
        iconColor="text-blue-500"
        label="Amount Released"
        value={`${fmt(stats.releasedAmount)} ${asset}`}
        sub={usd(stats.releasedAmount)}
      />
      <StatCard
        icon={Clock}
        iconBg="bg-orange-50"
        iconColor="text-orange-500"
        label="Pending Amount"
        value={`${fmt(stats.pendingAmount)} ${asset}`}
        sub={usd(stats.pendingAmount)}
      />
    </div>
  );
}
```

---

### Task 4: Create ProjectOverviewCard

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/components/ProjectOverviewCard.tsx`

**Interfaces:**
- Consumes: project description, owner, metadata, dates from `ProjectOverviewView`
- Produces: Project details card with description, owner, type, priority, currency, dates

- [ ] **Step 1: Create ProjectOverviewCard.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/ProjectOverviewCard.tsx`:

```tsx
import { Pencil } from "lucide-react";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function priorityColor(priority: string) {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-amber-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
}

export function ProjectOverviewCard({
  description,
  owner,
  metadata,
  createdAt,
  updatedAt,
}: {
  description: string | null;
  owner: { full_name: string | null; avatar_url: string | null } | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}) {
  const meta = metadata as {
    category?: string;
    priority?: string;
    currency?: string;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Project Overview</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Project Owner</span>
          <div className="flex items-center gap-2">
            {owner?.avatar_url ? (
              <img
                src={owner.avatar_url}
                alt=""
                className="h-5 w-5 rounded-full"
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[8px] font-bold text-gray-600">
                {owner?.full_name?.charAt(0) ?? "?"}
              </div>
            )}
            <span className="text-xs font-medium text-gray-700">
              {owner?.full_name ?? "Unassigned"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Project Type</span>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#7c3aed]" />
            <span className="text-xs font-medium text-gray-700">
              {meta.category ?? "Fixed Price"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Priority</span>
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2 w-2 rounded-full ${priorityColor(meta.priority ?? "normal")}`}
            />
            <span className="text-xs font-medium text-gray-700 capitalize">
              {meta.priority ?? "Normal"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Currency</span>
          <span className="text-xs font-medium text-gray-700">
            {meta.currency ?? "XLM"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Created On</span>
          <span className="text-xs font-medium text-gray-700">
            {formatDate(createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Last Updated</span>
          <span className="text-xs font-medium text-gray-700">
            {formatDate(updatedAt)}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit Project Details
      </button>
    </div>
  );
}
```

---

### Task 5: Create MilestoneProgressCard

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/components/MilestoneProgressCard.tsx`

**Interfaces:**
- Consumes: milestone counts, progress percentage, slug, projectId
- Produces: Segmented progress bar + status breakdown + View All link

- [ ] **Step 1: Create MilestoneProgressCard.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/MilestoneProgressCard.tsx`:

```tsx
import Link from "next/link";

function StatusRow({
  label,
  count,
  pct,
  color,
}: {
  label: string;
  count: number;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-sm text-gray-600">
          {label} ({count})
        </span>
      </div>
      <span className="text-sm font-medium text-gray-700">{pct}%</span>
    </div>
  );
}

export function MilestoneProgressCard({
  slug,
  projectId,
  completedCount,
  inProgressCount,
  upcomingCount,
  pendingCount,
  totalCount,
  progressPct,
}: {
  slug: string;
  projectId: string;
  completedCount: number;
  inProgressCount: number;
  upcomingCount: number;
  pendingCount: number;
  totalCount: number;
  progressPct: number;
}) {
  const pct = (n: number) =>
    totalCount > 0 ? Math.round((n / totalCount) * 100) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Milestone Progress
        </h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/milestones`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Segmented progress bar */}
      <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
        {completedCount > 0 && (
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${pct(completedCount)}%` }}
          />
        )}
        {inProgressCount > 0 && (
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${pct(inProgressCount)}%` }}
          />
        )}
        {upcomingCount > 0 && (
          <div
            className="bg-gray-300 transition-all duration-500"
            style={{ width: `${pct(upcomingCount)}%` }}
          />
        )}
        {pendingCount > 0 && (
          <div
            className="bg-amber-400 transition-all duration-500"
            style={{ width: `${pct(pendingCount)}%` }}
          />
        )}
      </div>

      <div className="mt-1 text-right text-xs text-gray-400">
        {progressPct}%
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        <StatusRow
          label="Completed"
          count={completedCount}
          pct={pct(completedCount)}
          color="bg-emerald-500"
        />
        <StatusRow
          label="In Progress"
          count={inProgressCount}
          pct={pct(inProgressCount)}
          color="bg-blue-500"
        />
        <StatusRow
          label="Upcoming"
          count={upcomingCount}
          pct={pct(upcomingCount)}
          color="bg-gray-300"
        />
        <StatusRow
          label="Pending"
          count={pendingCount}
          pct={pct(pendingCount)}
          color="bg-amber-400"
        />
      </div>
    </div>
  );
}
```

---

### Task 6: Create ClientInfoCard

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/components/ClientInfoCard.tsx`

**Interfaces:**
- Consumes: client data, slug, projectId
- Produces: Client info card with View Client Profile link

- [ ] **Step 1: Create ClientInfoCard.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/ClientInfoCard.tsx`:

```tsx
import Link from "next/link";
import { Mail, Phone, ArrowRight } from "lucide-react";

export function ClientInfoCard({
  slug,
  client,
  projectClientId,
}: {
  slug: string;
  client: {
    id: string;
    name: string;
    email: string | null;
    status: string;
    metadata: Record<string, unknown> | null;
  } | null;
  projectClientId: string | null;
}) {
  const clientId = client?.id ?? projectClientId;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Client Information</h3>

      {client ? (
        <>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {client.name}
              </p>
              {client.email && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Mail className="h-3 w-3" />
                  {client.email}
                </div>
              )}
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                client.status === "active"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
            </span>
          </div>

          {clientId && (
            <Link
              href={`/w/${slug}/clients/${clientId}`}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              View Client Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </>
      ) : (
        <div className="mt-4 text-center text-sm text-gray-400">
          No client assigned
        </div>
      )}
    </div>
  );
}
```

---

### Task 7: Create EscrowOverviewCard with Recharts donut

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/components/EscrowOverviewCard.tsx`

**Interfaces:**
- Consumes: escrow amounts, total budget, asset, slug
- Produces: Donut chart + legend + View Details link

- [ ] **Step 1: Create EscrowOverviewCard.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/EscrowOverviewCard.tsx`:

```tsx
"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = {
  funded: "#22c55e",
  released: "#3b82f6",
  pending: "#f97316",
  refunded: "#9ca3af",
};

function LegendItem({
  color,
  label,
  amount,
  asset,
}: {
  color: string;
  label: string;
  amount: number;
  asset: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full`} style={{ backgroundColor: color }} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-700">
        {amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} {asset}
      </span>
    </div>
  );
}

export function EscrowOverviewCard({
  fundedAmount,
  releasedAmount,
  pendingAmount,
  refundedAmount,
  totalBudget,
  asset,
  escrowFundedPct,
  slug,
}: {
  fundedAmount: number;
  releasedAmount: number;
  pendingAmount: number;
  refundedAmount: number;
  totalBudget: number;
  asset: string;
  escrowFundedPct: number;
  slug: string;
}) {
  const data = [
    { name: "Funded", value: fundedAmount },
    { name: "Released", value: releasedAmount },
    { name: "Pending", value: pendingAmount },
    { name: "Refunded", value: refundedAmount },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Escrow & Payment Overview
        </h3>
        <Link
          href={`/w/${slug}/projects/escrow`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View Details
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-6">
        {/* Donut chart */}
        <div className="relative h-40 w-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      COLORS[entry.name.toLowerCase() as keyof typeof COLORS]
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-gray-900">
              {totalBudget.toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
              {asset}
            </span>
            <span className="text-[10px] text-gray-400">Escrow Funded</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-2.5">
          <LegendItem
            color={COLORS.funded}
            label="Funded"
            amount={fundedAmount}
            asset={asset}
          />
          <LegendItem
            color={COLORS.released}
            label="Released"
            amount={releasedAmount}
            asset={asset}
          />
          <LegendItem
            color={COLORS.pending}
            label="Pending"
            amount={pendingAmount}
            asset={asset}
          />
          <LegendItem
            color={COLORS.refunded}
            label="Refunded"
            amount={refundedAmount}
            asset={asset}
          />
        </div>
      </div>
    </div>
  );
}
```

---

### Task 8: Create RecentActivityCard

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/components/RecentActivityCard.tsx`

**Interfaces:**
- Consumes: activity array, slug, projectId
- Produces: Activity timeline with icons, titles, timestamps

- [ ] **Step 1: Create RecentActivityCard.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/RecentActivityCard.tsx`:

```tsx
import Link from "next/link";
import {
  CheckCircle,
  ArrowUpCircle,
  FileText,
  FileSignature,
  Upload,
  MessageSquare,
} from "lucide-react";

function activityIcon(type: string) {
  switch (type) {
    case "milestone_completed":
      return { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" };
    case "payment_released":
      return { icon: ArrowUpCircle, color: "text-blue-500", bg: "bg-blue-50" };
    case "proposal_accepted":
      return { icon: FileText, color: "text-purple-500", bg: "bg-purple-50" };
    case "contract_signed":
      return { icon: FileSignature, color: "text-indigo-500", bg: "bg-indigo-50" };
    case "files_uploaded":
      return { icon: Upload, color: "text-amber-500", bg: "bg-amber-50" };
    case "client_commented":
      return { icon: MessageSquare, color: "text-pink-500", bg: "bg-pink-50" };
    default:
      return { icon: CheckCircle, color: "text-gray-400", bg: "bg-gray-50" };
  }
}

function activityTitle(type: string, payload: Record<string, unknown>) {
  switch (type) {
    case "milestone_completed":
      return `Milestone ${payload.milestone_title ?? ""} completed`;
    case "payment_released":
      return `Payment released`;
    case "proposal_accepted":
      return "Proposal accepted";
    case "contract_signed":
      return "Contract signed by both parties";
    case "files_uploaded":
      return `Client uploaded ${payload.file_count ?? ""} files`;
    case "client_commented":
      return "Client commented";
    default:
      return type.replace(/_/g, " ");
  }
}

function formatTimestamp(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecentActivityCard({
  slug,
  projectId,
  activity,
}: {
  slug: string;
  projectId: string;
  activity: Array<{
    id: string;
    type: string;
    payload: Record<string, unknown>;
    created_at: string;
    actor_id: string | null;
  }>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/activity`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {activity.length === 0 ? (
        <div className="mt-6 text-center text-sm text-gray-400">
          No recent activity
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {activity.slice(0, 5).map((item) => {
            const { icon: Icon, color, bg } = activityIcon(item.type);
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${bg}`}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activityTitle(item.type, item.payload)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimestamp(item.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

### Task 9: Create QuickActionsCard

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/components/QuickActionsCard.tsx`

**Interfaces:**
- Consumes: slug, projectId
- Produces: Vertical list of action buttons with chevron icons

- [ ] **Step 1: Create QuickActionsCard.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/QuickActionsCard.tsx`:

```tsx
import Link from "next/link";
import {
  Flag,
  Upload,
  FileText,
  CreditCard,
  StickyNote,
  Send,
  ChevronRight,
} from "lucide-react";

const ACTIONS = [
  { label: "Create Milestone", icon: Flag, href: "milestones" },
  { label: "Upload File", icon: Upload, href: "files" },
  { label: "Generate Invoice", icon: FileText, href: "payments" },
  { label: "Record Payment", icon: CreditCard, href: "payments" },
  { label: "Add Note", icon: StickyNote, href: "activity" },
  { label: "Send Update to Client", icon: Send, href: "activity" },
];

export function QuickActionsCard({
  slug,
  projectId,
}: {
  slug: string;
  projectId: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
      <div className="mt-3 flex flex-col gap-1">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={`/w/${slug}/projects/${projectId}/${action.href}`}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <action.icon className="h-4 w-4 text-gray-400" />
            <span className="flex-1">{action.label}</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

### Task 10: Create ProjectFilesCard

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/components/ProjectFilesCard.tsx`

**Interfaces:**
- Consumes: files array, slug, projectId
- Produces: Horizontal file cards with icons, names, sizes, dates

- [ ] **Step 1: Create ProjectFilesCard.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/ProjectFilesCard.tsx`:

```tsx
import Link from "next/link";
import { FileImage, FileText, File, Archive } from "lucide-react";

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["fig", "sketch", "psd", "ai", "xd"].includes(ext))
    return { icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" };
  if (["pdf"].includes(ext))
    return { icon: FileText, color: "text-red-500", bg: "bg-red-50" };
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
    return { icon: Archive, color: "text-amber-500", bg: "bg-amber-50" };
  if (["doc", "docx", "txt", "md"].includes(ext))
    return { icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
  return { icon: File, color: "text-gray-500", bg: "bg-gray-50" };
}

function fileTypeLabel(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    fig: "Figma File",
    pdf: "PDF Document",
    docx: "Word Document",
    doc: "Word Document",
    zip: "ZIP Archive",
    png: "PNG Image",
    jpg: "JPEG Image",
    jpeg: "JPEG Image",
  };
  return map[ext] ?? ext.toUpperCase();
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectFilesCard({
  slug,
  projectId,
  files,
}: {
  slug: string;
  projectId: string;
  files: Array<{
    id: string;
    name: string;
    size: number | null;
    created_at: string;
  }>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Project Files</h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/files`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {files.length === 0 ? (
        <div className="mt-6 text-center text-sm text-gray-400">
          No files uploaded
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {files.slice(0, 4).map((file) => {
            const { icon: Icon, color, bg } = fileIcon(file.name);
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}
                >
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {fileTypeLabel(file.name)}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{formatDate(file.created_at)}</span>
                    <span>·</span>
                    <span>{formatSize(file.size)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

### Task 11: Create UpcomingMilestonesCard

**Files:**
- Create: `app/(app)/w/[slug]/projects/[id]/overview/components/UpcomingMilestonesCard.tsx`

**Interfaces:**
- Consumes: milestones array, slug, projectId, asset
- Produces: List of upcoming milestones with budget, due date, status

- [ ] **Step 1: Create UpcomingMilestonesCard.tsx**

Create `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/UpcomingMilestonesCard.tsx`:

```tsx
import Link from "next/link";
import { Calendar, DollarSign } from "lucide-react";

function statusBadge(status: string) {
  switch (status) {
    case "draft":
      return "bg-gray-100 text-gray-600";
    case "funded":
      return "bg-emerald-50 text-emerald-600";
    case "in_review":
      return "bg-blue-50 text-blue-600";
    case "released":
      return "bg-emerald-50 text-emerald-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "draft":
      return "Upcoming";
    case "funded":
      return "Funded";
    case "in_review":
      return "In Review";
    case "released":
      return "Completed";
    default:
      return status;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UpcomingMilestonesCard({
  slug,
  projectId,
  milestones,
  asset,
}: {
  slug: string;
  projectId: string;
  milestones: Array<{
    id: string;
    title: string;
    amount: number;
    asset: string;
    status: string;
    due_date: string | null;
  }>;
  asset: string;
}) {
  const upcoming = milestones
    .filter((m) => m.status === "draft" || m.status === "funded")
    .slice(0, 3);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Upcoming Milestones
        </h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/milestones`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="mt-6 text-center text-sm text-gray-400">
          No upcoming milestones
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {upcoming.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {m.title}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {Number(m.amount).toLocaleString("en-US", {
                      maximumFractionDigits: 0,
                    })}{" "}
                    {m.asset || asset}
                  </span>
                  {m.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(m.due_date)}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(m.status)}`}
              >
                {statusLabel(m.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Task 12: Update existing project layout header to show breadcrumb and client portal

**Files:**
- Modify: `app/(app)/w/[slug]/projects/[id]/components/ProjectHeader.tsx`

**Interfaces:**
- Consumes: existing ProjectHeader props
- Produces: Updated header matching reference (breadcrumb, client portal button)

- [ ] **Step 1: Update ProjectHeader.tsx**

Replace the content of `frontend/app/(app)/w/[slug]/projects/[id]/components/ProjectHeader.tsx` with:

```tsx
import Link from "next/link";
import { Star, Share2, MoreHorizontal, Plus, ChevronRight, Globe } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    completed: "bg-blue-50 text-blue-600 border border-blue-200",
    draft: "bg-gray-100 text-gray-600 border border-gray-200",
    archived: "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return map[status] ?? map.draft;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    active: "In Progress",
    completed: "Completed",
    draft: "Draft",
    archived: "Archived",
  };
  return map[status] ?? status;
}

export function ProjectHeader({
  slug,
  projectId,
  title,
  status,
}: {
  slug: string;
  projectId: string;
  title: string;
  status: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link
            href={`/w/${slug}/projects`}
            className="transition hover:text-gray-700"
          >
            Projects
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-gray-700">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge(status)}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {statusLabel(status)}
          </span>
        </div>

        {/* Client info + dates + ID */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Client Name
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Dates
          </span>
          <span className="flex items-center gap-1">
            ID: {projectId.slice(0, 8)}...
            <button type="button" className="text-gray-400 hover:text-gray-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            </button>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Client Portal */}
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Globe className="h-4 w-4" />
          Client Portal
        </button>

        <button
          type="button"
          className="text-gray-300 transition hover:text-amber-400"
          aria-label="Favorite"
        >
          <Star className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        <div className="flex overflow-hidden rounded-lg border border-[#7c3aed]">
          <button
            type="button"
            className="flex h-9 items-center gap-1.5 bg-[#7c3aed] px-3 text-sm font-medium text-white hover:bg-[#6d28d9]"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
          <button
            type="button"
            className="flex h-9 w-8 items-center justify-center border-l border-[#6d28d9] bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 13: Verify full build

**Files:** None (verification only)

- [ ] **Step 1: Run full build**

```bash
cd frontend && pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run lint**

```bash
cd frontend && pnpm lint
```

Expected: No lint errors.

- [ ] **Step 3: Manual test — start dev server**

```bash
cd frontend && pnpm dev
```

Navigate to `http://localhost:3000/w/{workspace-slug}/projects/{projectId}/overview` and verify:
- Stats cards render with correct data
- Project overview card shows description, owner, metadata fields
- Milestone progress bar is segmented and accurate
- Client info card shows client data or "No client assigned"
- Escrow donut chart renders
- Activity timeline shows recent items
- Quick actions list renders with links
- File cards display correctly
- Upcoming milestones list renders
- Empty states work when data is missing

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: build project overview page with stats, milestones, escrow, activity, files"
```
