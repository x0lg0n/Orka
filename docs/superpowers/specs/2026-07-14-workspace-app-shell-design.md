# Workspace App Shell + Settings (edit/delete) — Design

**Date:** 2026-07-14
**Status:** Approved (design)
**Depends on:** `2026-07-14-workspace-experience-design.md` (Workspace selector + create + `/workspaces` routing), shadcn shell rebuild.

---

## 1. Goal

Give each workspace (`organizations` row) its own in-app home with a left sidebar
(**Dashboard, Team, Integrations, Usage, Billing, Settings**) so a user can manage a
specific workspace. The **Settings** section is the only fully-built area in this pass:
it lets the **workspace owner** edit workspace details and delete the workspace.

The **Workspace Dashboard** is a *new* page and is intentionally **distinct** from the
**main dashboard** at `/dashboard/home`. The main dashboard is NOT relocated, redirected,
or touched by this work.

### Decisions locked with the user
- **Permissions:** owner-only for both edit and delete.
- **Placement:** a per-workspace app shell reached via `/workspaces/[id]`; the existing
  global `/dashboard` stays separate.
- **Scope:** full shell + Settings now; team/integrations/usage/billing are stubs.

---

## 2. Routing & structure

```
app/workspaces/[workspaceId]/
  layout.tsx            # membership check, set active-org cookie, render WorkspaceSidebar + content
  page.tsx              # Workspace Dashboard (NEW, distinct from main /dashboard/home)
  settings/
    page.tsx            # edit form + danger zone (owner-only)
  team/page.tsx         # stub
  integrations/page.tsx # stub
  usage/page.tsx        # stub
  billing/page.tsx      # stub
```

- `app/workspaces/[workspaceId]/layout.tsx`
  - Resolves `workspaceId`, verifies the current user is a member
    (`auth_is_org_member`). If not a member → `redirect("/workspaces")`.
  - Sets the active-org cookie to `workspaceId` (keeps dashboard/sidebar in sync).
  - Renders `<WorkspaceSidebar>` + a `<main>` content slot.
- `app/workspaces/[workspaceId]/page.tsx` (index) = **Workspace Dashboard**:
  org header (logo / name / type badge), stat cards (projects, clients, members),
  and a recent-items list. Fetched server-side (counts from existing tables).
- The previously-built `app/workspaces/[workspaceId]/_components/WorkspaceLoading.tsx`
  and its loading `page.tsx` are **removed** — the index is now a real page, no spinner jump.
- `app/dashboard/*` (main dashboard) is **untouched**.

### Sidebar nav targets
| Item | Route | Built? |
|------|-------|--------|
| Dashboard | `/workspaces/[id]` | Yes (workspace overview) |
| Team | `/workspaces/[id]/team` | Stub |
| Integrations | `/workspaces/[id]/integrations` | Stub |
| Usage | `/workspaces/[id]/usage` | Stub |
| Billing | `/workspaces/[id]/billing` | Stub |
| Settings | `/workspaces/[id]/settings` | Yes (edit/delete) |

---

## 3. Workspace sidebar shell

- New `components/workspace/WorkspaceSidebar.tsx` (desktop, fixed left rail,
  `bg-sidebar`, ORKA tokens — same look as the rebuilt global shell).
- Top: existing `WorkspaceSwitcher` (switch org / "Manage workspaces" → `/workspaces`).
- Nav items use shadcn `Button asChild` with active highlight
  (`bg-hover` token) based on `usePathname()`.
- Bottom: user card (`Avatar` + name/email) + `SignOutButton`.
- Mobile: a `Sheet` drawer (reuse the pattern from `components/shell/MobileNav.tsx`),
  toggled by a hamburger in the workspace top bar.
- Dark theme throughout; hovers hardened with `dark:hover`/`dark:focus` tokens.

---

## 4. Settings page (core deliverable) — owner-only

Server component `app/workspaces/[workspaceId]/settings/page.tsx`:
- Fetch the org row (`getSupabase()`) + the viewer's `organization_members.role`.
- If `role !== 'owner'`: render a **read-only** view (details shown, no edit/delete
  controls) with a small "Only the owner can change these settings" note.
- If owner: render the edit form + danger zone.

### Edit form (client component `_components/EditWorkspaceForm.tsx`)
Fields:
- **Name** — `Input`.
- **Slug** — `Input`, auto-derived from name on first edit, then freely editable.
  Validated unique-ish (kept simple; DB `slug` is `unique` but nullable).
- **Type** — shadcn `DropdownMenu` over the `Workspace` types
  (STUDIO / AGENCY / FREELANCER / CLIENT), matching `workspace.md` `WorkspaceType`.
- **Logo** — file `Input`; on select, show an immediate `Avatar`/`img` preview;
  upload happens on submit (best-effort deletes the previous object in the
  `workspace-logos` bucket).
