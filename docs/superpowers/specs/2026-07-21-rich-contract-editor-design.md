# Rich Contract Editor + Proposal Template — Design Spec

**Date:** 2026-07-21
**Status:** Approved

---

## 1. Overview

Two complementary features:

1. **Proposal template** — when a user creates a new proposal they get a static professional agency proposal structure pre-loaded into the BlockNote editor instead of a blank page. All sections are empty — users fill everything manually.

2. **Rich contract editor** — the `projects/[id]/contract` page gets a full BlockNote-powered contract editor mirroring the proposal system. First visit shows a "Generate contract" button; clicking it pulls data from the accepted proposal (title, deliverables, amount, milestones) and stamps a professional contract template, then opens it in the editor. Users can freely edit every clause before signing.

---

## 2. Proposal Template

### Trigger
`ProposalCreate.tsx` — the `useCreateBlockNote()` call currently passes no `initialContent`. We add a static `PROPOSAL_TEMPLATE` array as the initial content.

### Template Structure (8 sections)

All headings are H1. Each section body is an empty paragraph the user fills in.

```
1. Executive Summary
   [empty paragraph]

2. About Us
   [empty paragraph]

3. Scope of Work
   [empty paragraph]

4. Deliverables
   [empty bullet list item]
   [empty bullet list item]

5. Timeline & Milestones
   [empty paragraph]

6. Investment
   [empty paragraph]

7. Terms & Conditions
   [empty paragraph]

8. Next Steps
   [empty paragraph]
```

### Implementation
- Single constant `PROPOSAL_TEMPLATE: PartialBlock[]` defined in `frontend/lib/contractTemplates.ts` (shared file, also houses the contract template).
- Passed as `initialContent` to `useCreateBlockNote({ initialContent: PROPOSAL_TEMPLATE })` in `ProposalCreate.tsx`.
- No DB change needed — blocks are saved on first "Create proposal" click exactly as today.

---

## 3. Contract Editor

### Page States

The contract page (`projects/[id]/contract`) has three states:

| State | Condition | What user sees |
|-------|-----------|----------------|
| **Empty** | No contract blocks saved yet | "Generate contract" CTA + brief explanation |
| **Reader** | Contract exists, not in edit mode | Read-only BlockNote view + header (Edit, Sign buttons) + signing panel |
| **Editor** | User clicked Edit or just generated | Live BlockNote editor + Save/Cancel + signing panel below |

### Generate Contract Flow

1. User clicks "Generate contract"
2. Server action `generateContract({ orgId, projectId })` runs:
   - Fetches the most recent accepted (or latest) `project_proposals` row for this project
   - Stamps `CONTRACT_TEMPLATE` with real data: project name, client name (from org/project), amount, asset, deliverables array, milestone count, today's date
   - Upserts a row in `project_contracts` table with `blocks`, `markdown`, `status: 'draft'`
3. Page reloads — now in Reader state with the pre-filled contract

### Data Model — `project_contracts` table (new)

```sql
create table if not exists public.project_contracts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  blocks jsonb,
  markdown text not null default '',
  status text not null default 'draft',
  -- status: draft | agency_signed | client_signed | complete
  agency_sig text,
  client_sig text,
  agency_signed_at timestamptz,
  client_signed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Signature data moves from `projects` columns (`client_sig`, `freelancer_sig`, `contract_status`) into this table. The existing `ContractDetailView` reads from `projects` — after migration it reads from `project_contracts`.

### Contract Template Structure (10 sections, auto-populated)

```
# Service Agreement

**Date:** {today}
**Project:** {project.name}

## 1. Parties
This agreement is between {org.name} ("Agency") and {client name} ("Client").
[editable paragraph]

## 2. Scope of Services
{deliverables as bullet list, one per line — from proposal.deliverables}

## 3. Project Timeline
This project comprises {milestone_count} milestone(s).
[editable paragraph for dates]

## 4. Payment Terms
Total project value: {amount} {asset}
[editable paragraph for schedule]

## 5. Intellectual Property
Upon receipt of full payment, all work product created under this agreement...
[editable paragraph]

## 6. Confidentiality
Both parties agree to keep confidential all non-public information...
[editable paragraph]

