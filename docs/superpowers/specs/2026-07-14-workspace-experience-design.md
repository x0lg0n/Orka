# Workspace Experience — Design & Implementation Plan

Date: 2026-07-14
Spec source: `docs/ui-specs/workspace.md` (UI-001)

## Decisions (confirmed with user)
- **Routes:** Build new `/workspaces`, `/workspaces/new`, `/workspaces/[workspaceId]`. Make `/onboarding` a redirect shim → `/workspaces` (avoids editing ~15 fallback redirects in `actions.ts`/dashboard pages).
- **Theme:** Dark, built on shadcn/ui components (consistency with the app), NOT the spec's light palette.
- **Backend:** Full — add migration for `organizations.type` + `logo_url`; extend `createOrg`; show real clients count + last-active.

## Routes & Pages

### 1. `/workspaces` — Workspace Selector
- Dark, centered container, max-width ~1200px, top nav: ORKA logo (left) · spacer · user avatar + logout (right). Minimal.
- Header: "Choose a Workspace" + subtitle "Select a workspace to continue or create a new one."
- Search (`SearchField`-style input) filters by name / type / owner.
- Responsive grid: 3 cols desktop, 2 tablet, 1 mobile.
- **Workspace Card** (shadcn `Card` + `Avatar` + `Badge`):
  - Logo (Avatar: uploaded `logo_url` or generated initial), Name, **Type** badge, **Owner** badge (if role=owner).
  - Stats: Projects, Clients, Members (3-col grid).
  - Last active (relative: Today / Yesterday / date).
  - Hover: border → violet (`border-primary`), soft shadow, `scale-[1.01]`, 200ms.
  - Click → `selectOrg` (sets `orka_active_org` cookie) → `/workspaces/[id]`.
- "New workspace" card (dashed border) + footer "Can't find your workspace? Create New Workspace".
- Empty state (no orgs): illustration + "Welcome to Orka" + Create button.
- Data per org: `type`, `logo_url`, `role`, `projects` count, `clients` count, `members` count, `last_active`.

### 2. `/workspaces/new` — Create Workspace
- Centered `Card`, width 640px.
- Header: "Create Workspace" + subtitle.
- Form (server action `createOrg` extended):
  - Workspace name (required, Input + Label).
  - Workspace type — `DropdownMenu` picker (Freelancer / Agency / Studio / Consultancy / Startup).
  - Logo — optional. "Generate Initial" preview (Avatar from name) + optional file upload to Supabase Storage bucket `workspace-logos` (public), stored as `logo_url`.
  - Slug — auto-generated from name, editable Input (validated `a-z0-9-`).
  - Primary "Create Workspace" (Button) + secondary "Cancel" (→ `/workspaces`).
- On success: set `orka_active_org` cookie, redirect → `/workspaces/[id]`.

### 3. `/workspaces/[workspaceId]` — Workspace Loading
- Dark full-screen: Avatar/logo + workspace name + spinner + "Preparing your workspace…".
- After ~<1s, `redirect("/dashboard/home")` (or the org's dashboard). Implemented as a server component that validates membership then redirects; the brief loading feel is provided by a client wrapper or immediate redirect. (MVP: validate + redirect; spinner shown only if we add an artificial short delay client-side. Keep simple: server validates membership and redirects; a small client "loading" component is shown during navigation.)

## Backend changes
- **Migration** (`supabase/workspace_type_logo.sql`):
  - `alter table organizations add column type text;` (values: freelancer/agency/studio/consultancy/startup; default null).
  - `alter table organizations add column logo_url text;`
  - Create storage bucket `workspace-logos` (public) + insert policy allowing org members to upload.
- **`app/actions.ts` → `createOrg`**: accept `type`, `slug`, `logo_url` (optional). Insert with these; keep owner membership + cookie + redirect to `/workspaces/[id]`.
- **Selector query** (new server component for `/workspaces`): for each membership, fetch `type`, `logo_url`, projects count, clients count (`clients` table), members count, and `last_active` (max(projects.updated_at) or org.updated_at).

## Rewiring
- `app/onboarding/page.tsx` → `redirect("/workspaces")`.
- Post-login destination → `/workspaces` (update signup/login/auth-callback redirect targets).
- Fallback `redirect("/onboarding...")` calls remain (they now chain to `/workspaces` via the shim).

## Components used (all already present)
`Card`, `Button`, `Avatar`, `Badge`, `Input`, `Label`, `DropdownMenu`, `Dialog` (optional for create instead of /new page — but spec wants /new page, so use a page), `Separator`, `Tooltip` (optional). `select`/`skeleton`/`command` are NOT installed; type uses `DropdownMenu`, loading uses lucide `Loader2`.

## Verification
- `pnpm build` passes (types + lint).
- `pnpm dev` (clean): `/workspaces` lists orgs with real counts/type; create flow adds a typed org and redirects; `/onboarding` redirects to `/workspaces`; selector card hover shows violet border.
- Confirm `/dashboard` still works (fallback chain intact).

## Out of scope (this pass)
- Keyboard shortcuts (⌘K), hover cards, alert dialogs, full skeleton grids, invite/delete flows, billing/branding.