- Submit → `updateOrg({ id, name, slug, type, logo })`.

### Danger zone — Delete (client component `_components/DeleteWorkspaceDialog.tsx`)
- shadcn `Dialog` opened by a destructive `Button`.
- Requires typing the workspace **name** into a confirm `Input` to enable the
  final delete `Button` (typed confirmation, prevents accidental deletes).
- On confirm → `deleteOrg(id)`.
- Because `organizations` cascades to projects/milestones/invoices/ledger/disputes/
  proposals, deletion wipes all workspace data — this is surfaced as a warning in
  the dialog copy.

### Server actions (added to `app/actions.ts`)
- `updateOrg({ id, name, slug, type, logo })` — `"use server"`:
  - Verify ownership via `auth_is_org_owner(id)`; if false → throw / redirect.
  - If a new logo file is present, upload to `workspace-logos/<id>/logo.<ext>`
    (service-role client), optionally remove the prior object.
  - `update` the `organizations` row (name, slug, type, logo_url).
  - `revalidatePath("/workspaces")` + `revalidatePath("/workspaces/[workspaceId]")`.
- `deleteOrg(id)` — `"use server"`:
  - Verify ownership; if false → throw / redirect.
  - `delete` the `organizations` row via service-role client (DB cascade removes
    children).
  - If the active-org cookie equals `id`, clear it.
  - `redirect("/workspaces")`.

---

## 5. RLS / data-model changes (owner-only enforcement)

New migration `frontend/supabase/workspace_owner_rls.sql`:
- New function `auth_is_org_owner(org uuid) returns boolean` (SECURITY DEFINER,
  `stable`, `search_path = public`) checking
  `exists (select 1 from organization_members where org_id = org and user_id = auth.uid() and role = 'owner')`.
- Replace the existing any-member `org_members_update` policy on `organizations`
  with an **owner-only** update policy:
  `for update using (public.auth_is_org_owner(id))`.
- Add an **owner-only** delete policy on `organizations`
  (none exists today, so deletion is currently impossible via RLS):
  `for delete using (public.auth_is_org_owner(id))`.
- Insert policy (`authenticated_create_org`) is unchanged; read policy unchanged.

> Note: tightening update to owner-only is a behavior change from the prior
> any-member policy, and matches the user's "owner only" decision.

---

## 6. Stub sections

`team`, `integrations`, `usage`, `billing` each render a centered shadcn `Card`
with a title + "Coming soon" body so the sidebar nav is complete and consistent.
They are intentionally inert (no data fetching) in this pass.

---

## 7. Components / files touched

**New**
- `app/workspaces/[workspaceId]/layout.tsx`
- `app/workspaces/[workspaceId]/page.tsx` (Workspace Dashboard)
- `app/workspaces/[workspaceId]/settings/page.tsx`
- `app/workspaces/[workspaceId]/settings/_components/EditWorkspaceForm.tsx`
- `app/workspaces/[workspaceId]/settings/_components/DeleteWorkspaceDialog.tsx`
- `app/workspaces/[workspaceId]/{team,integrations,usage,billing}/page.tsx` (stubs)
- `components/workspace/WorkspaceSidebar.tsx`
- `frontend/supabase/workspace_owner_rls.sql`

**Modified**
- `app/actions.ts` — add `updateOrg`, `deleteOrg`.
- `app/workspaces/[workspaceId]/page.tsx` — replace loading screen with real dashboard
  (or remove the old loading page and use the index as the dashboard).

**Removed**
- `app/workspaces/[workspaceId]/_components/WorkspaceLoading.tsx` (superseded).

**Untouched**
- `app/dashboard/*` (main dashboard), global shell (`components/shell/*`),
  `/workspaces` selector, `/workspaces/new` create flow.

---

## 8. Out of scope (stubs to fill later)
- Real team management (invite / remove members, role changes).
- Real integrations, usage metrics, billing.
- Robust logo storage cleanup / image optimization (best-effort only).
- Admin (non-owner) edit permission — explicitly deferred; owner-only per decision.

---

## 9. Verification
- `pnpm build` clean (type-check + lint via Next).
- Manual dev check (Supabase env set):
  - `/workspaces/[id]` renders sidebar + workspace dashboard; non-members redirect to `/workspaces`.
  - Owner: edit name/type/logo/slug → persists; `/workspaces` reflects change.
  - Owner: delete with typed confirmation → cascade delete → lands on `/workspaces`.
  - Non-owner: Settings is read-only, no edit/delete controls; direct `updateOrg`/
    `deleteOrg` calls are rejected server-side.
  - Stub sections render placeholders.
  - Main `/dashboard/home` still works and is unaffected.
- Run `frontend/supabase/workspace_owner_rls.sql` in Supabase before edit/delete work
  against a real DB (same prerequisite pattern as the type/logo migration).
