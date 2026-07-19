# Project Activity Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Activity tab for the Project Details module with a two-column layout showing a grouped activity feed and sidebar summary cards.

**Architecture:** Server component fetches data from existing `activity`, `milestones`, `files`, `contracts`, `comments` tables + new `notes` table. Client view composes a two-column grid (70/30) with grouped timeline, filters, search, and sidebar cards. Follows the exact pattern of the Timeline page.

**Tech Stack:** Next.js App Router, Supabase SSR, TailwindCSS v4, Lucide icons, `"use client"` composition pattern.

## Global Constraints

- TailwindCSS only, no inline styles
- Primary color: `#7c3aed`
- Card style: `rounded-xl border border-gray-200 bg-white p-4 shadow-sm`
- Spacing: `px-6 py-6` for page, `gap-4` for grid
- Buttons: `rounded-lg` (12px)
- Icons: Lucide only
- Server components for data fetching, `"use client"` for interactivity
- Params: `Promise<{ slug: string; id: string }>` with `await params`
- Org scoping: every query uses `getActiveOrgBySlug` then `.eq("org_id", org.id)`
- Relative imports for co-located components: `./components/...`
- Shared imports: `@/lib/...`

---

## File Map

```
frontend/supabase/
├── notes.sql                                    # NEW - notes table migration

frontend/app/(app)/w/[slug]/projects/[id]/activity/
├── page.tsx                                     # NEW - server component
└── components/
    ├── ProjectActivityView.tsx                   # NEW - client composition root
    ├── ActivityFeed.tsx                          # NEW - left column grouped timeline
    ├── ActivityCard.tsx                          # NEW - individual activity item
    ├── ActivityFilters.tsx                       # NEW - search + filter + date range
    ├── ActivitySummaryCard.tsx                   # NEW - stats sidebar card
    ├── TopContributorsCard.tsx                   # NEW - contributors sidebar card
    ├── TimelineFilterCard.tsx                    # NEW - mini calendar sidebar card
    ├── RecentNotesCard.tsx                       # NEW - recent notes sidebar card
    ├── ActivitySkeleton.tsx                      # NEW - loading skeleton
    └── ActivityEmptyState.tsx                    # NEW - empty state
```

---

### Task 1: Notes Migration + Activity Types

**Files:**
- Create: `frontend/supabase/notes.sql`

**Interfaces:**
- Produces: `notes` table accessible via Supabase

- [ ] **Step 1: Create the notes table migration**

```sql
-- frontend/supabase/notes.sql
-- Run this in Supabase SQL Editor to create the notes table

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- RLS policies
alter table public.notes enable row level security;

create policy "Org members can view notes"
  on public.notes for select
  using (public.auth_is_org_member(org_id));

create policy "Org members can insert notes"
  on public.notes for insert
  with check (public.auth_is_org_member(org_id));

create policy "Org members can update notes"
  on public.notes for update
  using (public.auth_is_org_member(org_id));

create policy "Org owners can delete notes"
  on public.notes for delete
  using (public.auth_is_org_owner(org_id));

-- Index for project-scoped queries
create index if not exists idx_notes_project_id on public.notes(project_id);
create index if not exists idx_notes_org_id on public.notes(org_id);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/supabase/notes.sql
git commit -m "feat: add notes table migration for activity page"
```

---

### Task 2: Activity Types + Data Transformation

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/types.ts`

**Interfaces:**
- Produces: `ActivityItem` type, `generateActivityItems()` function used by page.tsx and ProjectActivityView.tsx

- [ ] **Step 1: Create the types and transformation logic**

```typescript
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/types.ts

export type ActivityCategory =
  | "milestone"
  | "payment"
  | "proposal"
  | "contract"
  | "escrow"
  | "file"
  | "comment"
  | "note"
  | "ai"
  | "client"
  | "system";

export type ActivityItem = {
  id: string;
  projectId: string;
  type: string;
  title: string;
  description: string;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
  time: string;
  category: ActivityCategory;
  badge: string;
};

