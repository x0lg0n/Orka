# Project Proposal Details Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a unified Project Proposal Details page at `/w/[workspaceSlug]/projects/[id]/proposal` that displays all proposal information on a single screen with no subtabs.

**Architecture:** Server component page fetches proposal data from Supabase (project_proposals, proposal_sections, proposal_pricing, proposal_notes, proposal_activity) and passes it to a client view component. The client view renders a two-column layout (75% content / 25% sidebar) matching the existing timeline/activity page pattern.

**Tech Stack:** Next.js 16 (App Router), Supabase, TypeScript, Tailwind CSS v4, Lucide icons, Framer Motion

## Global Constraints

- Light theme: white cards, `bg-gray-50` background
- Primary accent: `#7c3aed` (purple)
- Card radius: `rounded-xl` (12px)
- Card padding: `p-4` or `p-5`
- Grid gap: `gap-4`
- Max width: `max-w-7xl`
- Shadows: `shadow-sm`
- Icons: Lucide
- No inline styles
- Fully responsive
- Zero scroll: content scrolls within cards, page does not scroll

## File Structure

```
frontend/
├── supabase/
│   └── project_proposals.sql                          [CREATE] Migration SQL
├── app/(app)/w/[slug]/projects/[id]/
│   └── proposal/
│       ├── page.tsx                                    [REPLACE] Server page
│       └── components/
│           ├── types.ts                                [CREATE] Proposal types
│           ├── ProposalDetailView.tsx                   [CREATE] Main client view
│           ├── ProposalOverviewCard.tsx                 [CREATE] Overview + summary card
│           ├── ProposalContentCard.tsx                  [CREATE] Content with left nav + pricing
│           ├── ProposalLatestCard.tsx                   [CREATE] Latest version card
│           ├── ProposalStatusCard.tsx                   [CREATE] Status timeline sidebar
│           ├── ProposalActionsCard.tsx                  [CREATE] Actions sidebar
│           ├── ClientContactCard.tsx                    [CREATE] Client info sidebar
│           ├── ProposalNotesCard.tsx                    [CREATE] Notes sidebar
│           ├── ProposalEmptyState.tsx                   [CREATE] Empty state
│           └── ProposalSkeleton.tsx                     [CREATE] Loading skeleton
```

---

### Task 1: Migration SQL — Create proposal tables

**Files:**
- Create: `frontend/supabase/project_proposals.sql`

**Interfaces:**
- Produces: 5 new tables with RLS policies

- [ ] **Step 1: Write the migration SQL**

```sql
-- frontend/supabase/project_proposals.sql
-- Run this in Supabase SQL Editor to create the proposal tables.

-- Main proposal record
create table if not exists public.project_proposals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null default 'Proposal',
  amount numeric(38,7) not null default 0,
  currency text not null default 'XLM',
  usd_equivalent numeric(38,7),
  summary text,
  content text,
  status text not null default 'draft'
    check (status in ('draft','sent','viewed','accepted','rejected','expired','archived')),
  valid_until timestamptz,
  accepted_at timestamptz,
  payment_terms text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.project_proposals enable row level security;
drop policy if exists "project_proposals_org" on public.project_proposals;
create policy "project_proposals_org" on public.project_proposals
  for all using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));
create trigger project_proposals_touch before update on public.project_proposals
  execute function public.touch_updated_at();

-- Proposal sections (ordered body content)
create table if not exists public.proposal_sections (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  title text not null,
  content text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.proposal_sections enable row level security;
drop policy if exists "proposal_sections_org" on public.proposal_sections;
create policy "proposal_sections_org" on public.proposal_sections
  for all using (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  ) with check (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  );

-- Proposal pricing line items
create table if not exists public.proposal_pricing (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  label text not null,
  amount numeric(38,7) not null default 0,
  currency text not null default 'XLM',
  category text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.proposal_pricing enable row level security;
drop policy if exists "proposal_pricing_org" on public.proposal_pricing;
create policy "proposal_pricing_org" on public.proposal_pricing
  for all using (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  ) with check (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  );

-- Proposal internal notes
create table if not exists public.proposal_notes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  content text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.proposal_notes enable row level security;
drop policy if exists "proposal_notes_org" on public.proposal_notes;
create policy "proposal_notes_org" on public.proposal_notes
  for all using (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  ) with check (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  );

-- Proposal activity log
create table if not exists public.proposal_activity (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  type text not null,
  payload jsonb default '{}'::jsonb,
  actor_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.proposal_activity enable row level security;
drop policy if exists "proposal_activity_org" on public.proposal_activity;
create policy "proposal_activity_org" on public.proposal_activity
  for all using (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  ) with check (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  );
```

