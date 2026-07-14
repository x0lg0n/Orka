# Onboarding: Real Organizations + Create Modal

**Date:** 2026-07-14
**Status:** Approved (design)

## Goal

Replace the hardcoded demo organizations on `frontend/app/onboarding/page.tsx`
with the signed-in user's **real** organizations fetched from Supabase, and
replace the hidden "New organization" submit with a proper **modal dialog**
that captures a real workspace name.

Approach: keep `onboarding/page.tsx` as a Server Component that fetches data;
extract a small client component `CreateOrgModal` that opens a modal and
submits the existing `createOrg` server action. No new backend code.

## Current state (problems)

- `onboarding/page.tsx` renders a static `organizations` array of fake orgs.
- The "Create new" form submits a hidden `name="New organization"` — the user
  can never name their workspace.
- No empty state for a user who has not created any org yet.
- All data is mocked, so the page does not reflect reality.

## Data layer (already exists — reuse)

- `organizations(id, name, slug, created_at, updated_at)`
- `organization_members(org_id, user_id, role, created_at)` — `role`:
  `'owner' | 'admin' | 'member'`
- RLS: `org_members_read` / `members_read_roster` scope reads to org members.
- `createOrg` server action (`app/actions.ts:72`) inserts `organizations`
  (`{ name }`) + the `organization_members` owner row, then redirects to
  `/dashboard/projects`. On error it redirects to `/onboarding?error=...`.

## Design

### 1. Real data (Server Component)

In `onboarding/page.tsx`, after the `getUser()` auth check, fetch:

```ts
const { data: orgs } = await supabase
  .from("organization_members")
  .select("role, organizations(id, name, slug, created_at)")
  .eq("user_id", user.id);
```

Reshape into a typed list `{ id, name, slug, role, createdAt }`. Remove the
hardcoded `organizations` array. Keep the existing radial-gradient background
and dark/violet theme.

### 2. Org grid

Render one card per real org:
- Name (`org.name`)
- Role badge: `Owner` / `Admin` / `Member` derived from `org.role`, styled
  with the existing badge classes.
- "Enter workspace" link → `/dashboard/projects` (unchanged behavior).
- Hover/active state, focus-visible ring.

### 3. Empty state

When `orgs.length === 0`, render a first-run panel: heading "Create your
first workspace", short supporting copy, and a prominent Create button that
opens the modal. No fake org cards.

### 4. Create modal (new client component)

New file: `frontend/app/onboarding/_components/CreateOrgModal.tsx`
(`"use client"`).

- A trigger (the existing "New organization" card, or the empty-state button)
  opens the modal.
- Modal contains: a heading, a **name text input** (no hidden hardcoded value),
  Cancel, and a Create button.
- Submit calls the existing `createOrg` server action (passed in or imported).
- Create button shows a loading state via `useFormStatus`.
- Accessible: `Escape` to close, focus the input on open, `aria-modal`,
  click-outside to close.
- On success `createOrg` redirects to `/dashboard/projects`. On error it
  redirects to `/onboarding?error=...`; the page already renders that banner
  behind the modal (consistent with the app's redirect-style error handling).

### 5. Slug generation

In `createOrg` (`app/actions.ts`), derive `slug` from the provided name
(e.g. `name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")` with a
fallback) and insert it alongside `name`. Slug column is unique but nullable,
so a collision just means no slug rather than a hard failure.

### 6. Visual polish

- Consistent card spacing/typography with the rest of the app.
- Modal styled to match the dark/violet theme (rounded, bordered, blurred
  backdrop).
- Focus ring on the input; disabled Create while the field is empty.

## Files changed

- `frontend/app/onboarding/page.tsx` — fetch real orgs, render grid/empty
  state, wire modal trigger.
- `frontend/app/onboarding/_components/CreateOrgModal.tsx` — new client
  component.
- `frontend/app/actions.ts` — `createOrg` adds slug generation (small edit).

## Out of scope

- Editing/deleting orgs, member invites (existing `inviteMember` action is
  separate).
- Real Stellar/on-chain wiring (mocked per MVP).
- Profile/settings changes.

## Testing / verification

- Sign in, open `/onboarding`: only real orgs appear (or empty state).
- Create an org via modal with a real name → lands on `/dashboard/projects`
  and the new org persists (re-open onboarding to confirm).
- Empty input cannot submit; `Escape`/cancel closes the modal.
- `pnpm build` passes (type check) and `pnpm lint` is clean.