export type ActivityGroup = {
  date: string;
  label: string;
  items: ActivityItem[];
};

type MilestoneRow = {
  id: string;
  title: string | null;
  description: string | null;
  amount: number;
  asset: string;
  status: string;
  created_at: string;
};

type FileRow = {
  id: string;
  name: string;
  size: number | null;
  created_at: string;
  uploaded_by: string | null;
};

type ContractRow = {
  id: string;
  title: string | null;
  status: string;
  created_at: string;
};

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  author_id: string | null;
};

type ActivityRow = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
  actor_id: string | null;
};

type NoteRow = {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) return "Today";
  if (itemDate.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getActorName(
  actorId: string | null,
  profiles: ProfileRow[]
): string | null {
  if (!actorId) return null;
  return profiles.find((p) => p.id === actorId)?.full_name ?? null;
}

export function generateActivityItems(
  projectId: string,
  milestones: MilestoneRow[],
  files: FileRow[],
  contracts: ContractRow[],
  comments: CommentRow[],
  activity: ActivityRow[],
  notes: NoteRow[],
  profiles: ProfileRow[]
): ActivityGroup[] {
  const items: ActivityItem[] = [];

  for (const m of milestones) {
    const isCompleted = m.status === "released" || m.status === "approved";
    items.push({
      id: `milestone-${m.id}`,
      projectId,
      type: "milestone",
      title: `"${m.title ?? "Untitled Milestone"}" ${isCompleted ? "marked as completed" : "updated"}`,
      description: `${Number(m.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${m.asset}`,
      createdBy: null,
      createdByName: null,
      createdAt: m.created_at,
      time: formatTime(m.created_at),
      category: "milestone",
      badge: "Milestones",
    });
  }

  for (const f of files) {
    items.push({
      id: `file-${f.id}`,
      projectId,
      type: "file",
      title: `"${f.name}" uploaded`,
      description: f.size
        ? `${(f.size / 1024).toFixed(1)} KB`
        : "File uploaded",
      createdBy: f.uploaded_by,
      createdByName: getActorName(f.uploaded_by, profiles),
      createdAt: f.created_at,
      time: formatTime(f.created_at),
      category: "file",
      badge: "Files",
    });
  }

  for (const c of contracts) {
    items.push({
      id: `contract-${c.id}`,
      projectId,
      type: "contract",
      title:
        c.status === "signed"
          ? "Contract signed"
          : `Contract "${c.title ?? "Untitled"}" ${c.status}`,
      description:
        c.status === "signed"
          ? "Both parties completed signing."
          : `Contract status: ${c.status}`,
      createdBy: null,
      createdByName: null,
      createdAt: c.created_at,
      time: formatTime(c.created_at),
      category: "contract",
      badge: "Contracts",
    });
  }

  for (const act of activity) {
    const type = act.type;
    let category: ActivityCategory = "system";
    let title = "Activity recorded";
    let description =
      typeof act.payload?.description === "string"
        ? act.payload.description
        : "Event recorded.";
    let badge = "System";

    if (type === "comment" || type === "client_commented") {
      category = "comment";
      title = "Client commented";
      badge = "Comments";
    } else if (type === "feedback") {
      category = "client";
      title = "Client feedback";
      badge = "Client";
    } else if (type === "milestone_completed") {
      category = "milestone";
      title = "Milestone completed";
      badge = "Milestones";
    } else if (type === "payment_released") {
      category = "payment";
      title = "Payment released";
      badge = "Payments";
    } else if (type === "proposal_accepted" || type === "proposal_sent") {
      category = "proposal";
      title = "Proposal updated";
      badge = "Proposal";
    } else if (type === "contract_signed") {
      category = "contract";
      title = "Contract signed";
      badge = "Contracts";
    } else if (type === "escrow_funded") {
      category = "escrow";
      title = "Escrow funded";
      badge = "Escrow";
    } else if (type === "files_uploaded") {
      category = "file";
      title = "Files uploaded";
      badge = "Files";
    } else if (type.startsWith("ai_")) {
      category = "ai";
      title = type.replace("ai_", "").replace(/_/g, " ");
      title = title.charAt(0).toUpperCase() + title.slice(1);
      badge = "AI";
    } else if (type.startsWith("client_")) {
      category = "client";
      title = type.replace("client_", "").replace(/_/g, " ");
      title = title.charAt(0).toUpperCase() + title.slice(1);
      badge = "Client";
    }

    items.push({
      id: `activity-${act.id}`,
      projectId,
      type: act.type,
      title,
      description,
      createdBy: act.actor_id,
      createdByName: getActorName(act.actor_id, profiles),
      createdAt: act.created_at,
      time: formatTime(act.created_at),
      category,
      badge,
    });
  }

  for (const n of notes) {
    items.push({
      id: `note-${n.id}`,
      projectId,
      type: "note",
      title: "Internal Note added",
      description: n.title,
      createdBy: n.created_by,
      createdByName: getActorName(n.created_by, profiles),
      createdAt: n.created_at,
      time: formatTime(n.created_at),
      category: "note",
      badge: "Notes",
    });
  }

  for (const c of comments) {
    items.push({
      id: `comment-${c.id}`,
      projectId,
      type: "comment",
      title: "Comment added",
      description:
        c.content.length > 120 ? c.content.slice(0, 120) + "..." : c.content,
      createdBy: c.author_id,
      createdByName: getActorName(c.author_id, profiles),
      createdAt: c.created_at,
      time: formatTime(c.created_at),
      category: "comment",
      badge: "Comments",
    });
  }

  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const grouped = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const key = toDateKey(item.createdAt);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  const groups: ActivityGroup[] = [];
  for (const [dateKey, groupItems] of grouped) {
    groups.push({
      date: dateKey,
      label: formatDateLabel(groupItems[0].createdAt),
      items: groupItems,
    });
  }

  return groups;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/types.ts
git commit -m "feat: add activity types and data transformation logic"
```

---

### Task 3: ActivityCard Component

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivityCard.tsx`

**Interfaces:**
- Consumes: `ActivityItem` from types.ts
- Produces: Rendered activity card used by ActivityFeed.tsx

- [ ] **Step 1: Create the ActivityCard component**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivityCard.tsx

import {
  Flag,
  DollarSign,
  FileText,
  FileSignature,
  Lock,
  Upload,
  MessageSquare,
  StickyNote,
  Sparkles,
  User,
  Bot,
} from "lucide-react";
import type { ActivityItem } from "./types";

function ActivityIcon({ category }: { category: string }) {
  const iconClass = "h-4 w-4";
  switch (category) {
    case "milestone":
      return <Flag className={`${iconClass} text-emerald-500`} />;
    case "payment":
      return <DollarSign className={`${iconClass} text-[#7c3aed]`} />;
    case "proposal":
      return <FileText className={`${iconClass} text-blue-500`} />;
    case "contract":
      return <FileSignature className={`${iconClass} text-indigo-500`} />;
    case "escrow":
      return <Lock className={`${iconClass} text-amber-500`} />;
    case "file":
      return <Upload className={`${iconClass} text-cyan-500`} />;
    case "comment":
      return <MessageSquare className={`${iconClass} text-gray-500`} />;
    case "note":
      return <StickyNote className={`${iconClass} text-yellow-500`} />;
    case "ai":
      return <Sparkles className={`${iconClass} text-[#7c3aed]`} />;
    case "client":
      return <User className={`${iconClass} text-blue-500`} />;
    case "system":
      return <Bot className={`${iconClass} text-gray-400`} />;
    default:
      return <Bot className={`${iconClass} text-gray-400`} />;
  }
}

function BadgeStyle({ category }: { category: string }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  switch (category) {
    case "milestone":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-600`}>Milestones</span>
      );
    case "payment":
      return (
        <span className={`${base} bg-[#7c3aed]/10 text-[#7c3aed]`}>Payments</span>
      );
    case "proposal":
      return (
        <span className={`${base} bg-blue-50 text-blue-600`}>Proposal</span>
      );
    case "contract":
      return (
        <span className={`${base} bg-indigo-50 text-indigo-600`}>Contracts</span>
      );
    case "escrow":
      return (
        <span className={`${base} bg-amber-50 text-amber-600`}>Escrow</span>
      );
    case "file":
      return (
        <span className={`${base} bg-cyan-50 text-cyan-600`}>Files</span>
      );
    case "comment":
      return (
        <span className={`${base} bg-gray-100 text-gray-600`}>Comments</span>
      );
    case "note":
      return (
        <span className={`${base} bg-yellow-50 text-yellow-600`}>Notes</span>
      );
    case "ai":
      return (
        <span className={`${base} bg-[#7c3aed]/10 text-[#7c3aed]`}>AI</span>
      );
    case "client":
      return (
        <span className={`${base} bg-blue-50 text-blue-600`}>Client</span>
      );
    case "system":
      return (
        <span className={`${base} bg-gray-100 text-gray-500`}>System</span>
      );
    default:
      return (
        <span className={`${base} bg-gray-100 text-gray-500`}>{category}</span>
      );
  }
}

export function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <div className="group rounded-xl border border-gray-100 p-3 transition hover:border-gray-200 hover:shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50">
          <ActivityIcon category={item.category} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {item.title}
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                {item.description}
              </p>
              {item.createdByName && (
                <p className="mt-1 text-xs text-gray-400">
                  by {item.createdByName}
                </p>
              )}
            </div>
            <BadgeStyle category={item.category} />
          </div>
          <div className="mt-1.5 text-xs text-gray-400">{item.time}</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/ActivityCard.tsx
git commit -m "feat: add ActivityCard component"
```

---

### Task 4: ActivityFilters Component

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivityFilters.tsx`

**Interfaces:**
- Consumes: filter state from ProjectActivityView
- Produces: filter/search UI used by ActivityFeed.tsx

- [ ] **Step 1: Create the ActivityFilters component**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivityFilters.tsx

"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Filter, ChevronDown, Calendar } from "lucide-react";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "milestone", label: "Milestones" },
  { value: "payment", label: "Payments" },
  { value: "file", label: "Files" },
  { value: "contract", label: "Contracts" },
  { value: "proposal", label: "Proposals" },
  { value: "note", label: "Notes" },
  { value: "comment", label: "Comments" },
  { value: "escrow", label: "Escrow" },
  { value: "ai", label: "AI" },
  { value: "client", label: "Client" },
  { value: "system", label: "System" },
];

const DATE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "7days", label: "Last 7 Days" },
  { value: "month", label: "Last Month" },
];

