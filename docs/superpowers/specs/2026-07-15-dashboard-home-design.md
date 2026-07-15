# Dashboard Home Screen Design

## Overview

Build `/dashboard/home` — a production-ready SaaS dashboard matching the provided design reference (95-99% visual accuracy). Light theme for dashboard content, dark sidebar preserved.

## Architecture

- **Route**: `app/dashboard/home/page.tsx` (client component)
- **Layout**: `app/dashboard/layout.tsx` — wraps with AppShell + light theme class
- **Theme**: `.dashboard-light` class overrides CSS variables for light dashboard content
- **Data**: Centralized in `lib/dashboard/mock-data.ts`, components receive typed props
- **Types**: `types/dashboard.ts` — all interfaces

## Theme Tokens (Light Dashboard)

| Token | Value | Usage |
|-------|-------|-------|
| bg | `#f7f8fc` | Page background |
| card | `#ffffff` | Card backgrounds |
| border | `#e5e8f0` | Card borders |
| text | `#11182d` | Primary text |
| text-muted | `#5f6b86` | Secondary text |
| text-subtle | `#8b95aa` | Tertiary text |
| primary | `#7c3aed` | Purple accent (buttons, badges) |
| success | `#16a34a` | Green (In Progress) |
| warning | `#f59e0b` | Amber (Pending Approval) |

## Component Structure

```
components/dashboard/home/
├── DashboardHeader.tsx      # Greeting + search + notifications + New Project
├── MetricCards.tsx           # 4-card grid row
├── MetricCard.tsx            # Individual metric card (reusable)
├── ActionRequired.tsx        # Pending actions with action buttons
├── RecentActivity.tsx        # Timeline with activity dots
├── UpcomingMilestones.tsx    # Right sidebar milestone cards
├── ActiveProjectsTable.tsx   # Full-width table with progress bars
├── AICopilot.tsx             # Chat input + example prompts
└── QuickSummary.tsx          # Monthly metrics summary
```

## Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────────────┐
│ DashboardHeader (greeting | search | notifications | +New Project) │
├─────────────┬─────────────┬─────────────┬─────────────┬────────────┤
│ Total Proj  │ Funds Escrow│ Pending Appr│ Payments Rec│            │
│ MetricCard  │ MetricCard  │ MetricCard  │ MetricCard  │ Upcoming   │
├─────────────┴─────────────┼─────────────┴─────────────┤ Milestones  │
│ Action Required           │ Recent Activity           │            │
│ (Review/Sign/Release)     │ (Timeline dots)           │ AI Copilot │
├───────────────────────────┴───────────────────────────┤            │
│ Active Projects Table (full width)                    │ Quick Summ │
│ (Project|Client|Progress|Escrow|Status|Next)          │            │
└───────────────────────────────────────────────────────┴────────────┘
```

## Data Models

```typescript
interface DashboardUser { id: string; firstName: string; lastName: string; avatar?: string }
interface MetricData { title: string; value: string; subtitle: string; icon: LucideIcon; trend?: string; trendUp?: boolean }
interface Milestone { id: string; project: string; name: string; date: string; icon: LucideIcon }
interface Approval { id: string; project: string; description: string; type: 'review' | 'sign' | 'release' }
interface Activity { id: string; text: string; timestamp: string; icon: LucideIcon; iconBg: string }
interface Project { id: string; name: string; client: string; progress: number; escrow: string; status: 'In Progress' | 'Pending Approval' | 'Completed'; nextMilestone: string; nextDate: string }
```

## Requirements

- Dynamic greeting based on time of day + user's first name
- All data from centralized mock data, no hardcoded UI
- TypeScript strict, no `any`
- Reusable components with proper props
- Responsive (desktop/laptop/tablet)
- Accessible (ARIA, keyboard nav)
- Tailwind transitions for hover/animation
- Ready for backend integration (Clerk/Supabase Auth)
