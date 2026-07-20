# Project Activity Page Design

## Overview

Implement the Activity tab for the Project Details module at `/w/[workspaceSlug]/projects/[projectId]/activity`. Reuses the existing project layout (header, tabs, spacing) and follows the established two-column pattern used by the Timeline page.

## Route

```
app/(app)/w/[slug]/projects/[id]/activity/page.tsx
```

Dynamic: `[slug]` = workspace, `[id]` = project UUID. Works for every workspace and project.

## Architecture

### Data Flow

```
page.tsx (server)
  → createClient() → getActiveOrgBySlug()
  → fetch: activity, milestones, files, contracts, comments, profiles, notes
  → merge + enrich into ActivityItem[]
  → pass to ProjectActivityView (client)
```

Same pattern as `timeline/page.tsx`.

### Data Sources

| Source | Table | Enrichment |
|--------|-------|------------|
| Activity feed | `activity` (existing) | type + payload jsonb covers all categories |
| Milestones | `milestones` | title, amount, status |
| Files | `files` | name, size |
| Contracts | `contracts` | title, status |
| Comments | `comments` | content |
| Notes | `notes` (new) | title, description |
| Actors | `profiles` | full_name, avatar_url |

### New Table: `notes`

```sql
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
```

Migration file: `frontend/supabase/notes.sql`

## Layout

Two-column grid (same as timeline):

```
┌─────────────────────────────────────────────────┐
│ [Activity Feed 70%]     │ [Sidebar 30%]         │
│                         │                       │
│ ┌─────────────────────┐ │ ┌───────────────────┐ │
│ │ Activity Feed Card  │ │ │ Activity Summary  │ │
│ │  Filter │ DateRange │ │ │ 24 Activities     │ │
│ │                     │ │ │ 8 Milestones      │ │
│ │ Today               │ │ │ 6 Payments        │ │
│ │  ├─ Activity 1      │ │ │ 5 Files           │ │
│ │  └─ Activity 2      │ │ │ 5 Comments        │ │
│ │ Yesterday           │ │ └───────────────────┘ │
│ │  └─ Activity 3      │ │                       │
│ │ May 14              │ │ ┌───────────────────┐ │
│ │  └─ Activity 4      │ │ │ Top Contributors  │ │
│ │                     │ │ │ Janvi - 9         │ │
│ │                     │ │ │ System - 2        │ │
│ │                     │ │ └───────────────────┘ │
│ │                     │ │                       │
│ │                     │ │ ┌───────────────────┐ │
│ │                     │ │ │ Timeline Filter   │ │
│ │                     │ │ │ Mini Calendar     │ │
│ │                     │ │ └───────────────────┘ │
│ │                     │ │                       │
│ │                     │ │ ┌───────────────────┐ │
│ │                     │ │ │ Recent Notes      │ │
│ │                     │ │ │ Note 1            │ │
│ │                     │ │ │ Note 2            │ │
│ │                     │ │ └───────────────────┘ │
│ └─────────────────────┘ │                       │
└─────────────────────────────────────────────────┘
```

Responsive:
- Desktop: two columns (lg:grid-cols-3)
- Tablet: sidebar moves below feed
- Mobile: single column, stacked cards

## Components

### `page.tsx` (server component)

Fetches all data, computes stats, passes to view. Identical pattern to `timeline/page.tsx`.

### `ProjectActivityView.tsx` (client component)

Composition root. Manages filter state, search, date range. Renders two-column layout.

### `ActivityFeed.tsx`

Left column card. Contains:
- Header: title + subtitle + filter button + date range picker
- Activities grouped by day with date headers
- Vertical timeline (icons + connecting line)

### `ActivityCard.tsx`

Individual activity item:
- Icon (colored by type)
- Time (e.g., "10:30 AM")
- Title (bold)
- Description
- User name + optional avatar
- Category badge
- Hover state (clickable)