## 7. Revisions & Approval
[editable paragraph]

## 8. Termination
[editable paragraph]

## 9. Governing Law
[editable paragraph]

## 10. Signatures
Agency: _______________     Date: _______________
Client: _______________     Date: _______________
```

Sections 1–4 are pre-filled with real data from proposal. Sections 5–10 contain professional boilerplate that users can edit freely.

### Components (under `contract/components/`)

| File | Role |
|------|------|
| `ContractEmpty.tsx` | Server component — shows "Generate contract" button, calls `generateContract` action |
| `ContractEditor.tsx` | `"use client"` — BlockNote live editor, Save/Cancel header, signing panel below |
| `ContractEditorClient.tsx` | Thin `"use client"` wrapper with `dynamic(..., { ssr: false })` |
| `ContractReader.tsx` | `"use client"` — read-only BlockNote view + Edit button + signing panel |
| `ContractReaderClient.tsx` | Thin `"use client"` wrapper with `dynamic(..., { ssr: false })` |
| `ContractSigningPanel.tsx` | `"use client"` — agency sign button + both sig statuses. Extracted from existing `ContractDetailView`. |

Old `ContractDetailView.tsx` is replaced by the new page.tsx orchestrating these components.

### Server Actions (append to `actions.ts`)

```ts
generateContract({ orgId, projectId }): Promise<ActionResult>
saveContract({ orgId, projectId, blocks }): Promise<ActionResult>
signContractAgency({ orgId, projectId }): Promise<ActionResult>
```

### Signing Flow (unchanged from existing)

1. Agency signs on platform (`signContractAgency`) → `status: 'agency_signed'`, `agency_sig` = wallet hash
2. Client receives portal link → client signs via portal → `status: 'client_signed'` or `'complete'`
3. Both sigs present → workflow advances (handled by Rust indexer for on-chain; off-chain status set by portal action)

Portal action `portalSignContract` added to `app/p/[projectToken]/actions.ts`.

---

## 4. Template Constants File

`frontend/lib/contractTemplates.ts` exports:

```ts
export const PROPOSAL_TEMPLATE: PartialBlock[]   // static, no data
export function buildContractTemplate(data: {
  projectName: string;
  orgName: string;
  clientName: string;
  amount: string;
  asset: string;
  deliverables: string[];
  milestoneCount: number;
  today: string;
}): PartialBlock[]
```

`buildContractTemplate` is a pure function — easy to unit test, no DB calls.

---

## 5. Files Changed / Created

### New files
- `frontend/lib/contractTemplates.ts` — template constants + builder
- `frontend/lib/contractTemplates.test.ts` — unit tests for `buildContractTemplate`
- `frontend/supabase/project_contracts.sql` — new table + RLS
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEmpty.tsx`
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditor.tsx`
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditorClient.tsx`
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReader.tsx`
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReaderClient.tsx`
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractSigningPanel.tsx`

### Modified files
- `frontend/lib/contractTemplates.ts` — (new, see above)
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/page.tsx` — replace `ContractDetailView` with new orchestration
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractDetailView.tsx` — deleted (replaced)
- `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts` — add `generateContract`, `saveContract`, `signContractAgency`
- `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalCreate.tsx` — add `PROPOSAL_TEMPLATE` as `initialContent`
- `frontend/app/p/[projectToken]/actions.ts` — add `portalSignContract`
- `frontend/supabase/portal.sql` — expose contract status + sigs to portal

---

## 6. Constraints

- pnpm only, never npm at root (AGENTS.md)
- No `lib/routes.ts` — inline template literals for all route strings
- Co-located components in `components/` next to `page.tsx`
- `ssr: false` only inside `"use client"` components — same pattern as `ProposalReaderClient.tsx`
- Strict TypeScript; typecheck via `pnpm build`
- Rust indexer remains sole writer of on-chain derived status — `signContractAgency` only writes off-chain `agency_sig` and `status` columns
- All server actions return `{ ok: true } | { ok: false; error: string }`

---

## 7. Out of Scope

- PDF export (future)
- Contract version history (future — can follow proposal version pattern)
- E-signature integration (DocuSign etc.) — current wallet-sig approach stays
- UI polish pass — functional first, polish after
