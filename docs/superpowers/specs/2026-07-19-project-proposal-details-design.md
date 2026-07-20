# Project Proposal Details Page — Design Spec

## Overview

Build a unified Project Proposal Details page at `/w/[workspaceSlug]/projects/[id]/proposal`. The page replaces the current stub and displays all proposal information on a single screen with no subtabs.

## Route

```
/w/[workspaceSlug]/projects/[id]/proposal
```

- Reuses existing project detail layout (sidebar, workspace header, breadcrumb, project header, project navigation tabs)
- Proposal tab is active in project navigation
- No proposal subtabs (Overview, Versions, Comments, Activity are removed)
- Top-right button: "Create Proposal" (purple `#7c3aed`)

## Data Model

### New Supabase Tables

#### `project_proposals`

```sql
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
create policy "project_proposals_org" on public.project_proposals
  for all using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));
create trigger project_proposals_touch before update on public.project_proposals
  execute function public.touch_updated_at();
```

#### `proposal_sections`

```sql
create table if not exists public.proposal_sections (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  title text not null,
  content text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.proposal_sections enable row level security;
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
```

#### `proposal_pricing`

```sql
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
```

#### `proposal_notes`

```sql
create table if not exists public.proposal_notes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  content text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.proposal_notes enable row level security;
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
```

#### `proposal_activity`

```sql
create table if not exists public.proposal_activity (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  type text not null,
  payload jsonb default '{}'::jsonb,
  actor_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.proposal_activity enable row level security;
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

### Data Flow

```
Server Page (page.tsx)
  → Supabase client
  → getActiveOrgBySlug(supabase, slug)
  → fetch project (scoped to org)
  → fetch proposal (project_id + org_id)
  → fetch proposal_sections (proposal_id)
  → fetch proposal_pricing (proposal_id)
  → fetch proposal_notes (proposal_id)
  → fetch proposal_activity (proposal_id)
  → fetch client (project.client_id)
  → pass all to ProposalDetailView
```

## Layout

Two-column layout matching timeline/activity pages:

```
grid grid-cols-1 gap-4 lg:grid-cols-3

Main column (lg:col-span-2):
  Card 1: ProposalOverviewCard + ProposalSummaryCard (side by side)
  Card 2: ProposalContentCard (left nav + body + pricing)
  Card 3: ProposalLatestCard

Sidebar column:
  ProposalStatusCard (vertical timeline)
  ProposalActionsCard (action buttons)
  ClientContactCard (client info)
  ProposalNotesCard (internal notes)
```

## Components

### Server Page: `proposal/page.tsx`

- Extracts `slug` and `id` from params
- Creates Supabase server client
- Resolves org, fetches project and proposal data
- Returns 404 if no proposal exists (or empty state)
- Renders `<ProposalDetailView />`

### Client View: `proposal/components/ProposalDetailView.tsx`

- Receives all data as props
- Renders two-column grid layout
- Handles loading/empty states

### Cards

#### `ProposalOverviewCard` (Card 1 left)

Shows:
- Client name (with icon)
- Project name (with icon)
- Proposal Amount (XLM + USD equivalent)
- Valid Until (with days remaining)
- Status badge (colored per status)
- Accepted Date (if accepted)
- Payment Terms
- "Edit Proposal" button

#### `ProposalSummaryCard` (Card 1 right)

Shows:
- Summary heading
- Summary text
- Green check icons for each deliverable

#### `ProposalContentCard` (Card 2)

Left navigation (9 sections):
1. Project Overview
2. Objectives
3. Scope of Work
4. Deliverables
5. Timeline
6. Pricing
7. Payment Terms
8. Terms & Conditions
9. Next Steps

- Clicking a section smooth-scrolls to it
- Each section has proper heading and content
- Pricing Summary sidebar inside the card (right side of content area)
- Pricing shows line items, subtotal, tax, total with USD equivalent

#### `ProposalLatestCard` (Card 3)

Shows:
- Proposal version title
- Created by (name)
- Created date
- Status badge
- Amount (XLM + USD)
- Preview PDF button
- More menu (...)

#### `ProposalStatusCard` (Sidebar)

Vertical timeline:
- Draft Created (with date)
- Sent (with date)
- Viewed (with date)
- Accepted (with date) or Rejected (red) or Expired (gray)

#### `ProposalActionsCard` (Sidebar)

Buttons with icons:
- Download PDF
- Duplicate Proposal
- Create Invoice
- Convert to Contract
- Withdraw Proposal (red, destructive)

#### `ClientContactCard` (Sidebar)

- Avatar (or initials fallback)
- Name
- Company
- Email
- Phone
- "Send Message" button

#### `ProposalNotesCard` (Sidebar)

- Notes list (or empty state: "No notes added")
- "Add Note" button

### Empty State: `ProposalEmptyState`

- Centered illustration
- "No proposal has been created yet."
- "Create Proposal" button

### Loading State: `ProposalSkeleton`

- Skeleton loaders for all cards

### Error State

- Centered card: "Unable to load proposal."
- Retry button

## Proposal States

| Status | Badge Color | Notes |
|---|---|---|
| draft | `bg-gray-100 text-gray-600` | Default state |
| sent | `bg-blue-50 text-blue-600` | Sent to client |
| viewed | `bg-amber-50 text-amber-600` | Client viewed |
| accepted | `bg-emerald-50 text-emerald-600` | Client accepted |
| rejected | `bg-red-50 text-red-600` | Client rejected |
| expired | `bg-gray-100 text-gray-500` | Past valid_until |
| archived | `bg-gray-100 text-gray-500` | Archived |

## Actions

| Action | Description |
|---|---|
| Create Proposal | Opens proposal creation form |
| Edit Proposal | Opens proposal edit form |
| Preview PDF | Opens PDF preview modal |
| Download PDF | Downloads proposal as PDF |
| Duplicate | Creates a copy of the proposal |
| Send to Client | Sends proposal to client |
| Convert to Contract | Converts proposal to contract |
| Withdraw | Withdraws proposal (sets status to archived) |
| Create Invoice | Creates invoice from proposal |

## Responsive Behavior

- **Desktop** (>1024px): Two columns, sidebar right
- **Tablet** (768-1024px): Sidebar moves below content
- **Mobile** (<768px): Single column, section nav horizontal scroll, cards stack vertically

## Visual Requirements

- Light theme (white cards, `bg-gray-50` background)
- Primary accent: `#7c3aed` (purple)
- Card radius: `rounded-xl` (12px)
- Card padding: `p-4` or `p-5`
- Grid gap: `gap-4`
- Max width: `max-w-7xl`
- Shadows: `shadow-sm`
- Icons: Lucide
- Fonts: DM Sans (body), JetBrains Mono (financial)
- Transitions: Framer Motion for card animations

## Acceptance Criteria

1. Route works for every workspace and every project
2. Reuses existing project detail layout (header, tabs, sidebar)
3. Proposal tab is active in project navigation
4. No proposal subtabs
5. Top-right button is "Create Proposal"
6. All proposal information visible on one screen
7. Supports all 7 proposal states
8. Fetches real data from Supabase
9. Matches Orka design system (light theme, cards, colors, spacing)
10. Fully responsive
11. Zero scroll both vertically and horizontally (content fills viewport)
12. Empty state when no proposal exists
13. Loading skeletons during data fetch
14. Error state with retry