- [ ] **Step 2: Verify SQL syntax**

Run: Check that the SQL is valid (no syntax errors).

- [ ] **Step 3: Commit**

```bash
git add frontend/supabase/project_proposals.sql
git commit -m "feat: add project_proposals migration SQL"
```

---

### Task 2: TypeScript types

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/types.ts`

**Interfaces:**
- Produces: All types used by page and components

- [ ] **Step 1: Create the types file**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/types.ts

export type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "archived";

export type ProposalRow = {
  id: string;
  org_id: string;
  project_id: string;
  title: string;
  amount: number;
  currency: string;
  usd_equivalent: number | null;
  summary: string | null;
  content: string | null;
  status: ProposalStatus;
  valid_until: string | null;
  accepted_at: string | null;
  payment_terms: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProposalSection = {
  id: string;
  proposal_id: string;
  title: string;
  content: string | null;
  position: number;
  created_at: string;
};

export type ProposalPricingItem = {
  id: string;
  proposal_id: string;
  label: string;
  amount: number;
  currency: string;
  category: string | null;
  position: number;
  created_at: string;
};

export type ProposalNote = {
  id: string;
  proposal_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
};

export type ProposalActivityItem = {
  id: string;
  proposal_id: string;
  type: string;
  payload: Record<string, unknown>;
  actor_id: string | null;
  created_at: string;
};

export type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  client_id: string | null;
  client_name: string | null;
  client_email: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
};

export type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  avatar_url: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
} | null;

export type OwnerRow = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

export const PROPOSAL_STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; badge: string; dot: string }
> = {
  draft: {
    label: "Draft",
    badge: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
  },
  sent: {
    label: "Sent",
    badge: "bg-blue-50 text-blue-600 border border-blue-200",
    dot: "bg-blue-500",
  },
  viewed: {
    label: "Viewed",
    badge: "bg-amber-50 text-amber-600 border border-amber-200",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Accepted",
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-50 text-red-600 border border-red-200",
    dot: "bg-red-500",
  },
  expired: {
    label: "Expired",
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
  },
  archived: {
    label: "Archived",
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
  },
};

export const PROPOSAL_SECTIONS = [
  "Project Overview",
  "Objectives",
  "Scope of Work",
  "Deliverables",
  "Timeline",
  "Pricing",
  "Payment Terms",
  "Terms & Conditions",
  "Next Steps",
] as const;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/types.ts
git commit -m "feat: add proposal TypeScript types"
```

---

### Task 3: Server page — Fetch proposal data

**Files:**
- Replace: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/page.tsx`

**Interfaces:**
- Produces: Server component that fetches all proposal data and renders `<ProposalDetailView />`

- [ ] **Step 1: Write the server page**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/page.tsx

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProposalDetailView } from "./components/ProposalDetailView";

export default async function ProjectProposalPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", org.id)
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: proposal } = await supabase
    .from("project_proposals")
    .select("*")
    .eq("org_id", org.id)
    .eq("project_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!proposal) {
    return (
      <ProposalDetailView
        slug={slug}
        projectId={id}
        project={project}
        proposal={null}
        sections={[]}
        pricing={[]}
        notes={[]}
        activity={[]}
        client={null}
      />
    );
  }

  const { data: sections } = await supabase
    .from("proposal_sections")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("position", { ascending: true });

  const { data: pricing } = await supabase
    .from("proposal_pricing")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("position", { ascending: true });

  const { data: notes } = await supabase
    .from("proposal_notes")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("created_at", { ascending: false });

  const { data: activity } = await supabase
    .from("proposal_activity")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("created_at", { ascending: false });

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

  return (
    <ProposalDetailView
      slug={slug}
      projectId={id}
      project={project}
      proposal={proposal}
      sections={sections ?? []}
      pricing={pricing ?? []}
      notes={notes ?? []}
      activity={activity ?? []}
      client={client}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/page.tsx
git commit -m "feat: add proposal server page with data fetching"
```

---