export function ActivityFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const categoryLabel =
    CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? "All";
  const dateLabel =
    DATE_OPTIONS.find((o) => o.value === dateRange)?.label ?? "All Time";

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search activities..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
        />
      </div>

      <div ref={categoryRef} className="relative">
        <button
          type="button"
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          {categoryLabel}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`}
          />
        </button>
        {categoryOpen && (
          <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {CATEGORY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onCategoryChange(option.value);
                  setCategoryOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                  category === option.value
                    ? "font-medium text-[#7c3aed] bg-[#7c3aed]/5"
                    : "text-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={dateRef} className="relative">
        <button
          type="button"
          onClick={() => setDateOpen(!dateOpen)}
          className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
        >
          <Calendar className="h-4 w-4" />
          {dateLabel}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${dateOpen ? "rotate-180" : ""}`}
          />
        </button>
        {dateOpen && (
          <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {DATE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onDateRangeChange(option.value);
                  setDateOpen(false);
                }}
                className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                  dateRange === option.value
                    ? "font-medium text-[#7c3aed] bg-[#7c3aed]/5"
                    : "text-gray-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/ActivityFilters.tsx
git commit -m "feat: add ActivityFilters component with search, category, and date range"
```

---

### Task 5: ActivityFeed Component

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivityFeed.tsx`

**Interfaces:**
- Consumes: `ActivityGroup[]` from types.ts, filter/search/dateRange state from ProjectActivityView
- Produces: Left column content used by ProjectActivityView.tsx

- [ ] **Step 1: Create the ActivityFeed component**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivityFeed.tsx

"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { ActivityCard } from "./ActivityCard";
import { ActivityFilters } from "./ActivityFilters";
import { ActivityEmptyState } from "./ActivityEmptyState";
import type { ActivityGroup, ActivityItem } from "./types";

function TimelineIcon() {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#7c3aed] bg-[#7c3aed]/10">
      <div className="h-2 w-2 rounded-full bg-[#7c3aed]" />
    </div>
  );
}

