# Project Overview Page Design

**Date:** 2026-07-17
**Route:** `/w/[workspace]/projects/[projectId]/overview`
**Status:** Approved

## Goal

Build the Project Overview page as the default landing page for every project inside every workspace. The page displays a comprehensive dashboard with project stats, milestones, escrow, activity, files, and client info — matching the reference design exactly.

## Constraints

- Do NOT modify: auth, sidebar, workspace layout, existing project layout header/tabs, project creation flow, other pages
- Use existing UI patterns (white cards, purple accents, Tailwind, shadcn components)
- Use Recharts (already installed) for the escrow donut chart
- All data fetched dynamically — no hardcoded values
- Must work for every workspace and every project

## Data Model

### Available from projects table
- `id`, `title`, `description`, `code`, `status`, `client_name`, `client_email`, `freelancer_name`, `freelancer_email`, `metadata` (JSONB), `created_by`, `client_id`, `created_at`, `updated_at`

### metadata JSONB fields (from new project form)
- `metadata.category` → displayed as "Project Type" (e.g., "Fixed Price")
- `metadata.priority` → displayed as "Priority" (e.g., "high", "normal", "low")
- `metadata.currency` → displayed as "Currency" (e.g., "XLM")
- `metadata.timeline` → stored but not displayed on overview

### Derived from milestones table
- `milestones.amount` → sum for Total Budget
- `milestones.status` → count by status for progress, escrow breakdown
- `milestones.asset` → currency label (e.g., "XLM", "USDC")
- `milestones.due_date` → upcoming milestones

### Additional fetches in page.tsx
- `clients` table → client details (email, phone, status, logo)
- `files` table → project files (name, size, created_at)
- `activity` table → recent activity feed (type, payload, created_at)
- `profiles` table → owner name/avatar (via `created_by` FK)
- `project_members` table → team member count

## Component Architecture

```
overview/page.tsx (server component — fetches all data)
  └─ ProjectOverviewView (client component — renders full layout)
       ├─ ProjectStatsRow (5 stat cards)
       ├─ Row 1 (3-col): ProjectOverviewCard | MilestoneProgressCard | ClientInfoCard
       ├─ Row 2 (3-col): EscrowOverviewCard | RecentActivityCard | QuickActionsCard
       └─ Row 3 (2-col): ProjectFilesCard | UpcomingMilestonesCard
```

All components co-located in `app/(app)/w/[slug]/projects/[id]/overview/components/`.

## Server-Side Computation

All values computed in `page.tsx` before passing to client component:

```typescript
// Progress
const completedCount = milestones.filter(m => m.status === 'released').length;
const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

// Budget (sum all milestone amounts, grouped by asset)
const totalBudget = milestones.reduce((sum, m) => sum + Number(m.amount), 0);

// Escrow breakdown by status
const funded = milestones.filter(m => ['funded','in_review'].includes(m.status));
const released = milestones.filter(m => m.status === 'released');
const pending = milestones.filter(m => m.status === 'draft');
const refunded = milestones.filter(m => m.status === 'refunded');

// Escrow amounts
const fundedAmount = funded.reduce((s, m) => s + Number(m.amount), 0);
const releasedAmount = released.reduce((s, m) => s + Number(m.amount), 0);
const pendingAmount = pending.reduce((s, m) => s + Number(m.amount), 0);
const refundedAmount = refunded.reduce((s, m) => s + Number(m.amount), 0);
```

## Component Specs

### 1. ProjectStatsRow
5 stat cards in a horizontal row:
- **Project Progress**: percentage, "On Track" badge, animated progress bar, "X of Y milestones completed"
- **Total Budget**: `{amount} {asset}`, `≈ ${usdAmount} USD`
- **Escrow Funded**: `{amount} {asset}`, "100% Funded" or `-{pct}% Funded`
- **Amount Released**: `{amount} {asset}`, `≈ ${usdAmount} USD`
- **Pending Amount**: `{amount} {asset}`, `≈ ${usdAmount} USD`

Card styling: `rounded-xl border border-gray-200 bg-white p-5 shadow-sm` with colored icon backgrounds.

### 2. ProjectOverviewCard
White card showing:
- Project description (from `projects.description`)
- Project Owner (avatar + name from `profiles`)
- Project Type (from `metadata.category`, default "Fixed Price")
- Priority (from `metadata.priority`, default "Normal" — colored dot)
- Currency (from `metadata.currency`, default "XLM")
- Created On (formatted date)
- Last Updated (formatted date)
- "Edit Project Details" button at bottom

### 3. MilestoneProgressCard
- Horizontal segmented progress bar (colored by status)
- 4 status rows: Completed, In Progress, Upcoming, Pending — each with count + percentage
- "View All" link to `/w/${slug}/projects/${id}/milestones`

### 4. ClientInfoCard
- Company avatar (first letter or logo)
- Company name, email, phone
- Status badge (active/inactive)
- "View Client Profile" button → `/w/${slug}/clients/${clientId}`

### 5. EscrowOverviewCard
- Recharts `PieChart` (donut) with center label showing total + "Escrow Funded"
- Legend: Funded (green), Released (blue), Pending (orange), Refunded (gray)
- "View Details" button

### 6. RecentActivityCard
- Timeline list of recent activity items
- Each item: icon (by type), title, timestamp, avatar
- Activity types: milestone_completed, payment_released, proposal_accepted, contract_signed, files_uploaded, client_commented
- "View All" link

### 7. QuickActionsCard
Vertical list of action buttons with chevron icons:
- Create Milestone
- Upload File
- Generate Invoice
- Record Payment
- Add Note
- Send Update to Client

### 8. ProjectFilesCard
Horizontal file cards showing:
- File type icon (color-coded by extension)
- Filename, type label, upload date, size
- "View All" link

### 9. UpcomingMilestonesCard
List of upcoming milestones:
- Milestone name, budget amount, due date, status badge
- "View All" link

## Empty States

- No milestones: "No milestones created yet. Create your first milestone."
- No files: "No files uploaded."
- No activity: "No recent activity."
- Project not found: Centered "Project not found" with back link

## Loading States

Use React `Suspense` with skeleton placeholders matching each card's shape.

## Responsive

- Desktop: exact match to reference (5-col stats, 3-col content rows)
- Tablet: 2-col grid for stats and content
- Mobile: single column, scrollable tabs

## File Structure

```
app/(app)/w/[slug]/projects/[id]/overview/
  page.tsx                           # Server component
  components/
    ProjectOverviewView.tsx          # Main client wrapper
    ProjectStatsRow.tsx              # 5 stat cards
    ProjectOverviewCard.tsx          # Project details
    MilestoneProgressCard.tsx        # Milestone progress bars
    ClientInfoCard.tsx               # Client info
    EscrowOverviewCard.tsx           # Donut chart + legend
    RecentActivityCard.tsx           # Activity timeline
    QuickActionsCard.tsx             # Action list
    ProjectFilesCard.tsx             # File cards
    UpcomingMilestonesCard.tsx       # Upcoming milestones
```

## Testing

- Verify page loads for existing projects with milestones
- Verify empty states render correctly
- Verify responsive layout at tablet/mobile breakpoints
- Verify all links navigate correctly with workspace slug preservation
- Run `pnpm lint` and `pnpm build` to verify no type/lint errors