### Task 4: Empty state and skeleton components

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalEmptyState.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalSkeleton.tsx`

**Interfaces:**
- Consumes: None
- Produces: `<ProposalEmptyState />`, `<ProposalSkeleton />`

- [ ] **Step 1: Create ProposalEmptyState**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalEmptyState.tsx

"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";

export function ProposalEmptyState({
  slug,
  projectId,
}: {
  slug: string;
  projectId: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-50">
        <FileText className="h-10 w-10 text-[#7c3aed]" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-gray-900">
        No proposal has been created yet
      </h3>
      <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
        Create a proposal to send to your client for this project.
      </p>
      <Link
        href={`/w/${slug}/projects/${projectId}/proposal/new`}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
      >
        <Plus className="h-4 w-4" />
        Create Proposal
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Create ProposalSkeleton**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalSkeleton.tsx

"use client";

export function ProposalSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Overview card skeleton */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-3 w-24 rounded bg-gray-100" />
                      <div className="h-3 w-32 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-100" />
                      <div className="h-3 flex-1 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Content card skeleton */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex gap-6">
              <div className="w-40 space-y-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-3 w-full rounded bg-gray-100" />
                ))}
              </div>
              <div className="flex-1 space-y-4">
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-3 w-full rounded bg-gray-100" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="h-4 w-28 rounded bg-gray-200 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-3 w-full rounded bg-gray-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/ProposalEmptyState.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/ProposalSkeleton.tsx
git commit -m "feat: add proposal empty state and skeleton components"
```

---