### `ActivityFilters.tsx`

- Search input (searches across all activity fields)
- Category filter dropdown (All, Milestones, Payments, Files, Contracts, Proposals, Notes, Comments, Escrow, AI, Client, System)
- Date range picker (Today, Last 7 Days, Last Month, Custom Range)

### `ActivitySummaryCard.tsx`

Stats card with mini stat cards inside.

### `TopContributorsCard.tsx`

List of contributors with avatar, name, activity count.

### `TimelineFilterCard.tsx`

Mini calendar for date-based filtering.

### `RecentNotesCard.tsx`

Latest internal notes with title, description, created_by, date. "View All" link.

### `ActivitySkeleton.tsx`

Loading skeleton for header, cards, timeline.

### `ActivityEmptyState.tsx`

Empty state with illustration, text, and "Create First Activity" button.

## Activity Type Mapping

| Category | Icon Component | Badge Color | Source |
|----------|---------------|-------------|--------|
| Milestone | Flag | Green (emerald) | milestones table |
| Payment | DollarSign | Purple | activity type=payment |
| Proposal | FileText | Blue | activity type=proposal |
| Contract | FileSignature | Indigo | contracts table |
| Escrow | Lock | Amber | activity type=escrow |
| Files | Upload | Cyan | files table |
| Comments | MessageSquare | Gray | comments table |
| Notes | StickyNote | Yellow | notes table |
| AI | Sparkles | Purple | activity type=ai_* |
| Client | User | Blue | activity type=client_* |
| System | Bot | Gray | activity type=system_* |

## Activity Object

```typescript
type ActivityItem = {
  id: string;
  projectId: string;
  workspaceId: string;
  type: string;
  title: string;
  description: string;
  createdBy: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
  attachment?: string;
  badge: string;
  icon: string;
  category: "milestone" | "payment" | "proposal" | "contract" | "escrow" | "file" | "comment" | "note" | "ai" | "client" | "system";
};
```

## Styling

Follows existing Orka design language exactly:
- Cards: `rounded-xl border border-gray-200 bg-white p-4 shadow-sm`
- Primary color: `#7c3aed`
- Background: `bg-gray-50`
- Spacing: 24px (px-6 py-6)
- Buttons: `rounded-lg` (12px)
- Typography: `text-lg font-semibold text-gray-900` headings, `text-sm text-gray-500` subtitles
- Icons: Lucide
- Transitions: hover states with `transition` and `hover:` variants

## States

- **Loading**: Skeleton for header, cards, timeline
- **Empty**: Illustration + "No activity yet" + "Create First Activity" button
- **Error**: Centered "Unable to load project activity." + Retry button
- **Data**: Full activity feed with grouping, filtering, search

## Scope

- UI implementation with data from Supabase
- Activity types are derived from existing data (milestones, files, contracts, comments, activity table)
- No new API routes needed — server component queries directly
- Search and filtering are client-side (filter the already-fetched data)
- Action buttons (Add Note, etc.) are UI-only for now — they don't create real data yet

## Files

```
frontend/app/(app)/w/[slug]/projects/[id]/
├── activity/
│   ├── page.tsx                          # Server component
│   └── components/
│       ├── ProjectActivityView.tsx        # Client composition root
│       ├── ActivityFeed.tsx               # Left column - grouped timeline
│       ├── ActivityCard.tsx               # Individual activity item
│       ├── ActivityFilters.tsx            # Search + filter + date range
│       ├── ActivitySummaryCard.tsx        # Stats card
│       ├── TopContributorsCard.tsx        # Contributors list
│       ├── TimelineFilterCard.tsx         # Mini calendar
│       ├── RecentNotesCard.tsx            # Latest notes
│       ├── ActivitySkeleton.tsx           # Loading state
│       └── ActivityEmptyState.tsx         # Empty state
frontend/supabase/
├── notes.sql                             # Notes table migration
```
