# Real Data Foundation & Dashboard Redesign

**Date:** 2026-07-16
**Status:** Approved (design)
**Scope:** Replace all mocked dashboard data with real Supabase data via a shared
query foundation, then apply the same pattern to every workspace route. No mock
data remains anywhere on the frontend.

---

## 0. Standing design standard (applies to ALL work in this repo)

Per project decision, **every design/build task must use the available design
skills** and aim for work that is **scalable and beautiful**:

- Use `brainstorming` before any feature work; `frontend-design`,
  `apple-design`, `emil-design-eng` (and `design-review` at the end) when
  producing UI.
- Design principles to enforce:
  - **Scalability** — config-driven, typed data contracts, shared components,
    no one-off hardcoding. The query layer is the single source of truth.
  - **Visual hierarchy & grouping** — clear section cards, consistent spacing
    scale, tokenized colors (no magic hex outside `globals.css` tokens).
  - **Motion craft (Emil / Apple)** — interruptible, spring-like transitions;
    respond on pointer-down; respect `prefers-reduced-motion`; active states
    always visible.
  - **Honest empty states** — when real data is absent, show a calm, on-brand
    placeholder — never fake/invented numbers.

---

## 1. Problem & goal

`DashboardContent` is a client component importing everything from
`lib/dashboard/mock-data.ts`. The DB has real tables
(`organizations`, `organization_members`, `profiles`, `clients`,
`freelancers`, `projects`, `milestones`, `invoices`, `ledger_events`,
`proposals`, `disputes`) but the UI does not read them.

**Goal:** a single, reusable, RLS-scoped query foundation that every workspace
route consumes; the dashboard is the reference implementation; all other routes
follow. **No mock data survives on the frontend.**

Decisions locked with the user:
- Derived widgets (approvals, activity) → **real data + graceful empty states**.
- Data fetching → **server component** queries Supabase directly.
- Scope → **all widgets** wired to real data in this first pass.
- Money → display **`asset + numeric`** (e.g. `USDC 1,250`); no fake USD FX.
- Sequencing → **foundation first, then routes** one by one.
- Schema gaps (e.g. AI usage) → **only what the schema supports**, honest empty
  state otherwise.

---

## 2. Architecture & data flow

- `app/(app)/w/[slug]/dashboard/page.tsx` becomes a **server component**:
  awaits `params`, `createClient()`, `getActiveOrgBySlug(supabase, slug)`,
  then `getDashboardData(supabase, org.id)`, renders
  `<DashboardContent data={...} />`.
- New `lib/workspace/queries.ts` (shared foundation) exports focused, typed,
  `orgId`-scoped functions (see §3). All queries rely on existing
  `auth_is_org_member` RLS — no raw SQL, same convention as `lib/orka.ts`.
- `DashboardContent` stays a client component, receives `DashboardData` as a
  prop. No mock import.
- `lib/dashboard/mock-data.ts` deleted after migration.

---

## 3. Shared query foundation (`lib/workspace/queries.ts`)

Reusable functions, each returning typed data scoped to `orgId`:

- `getProjects(supabase, orgId): Promise<Project[]>`
  - joins `clients` for `client` name
  - `progress` = completed milestones ÷ total × 100
  - `escrow` = sum of `amount` for milestones in `funded`/`in_review`
  - `status` maps `project_status` (`draft|active|completed|archived`) → display
    label (`Pending` / `In Progress` / `Completed` / `Archived`)
  - `nextMilestone` / `nextDate` from the next incomplete milestone
- `getMilestones(supabase, orgId): Promise<Milestone[]>`
  - next-up per project, project title joined, formatted date
- `getApprovals(supabase, orgId): Promise<Approval[]>`
  - `in_review` → type `review`; `funded` awaiting signature → `sign`;
    `released` pending confirm → `release`
- `getActivity(supabase, orgId): Promise<Activity[]>`
  - from `ledger_events`, newest first, mapped to icon + text + relative time
- `getSummary(supabase, orgId): Promise<QuickSummaryData>`
  - revenue = sum of `released` amounts; completedProjects; totalClients
- `getDashboardData(supabase, orgId): Promise<DashboardData>`
  - `Promise.all` of the above

All run in parallel via `Promise.all`. Mapping logic lives only here.

---

## 4. Widget contract changes (design unchanged)

Presentational components keep their **visual design identical**; only data
props change:

- `MetricData`, `Milestone`, `Activity` types drop `icon` / `iconBg`
  (`LucideIcon`) fields. Icons become **component-internal** (mapped by type) so
  components own their visual language. Colors/layout unchanged.
- `Project.status` uses the 3 display labels the table already styles.
- `progress` is a computed 0–100 integer.
- Empty arrays render the existing card shells with a centered, on-brand
  **`EmptyState`** piece (neutral, calm — "No data yet").

Components touched: `MetricCards`/`MetricCard`, `ActiveProjectsTable`,
`ActionRequired`, `RecentActivity`, `UpcomingMilestones`, `QuickSummary`,
`DashboardHeader`, plus new `components/dashboard/EmptyState.tsx`.

---

## 5. Types cleanup

- `types/dashboard.ts`: remove `LucideIcon`/`iconBg` from `MetricData`,
  `Milestone`, `Activity`. Keep all other fields.
- Delete `lib/dashboard/mock-data.ts`.

---

## 6. Rollout to other routes (foundation reuse)

Each route drops its mock source and imports from `lib/workspace/queries.ts`:

| Route | Source |
|-------|--------|
| projects | `getProjects` (+ detail page) |
| clients | `clients` table |
| proposals | `proposals` table |
| payments / invoices | `ledger_events` (release/fund) + `invoices` |
| analytics | aggregates (revenue over time, counts by status) |
| ai | **honest empty / coming-soon** (no AI table yet) |
| settings | `organizations` + `organization_members` (real roster + role) |

Shared `EmptyState` used wherever data is absent. Each route is a follow-on plan
referencing this foundation.

---

## 7. Error handling & edge cases

- Missing/empty data → empty states, not crashes.
- Query error → surface a small inline error in the dashboard shell; do not
  throw the whole page (each widget resilient).
- RLS already scopes every query to `orgId` membership.
- `progress` guards divide-by-zero (no milestones → 0).

---

## 8. Testing & verification

- `pnpm build` passes; `pnpm lint` clean for changed files.
- Manual: load `/w/[slug]/dashboard` with seeded data → all widgets populate;
  with empty org → all widgets show empty states (no mock numbers).
- Grep the frontend for remaining mock imports — **zero** `mock-data` /
  hardcoded fake arrays in workspace routes after completion.

---

## 9. Out of scope (this plan)

- New Supabase migrations / schema extensions (AI usage, payment methods).
- Real Stellar/Soroban on-chain reads (still simulated per MVP).
- Client-side live refresh (SWR) — server render only for now.

---

## 10. Implementation phases (this plan)

1. `lib/workspace/queries.ts` + types update (`types/dashboard.ts`).
2. `DashboardContent` → server-fed; delete `mock-data.ts`.
3. Widget prop-shape updates + `EmptyState` component.
4. Dashboard page becomes server component.
5. Build + lint + manual verification (seeded + empty org).
6. (Follow-on plans) apply foundation to remaining routes per §6.