function filterByDateRange(
  groups: ActivityGroup[],
  dateRange: string
): ActivityGroup[] {
  if (dateRange === "all") return groups;

  const now = new Date();
  let cutoff: Date;

  switch (dateRange) {
    case "today":
      cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "7days":
      cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - 7);
      break;
    case "month":
      cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 1);
      break;
    default:
      return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => new Date(item.createdAt) >= cutoff
      ),
    }))
    .filter((group) => group.items.length > 0);
}

function filterBySearch(groups: ActivityGroup[], search: string): ActivityGroup[] {
  if (!search.trim()) return groups;
  const q = search.toLowerCase();
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q) ||
          (item.createdByName?.toLowerCase().includes(q) ?? false)
      ),
    }))
    .filter((group) => group.items.length > 0);
}

function filterByCategory(
  groups: ActivityGroup[],
  category: string
): ActivityGroup[] {
  if (category === "all") return groups;
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0);
}

export function ActivityFeed({
  groups,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  dateRange,
  onDateRangeChange,
}: {
  groups: ActivityGroup[];
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
}) {
  const filtered = useMemo(() => {
    let result = groups;
    result = filterByDateRange(result, dateRange);
    result = filterByCategory(result, category);
    result = filterBySearch(result, search);
    return result;
  }, [groups, dateRange, category, search]);

  const totalFiltered = filtered.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Activity Feed</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            All activities and updates related to this project.
          </p>
        </div>
        <ActivityFilters
          search={search}
          onSearchChange={onSearchChange}
          category={category}
          onCategoryChange={onCategoryChange}
          dateRange={dateRange}
          onDateRangeChange={onDateRangeChange}
        />
      </div>

      {totalFiltered === 0 ? (
        <ActivityEmptyState />
      ) : (
        <div className="mt-4 flex flex-col">
          {filtered.map((group) => (
            <div key={group.date} className="mb-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {group.label}
              </h4>
              <div className="flex flex-col">
                {group.items.map((item, i) => {
                  const isLast = i === group.items.length - 1;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <TimelineIcon />
                        {!isLast && (
                          <div className="my-0.5 h-6 w-0.5 bg-[#7c3aed]/20" />
                        )}
                      </div>
                      <div
                        className={`flex-1 ${isLast ? "pb-1.5" : "pb-3"}`}
                      >
                        <ActivityCard item={item} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/ActivityFeed.tsx
git commit -m "feat: add ActivityFeed with grouped timeline and filtering"
```

---

### Task 6: Sidebar Cards

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivitySummaryCard.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/TopContributorsCard.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/TimelineFilterCard.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/RecentNotesCard.tsx`

**Interfaces:**
- Consumes: `ActivityItem[]`, `ActivityGroup[]`, notes data from page.tsx
- Produces: Sidebar cards used by ProjectActivityView.tsx

- [ ] **Step 1: Create ActivitySummaryCard**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivitySummaryCard.tsx

import Link from "next/link";
import {
  Activity,
  Flag,
  DollarSign,
  Upload,
  MessageSquare,
  FileSignature,
} from "lucide-react";

type SummaryStats = {
  totalActivities: number;
  totalMilestones: number;
  totalPayments: number;
  totalFiles: number;
  totalComments: number;
  totalContracts: number;
};

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 p-2.5">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function ActivitySummaryCard({
  stats,
  slug,
  projectId,
}: {
  stats: SummaryStats;
  slug: string;
  projectId: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Activity Summary</h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/overview`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View Analytics
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <StatCard
          icon={Activity}
          label="Activities"
          value={stats.totalActivities}
          color="bg-[#7c3aed]/10 text-[#7c3aed]"
        />
        <StatCard
          icon={Flag}
          label="Milestones"
          value={stats.totalMilestones}
          color="bg-emerald-50 text-emerald-500"
        />
        <StatCard
          icon={DollarSign}
          label="Payments"
          value={stats.totalPayments}
          color="bg-[#7c3aed]/10 text-[#7c3aed]"
        />
        <StatCard
          icon={Upload}
          label="Files"
          value={stats.totalFiles}
          color="bg-cyan-50 text-cyan-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Comments"
          value={stats.totalComments}
          color="bg-gray-100 text-gray-500"
        />
        <StatCard
          icon={FileSignature}
          label="Contracts"
          value={stats.totalContracts}
          color="bg-indigo-50 text-indigo-500"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create TopContributorsCard**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/TopContributorsCard.tsx

type Contributor = {
  name: string;
  count: number;
};

export function TopContributorsCard({
  contributors,
}: {
  contributors: Contributor[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Top Contributors</h3>

      {contributors.length === 0 ? (
        <div className="mt-3 text-center text-sm text-gray-400">
          No contributors yet
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {contributors.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7c3aed]/10 text-xs font-semibold text-[#7c3aed]">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {c.name}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {c.count} {c.count === 1 ? "activity" : "activities"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create TimelineFilterCard**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/TimelineFilterCard.tsx

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function TimelineFilterCard({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Timeline Filter</h3>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-gray-900">{monthLabel}</span>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-7 gap-0.5">
          {dayNames.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-xs font-medium text-gray-400"
            >
              {d}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = selectedDate === dateStr;
            const isToday =
              day === today.getDate() &&
              viewMonth === today.getMonth() &&
              viewYear === today.getFullYear();

            return (
              <button
                key={day}
                type="button"
                onClick={() => onDateSelect(isSelected ? null : dateStr)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition ${
                  isSelected
                    ? "bg-[#7c3aed] text-white"
                    : isToday
                      ? "bg-[#7c3aed]/10 text-[#7c3aed] font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create RecentNotesCard**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/RecentNotesCard.tsx

import Link from "next/link";
import { StickyNote } from "lucide-react";

type Note = {
  id: string;
  title: string;
  description: string | null;
  created_by_name: string | null;
  created_at: string;
};

export function RecentNotesCard({
  notes,
  slug,
  projectId,
}: {
  notes: Note[];
  slug: string;
  projectId: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Recent Notes</h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/activity`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="mt-3 text-center text-sm text-gray-400">
          No notes yet
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="cursor-pointer rounded-lg border border-gray-100 p-2.5 transition hover:border-gray-200 hover:shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-yellow-50">
                  <StickyNote className="h-3.5 w-3.5 text-yellow-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {note.title}
                  </p>
                  {note.description && (
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {note.description}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    {note.created_by_name && <span>by {note.created_by_name}</span>}
                    <span>
                      {new Date(note.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/ActivitySummaryCard.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/TopContributorsCard.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/TimelineFilterCard.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/RecentNotesCard.tsx
git commit -m "feat: add sidebar cards (summary, contributors, calendar, notes)"
```

---

### Task 7: Skeleton + EmptyState

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivitySkeleton.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivityEmptyState.tsx`

**Interfaces:**
- Produces: Loading and empty states used by ProjectActivityView.tsx

- [ ] **Step 1: Create ActivitySkeleton**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivitySkeleton.tsx

export function ActivitySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-4 w-56 rounded bg-gray-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-48 rounded-lg bg-gray-200" />
          <div className="h-9 w-24 rounded-lg bg-gray-200" />
          <div className="h-9 w-28 rounded-lg bg-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-5 w-5 rounded-full bg-gray-200" />
                    {i < 4 && <div className="my-0.5 h-6 w-0.5 bg-gray-200" />}
                  </div>
                  <div className="flex-1 space-y-2 rounded-xl border border-gray-100 p-3">
                    <div className="flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-gray-200" />
                        <div className="h-3 w-48 rounded bg-gray-200" />
                        <div className="h-3 w-24 rounded bg-gray-200" />
                      </div>
                      <div className="h-5 w-16 rounded-full bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg border border-gray-100 bg-gray-50" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg border border-gray-100 bg-gray-50" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-3 h-32 rounded-lg border border-gray-100 bg-gray-50" />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg border border-gray-100 bg-gray-50" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ActivityEmptyState**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ActivityEmptyState.tsx

import { Activity } from "lucide-react";

export function ActivityEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <Activity className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-gray-900">
        No activity yet
      </h3>
      <p className="mt-1 max-w-xs text-sm text-gray-400">
        Project updates will appear here.
      </p>
      <button
        type="button"
        className="mt-4 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#6d28d9]"
      >
        Create First Activity
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/ActivitySkeleton.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/ActivityEmptyState.tsx
git commit -m "feat: add ActivitySkeleton and ActivityEmptyState components"
```

---

### Task 8: ProjectActivityView Composition

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ProjectActivityView.tsx`

**Interfaces:**
- Consumes: All data from page.tsx (groups, notes, stats, contributors, slug, projectId)
- Produces: Complete page composition with two-column layout

- [ ] **Step 1: Create the ProjectActivityView composition**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/components/ProjectActivityView.tsx

"use client";

import { useState, useMemo } from "react";
import { ActivityFeed } from "./ActivityFeed";
import { ActivitySummaryCard } from "./ActivitySummaryCard";
import { TopContributorsCard } from "./TopContributorsCard";
import { TimelineFilterCard } from "./TimelineFilterCard";
import { RecentNotesCard } from "./RecentNotesCard";
import type { ActivityGroup } from "./types";

type SummaryStats = {
  totalActivities: number;
  totalMilestones: number;
  totalPayments: number;
  totalFiles: number;
  totalComments: number;
  totalContracts: number;
};

type Contributor = {
  name: string;
  count: number;
};

type Note = {
  id: string;
  title: string;
  description: string | null;
  created_by_name: string | null;
  created_at: string;
};

export function ProjectActivityView({
  slug,
  projectId,
  groups,
  stats,
  contributors,
  recentNotes,
}: {
  slug: string;
  projectId: string;
  groups: ActivityGroup[];
  stats: SummaryStats;
  contributors: Contributor[];
  recentNotes: Note[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Activity</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Track all activities and updates for this project
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed
            groups={groups}
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        <div className="flex flex-col gap-4">
          <ActivitySummaryCard
            stats={stats}
            slug={slug}
            projectId={projectId}
          />
          <TopContributorsCard contributors={contributors} />
          <TimelineFilterCard
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          <RecentNotesCard
            notes={recentNotes}
            slug={slug}
            projectId={projectId}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/components/ProjectActivityView.tsx
git commit -m "feat: add ProjectActivityView composition root"
```

---

### Task 9: Server Page Component

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/activity/page.tsx`

**Interfaces:**
- Consumes: Supabase tables (activity, milestones, files, contracts, comments, notes, profiles)
- Produces: Props passed to ProjectActivityView

- [ ] **Step 1: Create the server page component**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/activity/page.tsx

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { generateActivityItems } from "./components/types";
import { ProjectActivityView } from "./components/ProjectActivityView";

export default async function ProjectActivityPage({
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

  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: files } = await supabase
    .from("files")
    .select("id, name, size, created_at, uploaded_by")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: contracts } = await supabase
    .from("contracts")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: comments } = await supabase
    .from("comments")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: activity } = await supabase
    .from("activity")
    .select("id, type, payload, created_at, actor_id")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: notes } = await supabase
    .from("notes")
    .select("id, title, description, created_by, created_at")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const allMilestones = milestones ?? [];
  const allFiles = files ?? [];
  const allContracts = contracts ?? [];
  const allComments = comments ?? [];
  const allActivity = activity ?? [];
  const allNotes = notes ?? [];

  const actorIds = new Set<string>();
  for (const a of allActivity) if (a.actor_id) actorIds.add(a.actor_id);
  for (const f of allFiles) if (f.uploaded_by) actorIds.add(f.uploaded_by);
  for (const c of allComments) if (c.author_id) actorIds.add(c.author_id);
  for (const n of allNotes) if (n.created_by) actorIds.add(n.created_by);

  const { data: profiles } = actorIds.size > 0
    ? await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", Array.from(actorIds))
    : { data: [] };

  const allProfiles = profiles ?? [];

  const groups = generateActivityItems(
    id,
    allMilestones,
    allFiles,
    allContracts,
    allComments,
    allActivity,
    allNotes,
    allProfiles
  );

  const totalActivities =
    allMilestones.length +
    allFiles.length +
    allContracts.length +
    allComments.length +
    allActivity.length +
    allNotes.length;

  const milestoneCount = allMilestones.length;

  const paymentCount = allActivity.filter(
    (a) => a.type === "payment_released" || a.type === "payment"
  ).length;

  const fileCount = allFiles.length;
  const commentCount = allComments.length;
  const contractCount = allContracts.length;

  const contributorMap = new Map<string, number>();
  for (const a of allActivity) {
    if (a.actor_id) {
      contributorMap.set(a.actor_id, (contributorMap.get(a.actor_id) ?? 0) + 1);
    }
  }
  for (const f of allFiles) {
    if (f.uploaded_by) {
      contributorMap.set(
        f.uploaded_by,
        (contributorMap.get(f.uploaded_by) ?? 0) + 1
      );
    }
  }
  for (const c of allComments) {
    if (c.author_id) {
      contributorMap.set(
        c.author_id,
        (contributorMap.get(c.author_id) ?? 0) + 1
      );
    }
  }
  for (const n of allNotes) {
    if (n.created_by) {
      contributorMap.set(
        n.created_by,
        (contributorMap.get(n.created_by) ?? 0) + 1
      );
    }
  }

  const contributors = Array.from(contributorMap.entries())
    .map(([id, count]) => ({
      name: allProfiles.find((p) => p.id === id)?.full_name ?? "System",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentNotes = allNotes.slice(0, 3).map((n) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    created_by_name: allProfiles.find((p) => p.id === n.created_by)?.full_name ?? null,
    created_at: n.created_at,
  }));

  return (
    <ProjectActivityView
      slug={slug}
      projectId={id}
      groups={groups}
      stats={{
        totalActivities,
        totalMilestones: milestoneCount,
        totalPayments: paymentCount,
        totalFiles: fileCount,
        totalComments: commentCount,
        totalContracts: contractCount,
      }}
      contributors={contributors}
      recentNotes={recentNotes}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/activity/page.tsx
git commit -m "feat: add Activity page server component with data fetching"
```

---

### Task 10: Verify Build

**Files:**
- No new files

**Interfaces:**
- Consumes: All previous tasks
- Produces: Passing lint + build

- [ ] **Step 1: Run lint**

```bash
cd frontend && pnpm lint
```

Expected: No errors

- [ ] **Step 2: Run build**

```bash
cd frontend && pnpm build
```

Expected: Build succeeds

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve lint/build issues for activity page"
```
