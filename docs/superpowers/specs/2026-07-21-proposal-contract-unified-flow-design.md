# Unified Proposal & Contract Flow — Design Spec

**Date:** 2026-07-21
**Status:** Approved

---

## 1. Overview

Three changes to make the proposals and contracts pages structurally identical:

1. **Proposals empty state** — replace the direct editor open with an empty state + create button (mirrors contracts)
2. **Proposals signing panel** — add signature tracking + signing panel (mirrors contracts)
3. **Contracts versioning** — add version history table + panel (mirrors proposals)

---

## 2. Proposals Empty State

### Current behavior
`proposals/page.tsx` renders `<ProposalCreate>` inline when no `project_proposals` row exists. The user lands directly in edit mode with the template.

### Desired behavior
Show a centered empty state CTA ("No proposal yet" / "Create proposal"). Clicking creates the proposal (with template blocks) and refreshes to the reader.

### Components

| File | Role |
|------|------|
| `ProposalEmpty.tsx` | `"use client"` — shows CTA, calls `createProposal` action, then `router.refresh()` |
| No change to `ProposalCreate.tsx` | Still used — but now mounted after the row exists (reader → edit flow) |
| `proposals/page.tsx` | No proposal → render `<ProposalEmpty>` instead of `<ProposalCreate>` |

### New server action: `createProposal`
```ts
createProposal({ orgId, projectId }): Promise<ActionResult>
```
- Inserts a `project_proposals` row with `blocks` from `PROPOSAL_TEMPLATE`, title "Untitled proposal", status "draft"
- Returns `{ ok: true }`

### Data flow
```
page.tsx: no proposal?
  → <ProposalEmpty projectId={id} orgId={org.id} />
  → user clicks "Create proposal"
  → createProposal({ orgId, projectId })
  → router.refresh()
  → page re-renders, finds proposal → <ProposalReader>
```

### Page query update
`proposals/page.tsx` select adds `agency_sig, client_sig, agency_signed_at, client_signed_at`.
`ProposalReader.tsx` type and props extended with these fields.

---

## 3. Proposals Signing Panel

### SQL migration: `project_proposals` alter
Add to `frontend/supabase/project_proposals.sql`:
```sql
alter table public.project_proposals add column if not exists agency_sig text;
alter table public.project_proposals add column if not exists client_sig text;
alter table public.project_proposals add column if not exists agency_signed_at timestamptz;
alter table public.project_proposals add column if not exists client_signed_at timestamptz;
```

### Components

| File | Role |
|------|------|
| `ProposalSigningPanel.tsx` | Copy of `ContractSigningPanel.tsx` — shows agency/client sig status + sign button |

### New server actions (appended to `actions.ts`)
```ts
signProposalAgency({ orgId, projectId }): Promise<ActionResult>
```
- Sets `agency_sig = user.id`, `agency_signed_at = now()`, `status = 'sent'`
- Also ensures `shared_token` exists (same as current `sendProposal`)
- Effectively replaces the standalone "Send to client" action — signing IS sending

Modified: `portalAcceptProposal` in `app/p/[projectToken]/actions.ts`
- Also writes `client_sig` and `client_signed_at`

### Display
`ProposalReader.tsx` renders `<ProposalSigningPanel>` below the BlockNote content, same position as contracts.

---

## 4. Contracts Versioning

### New table: `contract_versions`
`frontend/supabase/contract_versions.sql`:
```sql
create table if not exists public.contract_versions (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.project_contracts(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  version_no int not null,
  blocks jsonb not null,
  markdown text not null default '',
  created_at timestamptz not null default now()
);
alter table public.contract_versions enable row level security;
create policy "contract_versions_org" on public.contract_versions
  for all using (public.auth_is_org_member(org_id))
  with check (public.auth_is_org_member(org_id));
```

### Modified: `saveContract` action
After updating `project_contracts`, query the ID via `project_id` + `org_id`, compute `version_no = (max + 1)`, and insert a `contract_versions` row — same pattern as `saveProposal`.

### New server actions
```ts
restoreContractVersion({ orgId, projectId, versionId }): Promise<ActionResult>
```
- Copies the version's `blocks`/`markdown` back to `project_contracts` as a new version

### Components

| File | Role |
|------|------|
| `ContractVersionsPanel.tsx` | Copy of `ProposalVersionsPanel.tsx` — lists versions, view/restore |

### Display
`ContractReader.tsx` gets a "Versions" button in the header (same as proposals). Opens `<ContractVersionsPanel>` as a side panel overlay.

---

## 5. Files Changed

### New files
- `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalEmpty.tsx`
- `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalSigningPanel.tsx`
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractVersionsPanel.tsx`
- `frontend/supabase/contract_versions.sql`

### Modified files
- `frontend/app/(app)/w/[slug]/projects/[id]/proposals/page.tsx` — render `<ProposalEmpty>` on no proposal
- `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalReader.tsx` — add signing panel
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReader.tsx` — add versions button + panel
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditor.tsx` — finish with `router.refresh()` (align with proposal pattern)
- `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts` — add `createProposal`, `signProposalAgency`, `restoreContractVersion`; update `saveContract`
- `frontend/app/p/[projectToken]/actions.ts` — update `portalAcceptProposal` to write client sig
- `frontend/lib/proposalBlocks.ts` — ensure `blocksToMarkdown` is importable from actions (already is)
- `frontend/supabase/project_proposals.sql` — migration for sig columns

---

## 6. Constraints

- Approach B (component duplication) — signing panel and versions panel are copied per page, not shared
- All server actions return `{ ok: true } | { ok: false; error: string }`
- pnpm only, never npm at root
- Co-located components in `components/` next to `page.tsx`
- `ssr: false` only inside `"use client"` components via `dynamic()`
- Template constants live in `contractTemplates.ts` (already set)
- TypeScript strict; typecheck via `pnpm build`