### Task 5: ProposalOverviewCard — Overview + Summary

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalOverviewCard.tsx`

**Interfaces:**
- Consumes: `ProposalRow`, `ProjectRow`, `ClientRow`, `ProposalStatus` from types
- Produces: `<ProposalOverviewCard />`

- [ ] **Step 1: Create ProposalOverviewCard**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalOverviewCard.tsx

"use client";

import { Check, Edit } from "lucide-react";
import { PROPOSAL_STATUS_CONFIG, type ProposalRow, type ProjectRow, type ClientRow } from "./types";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency: string): string {
  return `${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${currency}`;
}

function getDaysRemaining(validUntil: string | null): number | null {
  if (!validUntil) return null;
  const now = new Date();
  const expiry = new Date(validUntil);
  const diffMs = expiry.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function ProposalOverviewCard({
  proposal,
  project,
  client,
}: {
  proposal: ProposalRow;
  project: ProjectRow;
  client: ClientRow;
}) {
  const statusConfig = PROPOSAL_STATUS_CONFIG[proposal.status];
  const daysRemaining = getDaysRemaining(proposal.valid_until);
  const summaryItems = proposal.summary
    ? proposal.summary.split("\n").filter((s) => s.trim())
    : [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Proposal Overview */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Proposal Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Client</span>
              <span className="font-medium text-gray-900">
                {client?.name ?? project.client_name ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Project</span>
              <span className="font-medium text-gray-900">{project.title}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Proposal Amount</span>
              <span className="font-medium text-gray-900">
                {formatCurrency(proposal.amount, proposal.currency)}
                {proposal.usd_equivalent != null && (
                  <span className="ml-1 text-gray-400">
                    ≈ ${Number(proposal.usd_equivalent).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Valid Until</span>
              <span className="font-medium text-gray-900">
                {formatDate(proposal.valid_until)}
                {daysRemaining != null && (
                  <span className="ml-1 text-gray-400">
                    ({daysRemaining} days)
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
            </div>
            {proposal.accepted_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Accepted Date</span>
                <span className="font-medium text-gray-900">
                  {formatDate(proposal.accepted_at)}
                </span>
              </div>
            )}
            {proposal.payment_terms && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Payment Terms</span>
                <span className="max-w-[200px] text-right font-medium text-gray-900">
                  {proposal.payment_terms}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Edit className="h-4 w-4" />
            Edit Proposal
          </button>
        </div>

        {/* Right: Proposal Summary */}
        <div>
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Proposal Summary
          </h3>
          {summaryItems.length > 0 ? (
            <ul className="space-y-2.5">
              {summaryItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{item.trim()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No summary provided.</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/ProposalOverviewCard.tsx
git commit -m "feat: add ProposalOverviewCard component"
```

---

### Task 6: ProposalContentCard — Content with left nav + pricing

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalContentCard.tsx`

**Interfaces:**
- Consumes: `ProposalRow`, `ProposalSection[]`, `ProposalPricingItem[]` from types
- Produces: `<ProposalContentCard />`

- [ ] **Step 1: Create ProposalContentCard**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalContentCard.tsx

"use client";

import { useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { PROPOSAL_SECTIONS, type ProposalRow, type ProposalSection, type ProposalPricingItem } from "./types";

function formatCurrency(amount: number, currency: string): string {
  return `${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${currency}`;
}

export function ProposalContentCard({
  proposal,
  sections,
  pricing,
}: {
  proposal: ProposalRow;
  sections: ProposalSection[];
  pricing: ProposalPricingItem[];
}) {
  const [activeSection, setActiveSection] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const subtotal = pricing.reduce((sum, p) => sum + Number(p.amount), 0);
  const tax = 0;
  const total = subtotal + tax;

  const handleSectionClick = (index: number) => {
    setActiveSection(index);
    const sectionId = `proposal-section-${index}`;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Proposal Content
        </h3>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Maximize2 className="h-4 w-4" />
          Expand
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left navigation */}
        <nav className="w-40 shrink-0 space-y-1">
          {PROPOSAL_SECTIONS.map((section, i) => (
            <button
              key={section}
              type="button"
              onClick={() => handleSectionClick(i)}
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition ${
                activeSection === i
                  ? "bg-purple-50 font-medium text-[#7c3aed]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              {i + 1}. {section}
            </button>
          ))}
        </nav>

        {/* Content body + pricing sidebar */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-6">
            {/* Main content */}
            <div ref={contentRef} className="flex-1 min-w-0 space-y-6">
              {sections.length > 0 ? (
                sections.map((section, i) => (
                  <div key={section.id} id={`proposal-section-${i}`}>
                    <h4 className="mb-2 text-base font-semibold text-gray-900">
                      {i + 1}. {section.title}
                    </h4>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      {section.content?.split("\n").map((para, j) => (
                        <p key={j} className="mb-2">{para}</p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-6">
                  {PROPOSAL_SECTIONS.map((title, i) => (
                    <div key={title} id={`proposal-section-${i}`}>
                      <h4 className="mb-2 text-base font-semibold text-gray-900">
                        {i + 1}. {title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        No content added for this section.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing summary */}
            <div className="w-52 shrink-0">
              <h4 className="mb-3 text-sm font-semibold text-gray-900">
                Pricing Summary
              </h4>
              <div className="space-y-2">
                {pricing.length > 0 ? (
                  pricing.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-medium text-gray-900 tabular-nums">
                        {formatCurrency(item.amount, item.currency)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No pricing items.</p>
                )}
              </div>
              <div className="mt-4 border-t border-gray-100 pt-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {formatCurrency(subtotal, proposal.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tax (0%)</span>
                  <span className="font-medium text-gray-900 tabular-nums">
                    {formatCurrency(tax, proposal.currency)}
                  </span>
                </div>
              </div>
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="text-xs text-gray-500">Total Proposal Amount</div>
                <div className="text-xl font-bold text-gray-900 tabular-nums">
                  {formatCurrency(total, proposal.currency)}
                </div>
                {proposal.usd_equivalent != null && (
                  <div className="text-sm text-gray-400">
                    ≈ ${Number(proposal.usd_equivalent).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/ProposalContentCard.tsx
git commit -m "feat: add ProposalContentCard with left nav and pricing"
```

---

### Task 7: ProposalLatestCard — Latest version

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalLatestCard.tsx`

**Interfaces:**
- Consumes: `ProposalRow`, `OwnerRow` from types
- Produces: `<ProposalLatestCard />`

- [ ] **Step 1: Create ProposalLatestCard**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalLatestCard.tsx

"use client";

import { FileText, Eye, MoreHorizontal } from "lucide-react";
import { PROPOSAL_STATUS_CONFIG, type ProposalRow, type OwnerRow } from "./types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number, currency: string): string {
  return `${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${currency}`;
}

export function ProposalLatestCard({
  proposal,
  owner,
}: {
  proposal: ProposalRow;
  owner: OwnerRow;
}) {
  const statusConfig = PROPOSAL_STATUS_CONFIG[proposal.status];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Latest Version
      </h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
            <FileText className="h-5 w-5 text-[#7c3aed]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">
                {proposal.title}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.badge}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
                {statusConfig.label}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              by {owner?.full_name ?? "Unknown"} on {formatDate(proposal.created_at)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {formatCurrency(proposal.amount, proposal.currency)}
          </span>
          {proposal.usd_equivalent != null && (
            <span className="text-xs text-gray-400">
              ≈ ${Number(proposal.usd_equivalent).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          )}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" />
            Preview PDF
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/ProposalLatestCard.tsx
git commit -m "feat: add ProposalLatestCard component"
```

---

### Task 8: Sidebar cards — Status, Actions, Client, Notes

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalStatusCard.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalActionsCard.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ClientContactCard.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalNotesCard.tsx`

**Interfaces:**
- Consumes: `ProposalRow`, `ProposalActivityItem[]`, `ProposalNote[]`, `ClientRow` from types
- Produces: 4 sidebar card components

- [ ] **Step 1: Create ProposalStatusCard**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalStatusCard.tsx

"use client";

import { Check } from "lucide-react";
import { type ProposalRow, type ProposalActivityItem, PROPOSAL_STATUS_CONFIG } from "./types";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TIMELINE_STEPS = [
  { key: "draft", label: "Draft Created" },
  { key: "sent", label: "Sent to Client" },
  { key: "viewed", label: "Viewed by Client" },
  { key: "accepted", label: "Accepted" },
] as const;

export function ProposalStatusCard({
  proposal,
  activity,
}: {
  proposal: ProposalRow;
  activity: ProposalActivityItem[];
}) {
  const statusOrder = ["draft", "sent", "viewed", "accepted"];
  const currentIndex = statusOrder.indexOf(proposal.status);

  const getDateForStatus = (status: string): string | null => {
    const item = activity.find((a) => a.type === `proposal_${status}`);
    if (item) return formatDate(item.created_at);
    if (status === proposal.status) return formatDate(proposal.updated_at);
    return null;
  };

  const isRejected = proposal.status === "rejected";
  const isExpired = proposal.status === "expired";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Proposal Status
      </h3>
      <div className="space-y-0">
        {TIMELINE_STEPS.map((step, i) => {
          const date = getDateForStatus(step.key);
          const isCompleted = i <= currentIndex && !isRejected;
          const isCurrent = i === currentIndex;

          return (
            <div key={step.key} className="flex gap-3">
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    isCompleted
                      ? "bg-emerald-500"
                      : "bg-gray-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5 text-white" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                  )}
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`w-0.5 flex-1 ${
                      i < currentIndex ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
              {/* Label + date */}
              <div className="pb-4">
                <div
                  className={`text-sm font-medium ${
                    isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </div>
                {date && (
                  <div className="text-xs text-gray-400">{date}</div>
                )}
              </div>
            </div>
          );
        })}

        {/* Rejected state */}
        {isRejected && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                <span className="text-xs font-bold text-white">✕</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-red-600">Rejected</div>
              <div className="text-xs text-gray-400">
                {formatDate(proposal.updated_at)}
              </div>
            </div>
          </div>
        )}

        {/* Expired state */}
        {isExpired && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400">
                <span className="text-xs font-bold text-white">—</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Expired</div>
              <div className="text-xs text-gray-400">
                {formatDate(proposal.updated_at)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ProposalActionsCard**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalActionsCard.tsx

"use client";

import {
  Download,
  Copy,
  FileText,
  ArrowRightLeft,
  Ban,
} from "lucide-react";

const actions = [
  {
    label: "Download PDF",
    icon: Download,
    color: "text-gray-600",
    hover: "hover:bg-gray-50",
  },
  {
    label: "Duplicate Proposal",
    icon: Copy,
    color: "text-gray-600",
    hover: "hover:bg-gray-50",
  },
  {
    label: "Create Invoice",
    icon: FileText,
    color: "text-gray-600",
    hover: "hover:bg-gray-50",
  },
  {
    label: "Convert to Contract",
    icon: ArrowRightLeft,
    color: "text-gray-600",
    hover: "hover:bg-gray-50",
  },
  {
    label: "Withdraw Proposal",
    icon: Ban,
    color: "text-red-500",
    hover: "hover:bg-red-50",
  },
];

export function ProposalActionsCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Proposal Actions
      </h3>
      <div className="space-y-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${action.color} ${action.hover}`}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ClientContactCard**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ClientContactCard.tsx

"use client";

import { Mail, Phone, Send } from "lucide-react";
import type { ClientRow } from "./types";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ClientContactCard({ client }: { client: ClientRow }) {
  if (!client) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Client Contact
        </h3>
        <p className="text-sm text-gray-400">No client assigned.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Client Contact
      </h3>
      <div className="flex items-center gap-3 mb-4">
        {client.avatar_url ? (
          <img
            src={client.avatar_url}
            alt={client.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-sm font-medium text-[#7c3aed]">
            {getInitials(client.name)}
          </div>
        )}
        <div>
          <div className="text-sm font-medium text-gray-900">
            {client.name}
          </div>
          {client.company && (
            <div className="text-xs text-gray-500">{client.company}</div>
          )}
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {client.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4 text-gray-400" />
            {client.email}
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            {client.phone}
          </div>
        )}
      </div>
      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      >
        <Send className="h-4 w-4" />
        Send Message
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create ProposalNotesCard**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalNotesCard.tsx

"use client";

import { StickyNote, Plus } from "lucide-react";
import type { ProposalNote } from "./types";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ProposalNotesCard({ notes }: { notes: ProposalNote[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Proposal Notes
      </h3>
      {notes.length > 0 ? (
        <div className="space-y-3 mb-4">
          {notes.slice(0, 5).map((note) => (
            <div
              key={note.id}
              className="rounded-lg bg-gray-50 p-3"
            >
              <p className="text-sm text-gray-600">{note.content}</p>
              <div className="mt-1 text-xs text-gray-400">
                {formatRelativeTime(note.created_at)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex flex-col items-center py-4 text-center">
            <StickyNote className="h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-400">No notes added yet.</p>
          </div>
        </div>
      )}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" />
        Add Note
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Commit all sidebar cards**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/ProposalStatusCard.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/ProposalActionsCard.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/ClientContactCard.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/ProposalNotesCard.tsx
git commit -m "feat: add sidebar card components (status, actions, client, notes)"
```

---

### Task 9: ProposalDetailView — Main client view

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalDetailView.tsx`

**Interfaces:**
- Consumes: All types from `types.ts`, all card components
- Produces: `<ProposalDetailView />` — the main page view

- [ ] **Step 1: Create ProposalDetailView**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalDetailView.tsx

"use client";

import { ProposalOverviewCard } from "./ProposalOverviewCard";
import { ProposalContentCard } from "./ProposalContentCard";
import { ProposalLatestCard } from "./ProposalLatestCard";
import { ProposalStatusCard } from "./ProposalStatusCard";
import { ProposalActionsCard } from "./ProposalActionsCard";
import { ClientContactCard } from "./ClientContactCard";
import { ProposalNotesCard } from "./ProposalNotesCard";
import { ProposalEmptyState } from "./ProposalEmptyState";
import type {
  ProposalRow,
  ProposalSection,
  ProposalPricingItem,
  ProposalNote,
  ProposalActivityItem,
  ProjectRow,
  ClientRow,
} from "./types";

export function ProposalDetailView({
  slug,
  projectId,
  project,
  proposal,
  sections,
  pricing,
  notes,
  activity,
  client,
}: {
  slug: string;
  projectId: string;
  project: ProjectRow;
  proposal: ProposalRow | null;
  sections: ProposalSection[];
  pricing: ProposalPricingItem[];
  notes: ProposalNote[];
  activity: ProposalActivityItem[];
  client: ClientRow;
}) {
  if (!proposal) {
    return <ProposalEmptyState slug={slug} projectId={projectId} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main column (75%) */}
        <div className="lg:col-span-2 space-y-4">
          <ProposalOverviewCard
            proposal={proposal}
            project={project}
            client={client}
          />
          <ProposalContentCard
            proposal={proposal}
            sections={sections}
            pricing={pricing}
          />
          <ProposalLatestCard proposal={proposal} owner={null} />
        </div>

        {/* Sidebar (25%) */}
        <div className="flex flex-col gap-4">
          <ProposalStatusCard proposal={proposal} activity={activity} />
          <ProposalActionsCard />
          <ClientContactCard client={client} />
          <ProposalNotesCard notes={notes} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposal/components/ProposalDetailView.tsx
git commit -m "feat: add ProposalDetailView main client component"
```

---

### Task 10: Final verification

- [ ] **Step 1: Run lint check**

Run: `npm run lint` in `frontend/`
Expected: No errors

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit` in `frontend/`
Expected: No type errors

- [ ] **Step 3: Verify route works**

Navigate to: `http://localhost:3000/w/[workspaceSlug]/projects/[id]/proposal`
Expected: Page renders with empty state or proposal data

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete project proposal details page"
```
