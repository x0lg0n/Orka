# Unified Proposal & Contract Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make proposals and contracts pages structurally identical — empty state + signing panel for proposals, versioning for contracts.

**Architecture:** Duplicate (approach B) — signing panel and versions panel are copied per page, not shared. Server actions accept `orgId` from the page (no `resolveOrgId`). All actions return `{ ok: true } | { ok: false, error: string }`.

**Tech Stack:** Next.js 16 App Router, TypeScript strict, BlockNote, Supabase, pnpm

## Global Constraints

- pnpm only, never npm at root
- Co-located components in `components/` next to `page.tsx`
- `ssr: false` only inside `"use client"` components via `dynamic()`
- Template constants in `contractTemplates.ts`
- All server actions return `{ ok: true } | { ok: false, error: string }`
- TypeScript strict; typecheck via `pnpm build`

---

### Task 1: SQL — proposal sig columns + contract_versions table

**Files:**
- Modify: `frontend/supabase/project_proposals.sql`
- Create: `frontend/supabase/contract_versions.sql`
- Test: N/A (manual SQL apply)

**Interfaces:**
- Produces: `project_proposals` gains `agency_sig text, client_sig text, agency_signed_at timestamptz, client_signed_at timestamptz`
- Produces: `contract_versions` table with columns `id uuid, contract_id uuid, org_id uuid, version_no int, blocks jsonb, markdown text, created_at timestamptz`

- [ ] **Step 1: Write migration for proposal sig columns**

Add to `frontend/supabase/project_proposals.sql` (new block at end of file):

```sql
-- Proposal signature columns (mirrors project_contracts)
alter table public.project_proposals add column if not exists agency_sig text;
alter table public.project_proposals add column if not exists client_sig text;
alter table public.project_proposals add column if not exists agency_signed_at timestamptz;
alter table public.project_proposals add column if not exists client_signed_at timestamptz;
```

- [ ] **Step 2: Write contract_versions.sql**

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

- [ ] **Step 3: Commit**

```bash
git add frontend/supabase/project_proposals.sql frontend/supabase/contract_versions.sql
git commit -m "feat: add proposal sig columns + contract_versions table"
```

---

### Task 2: Proposals empty state

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalEmpty.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/page.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts`

**Interfaces:**
- Consumes: `generateContract` pattern for reference (empty state → action → refresh)
- Produces: `createProposal({ orgId, projectId })` action, `ProposalEmpty` component

- [ ] **Step 1: Write `ProposalEmpty` component**

`frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalEmpty.tsx`:

```tsx
"use client";
import { useState } from "react";
import { FileText } from "lucide-react";
import { createProposal } from "../../actions";

export function ProposalEmpty({
  projectId,
  orgId,
}: {
  projectId: string;
  orgId: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setBusy(true);
    setError(null);
    const res = await createProposal({ projectId, orgId });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center">
      <div className="mb-4 rounded-full bg-violet-50 p-4">
        <FileText className="h-8 w-8 text-violet-500" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        No proposal yet
      </h2>
      <p className="mb-6 max-w-sm text-sm text-gray-500">
        Create a professional proposal pre-filled with a structured template.
        You can edit every section before sending to your client.
      </p>
      <button
        onClick={handleCreate}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
      >
        <FileText className="h-4 w-4" />
        {busy ? "Creating…" : "Create proposal"}
      </button>
      {error && (
        <p className="mt-3 max-w-sm text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add `createProposal` action to `actions.ts`**

Append before `sendProposal`:

```typescript
export async function createProposal(input: {
  projectId: string;
  orgId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const blocks = PROPOSAL_TEMPLATE as unknown[];
    const markdown = blocksToMarkdown(blocks);

    const { error } = await supabase.from("project_proposals").insert({
      org_id: input.orgId,
      project_id: input.projectId,
      title: "Untitled proposal",
      blocks,
      markdown,
      tags: [],
      status: "draft",
    });
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "createProposal failed",
    };
  }
}
```

Need to add the import at the top if not already there:
```typescript
import { PROPOSAL_TEMPLATE } from "@/lib/contractTemplates";
```

Check the imports — `blocksToMarkdown` and `PROPOSAL_TEMPLATE` should already be imported. If `PROPOSAL_TEMPLATE` is not imported, add it.

- [ ] **Step 3: Update `proposals/page.tsx`**

Replace the direct `<ProposalCreate>` render with `<ProposalEmpty>`:

```tsx
import { ProposalEmpty } from "./components/ProposalEmpty";

// In the page render, change:
if (!proposal) {
    return <ProposalCreate projectId={id} />;
}
// To:
if (!proposal) {
    return <ProposalEmpty projectId={id} orgId={org.id} />;
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposals/components/ProposalEmpty.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposals/page.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/actions.ts
git commit -m "feat: proposals empty state with create flow"
```

---

### Task 3: Proposals signing panel

**Files:**
- Copy: `ContractSigningPanel.tsx` → `ProposalSigningPanel.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/page.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalReader.tsx`

**Interfaces:**
- Consumes: `project_proposals.agency_sig, client_sig` columns (from Task 1)
- Produces: `signProposalAgency({ orgId, projectId })` action

- [ ] **Step 1: Copy `ContractSigningPanel` → `ProposalSigningPanel`**

Copy `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractSigningPanel.tsx` to `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalSigningPanel.tsx`.

Replace the import and action call:
- Change `import { signContractAgency } from "../../actions"` → `import { signProposalAgency } from "../../actions"`
- Change `const res = await signContractAgency({ projectId, orgId })` → `const res = await signProposalAgency({ projectId, orgId })`
- The component props stay the same: `projectId, orgId, agencySig, clientSig, status, onSigned`

- [ ] **Step 2: Add `signProposalAgency` action to `actions.ts`**

```typescript
export async function signProposalAgency(input: {
  projectId: string;
  orgId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const sig = user?.id ?? "signed";

    const { error } = await supabase
      .from("project_proposals")
      .update({
        agency_sig: sig,
        agency_signed_at: new Date().toISOString(),
        status: "sent",
      })
      .eq("project_id", input.projectId)
      .eq("org_id", input.orgId)
      .eq("status", "draft");
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "signProposalAgency failed",
    };
  }
}
```

- [ ] **Step 3: Update `proposals/page.tsx` to fetch sig fields**

Add `agency_sig, client_sig, agency_signed_at, client_signed_at` to the select:

```tsx
.select("id, title, blocks, tags, status, markdown, updated_at, agency_sig, client_sig")
```

- [ ] **Step 4: Update `ProposalReader.tsx` type, add `orgId` prop, pass sigs to signing panel**

Add `orgId` to the component props:
```tsx
type Props = {
  slug: string;
  projectId: string;
  orgId: string;
  proposal: Proposal;
};
```

Update the function signature:
```tsx
export function ProposalReader({ slug, projectId, orgId, proposal }: Props) {
```

Extend the `Proposal` type:
```tsx
type Proposal = {
  id: string;
  title: string;
  blocks: unknown[];
  tags: string[];
  status: string;
  markdown: string;
  agency_sig?: string | null;
  client_sig?: string | null;
};
```

Import the signing panel:
```tsx
import { ProposalSigningPanel } from "./ProposalSigningPanel";
```

Render it below the BlockNote content (after the `</div>` closing the content card):
```tsx
<ProposalSigningPanel
  projectId={projectId}
  orgId={orgId}
  agencySig={proposal.agency_sig ?? null}
  clientSig={proposal.client_sig ?? null}
  status={proposal.status}
  onSigned={() => { location.reload(); }}
/>
```

- [ ] **Step 5: Update `proposals/page.tsx` to pass `orgId` to reader**

Add `orgId={org.id}` to the `<ProposalReader>` component.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposals/components/ProposalSigningPanel.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposals/components/ProposalReader.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/proposals/page.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/actions.ts
git commit -m "feat: proposals signing panel"
```

---

### Task 4: Contracts versioning

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractVersionsPanel.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReader.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditor.tsx`

**Interfaces:**
- Consumes: `contract_versions` table (from Task 1)
- Produces: `restoreContractVersion({ orgId, projectId, versionId })` action

- [ ] **Step 1: Add `nextContractVersionNo` helper and update `saveContract`**

Add a helper function in `actions.ts` (near `nextVersionNo`):

```typescript
async function nextContractVersionNo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contractId: string
): Promise<number> {
  const { data } = await supabase
    .from("contract_versions")
    .select("version_no")
    .eq("contract_id", contractId)
    .order("version_no", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data?.version_no as number) ?? 0) + 1;
}
```

Update `saveContract` to insert a version after the update:

```typescript
export async function saveContract(input: {
  projectId: string;
  orgId: string;
  blocks: unknown[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();

    const markdown = blocksToMarkdown(input.blocks);

    const { error } = await supabase
      .from("project_contracts")
      .update({ blocks: input.blocks, markdown, updated_at: new Date().toISOString() })
      .eq("project_id", input.projectId)
      .eq("org_id", input.orgId);
    if (error) throw new Error(error.message);

    // Get contract ID for version insert
    const { data: contract } = await supabase
      .from("project_contracts")
      .select("id")
      .eq("project_id", input.projectId)
      .eq("org_id", input.orgId)
      .maybeSingle();
    if (contract) {
      const versionNo = await nextContractVersionNo(supabase, contract.id as string);
      const { error: vErr } = await supabase.from("contract_versions").insert({
        contract_id: contract.id,
        org_id: input.orgId,
        version_no: versionNo,
        blocks: input.blocks,
        markdown,
      });
      if (vErr) throw new Error(vErr.message);
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "saveContract failed",
    };
  }
}
```

- [ ] **Step 2: Add `restoreContractVersion` action**

```typescript
export async function restoreContractVersion(input: {
  orgId: string;
  projectId: string;
  versionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const orgId = await resolveOrgId(supabase, input.projectId);
    if (!orgId) throw new Error("Project org not found");

    const { data: ver, error: vErr } = await supabase
      .from("contract_versions")
      .select("contract_id, blocks, markdown")
      .eq("id", input.versionId)
      .single();
    if (vErr || !ver) throw new Error(vErr?.message ?? "version not found");

    const { error: uErr } = await supabase
      .from("project_contracts")
      .update({ blocks: ver.blocks, markdown: ver.markdown })
      .eq("id", ver.contract_id)
      .eq("org_id", orgId);
    if (uErr) throw new Error(uErr.message);

    const versionNo = await nextContractVersionNo(supabase, ver.contract_id as string);
    const { error: iErr } = await supabase.from("contract_versions").insert({
      contract_id: ver.contract_id,
      org_id: orgId,
      version_no: versionNo,
      blocks: ver.blocks,
      markdown: ver.markdown as string,
    });
    if (iErr) throw new Error(iErr.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "restoreContractVersion failed",
    };
  }
}
```

- [ ] **Step 3: Create `ContractVersionsPanel`**

Copy `ProposalVersionsPanel.tsx` to `contract/components/ContractVersionsPanel.tsx`.

Changes:
- Import `restoreContractVersion` from `"../../actions"` (same path)
- Query `contract_versions` instead of `proposal_versions`
- Filter by `contract_id` instead of `proposal_id`
- Remove `ProposalDiff` import and compare feature (contracts don't need diff yet — keep it simple)
- Keep the rest: side panel overlay, version list, restore button

```tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, RotateCcw } from "lucide-react";
import { restoreContractVersion } from "../../actions";

type Version = {
  id: string;
  version_no: number;
  markdown: string;
  created_at: string;
};

export function ContractVersionsPanel({
  projectId,
  contractId,
  onClose,
}: {
  projectId: string;
  contractId: string;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("contract_versions")
        .select("id, version_no, markdown, created_at")
        .eq("contract_id", contractId)
        .order("version_no", { ascending: false });
      if (data) setVersions(data as Version[]);
    })();
  }, [contractId]);

  async function onRestore(id: string) {
    setBusy(true);
    await restoreContractVersion({ orgId: "", projectId, versionId: id });
    setBusy(false);
    location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-auto bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Version history</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <ul className="mt-3 space-y-2">
          {versions.map((v) => (
            <li key={v.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">v{v.version_no}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onRestore(v.id)} disabled={busy} className="text-xs text-gray-600 hover:underline disabled:opacity-50">
                    <RotateCcw className="inline h-3 w-3" /> Restore
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(v.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Update `ContractReader.tsx`**

Add `contractId` to the Props and fetch it from the page data.

Actually, the page and reader need to pass the contract ID. Let me trace the data flow:

1. `contract/page.tsx` selects `"id, blocks, markdown, status, agency_sig, client_sig"` — `id` is already fetched!
2. But `ContractReaderClient` and `ContractReader` don't receive `contractId`.

Add `contractId` to `ContractReader`:
```tsx
type Props = {
  slug: string;
  projectId: string;
  contractId: string;
  orgId: string;
  blocks: unknown[];
  ...
};
```

Update `ContractReader`:
```tsx
export function ContractReader({ slug, projectId, contractId, orgId, blocks, ... }: Props) {
  const [showVersions, setShowVersions] = useState(false);
  // ...
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        {/* ... */}
        <button onClick={() => setShowVersions(true)} className="...">
          <History className="h-4 w-4" /> Versions
        </button>
      </div>
      {/* ... */}
      {showVersions && (
        <ContractVersionsPanel
          projectId={projectId}
          contractId={contractId}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
}
```

Import `History` from `lucide-react` and `ContractVersionsPanel` from `./ContractVersionsPanel`.

Update `contract/page.tsx` to pass `contractId`:
```tsx
const { data: contract } = await supabase
    .from("project_contracts")
    .select("id, blocks, markdown, status, agency_sig, client_sig")
    ...
return (
    <ContractReaderClient
      slug={slug}
      projectId={id}
      contractId={contract.id as string}
      orgId={org.id}
      ...
    />
);
```

Update `ContractReaderClient.tsx` — no change needed (dynamic import passes props through).

- [ ] **Step 5: Update `ContractEditor` to finish with `router.refresh()`**

In `ContractEditor.tsx`, change the `onDone` callback to also call `router.refresh()`:

Currently:
```tsx
onDone={() => { setEditing(false); router.refresh(); }}
```

This is already correct. No change needed.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/contract/components/ContractVersionsPanel.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/contract/components/ContractReader.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/contract/page.tsx frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/actions.ts
git commit -m "feat: contract versioning with versions panel"
```

---

### Task 5: Portal — update `portalAcceptProposal` to write client sig

**Files:**
- Modify: `frontend/app/p/[projectToken]/actions.ts`

- [ ] **Step 1: Update `portalAcceptProposal` to record client sig**

```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
const sig = user?.id ?? "portal-accepted";

const { error } = await supabase
  .from("project_proposals")
  .update({
    status: "accepted",
    accepted_at: new Date().toISOString(),
    client_sig: sig,
    client_signed_at: new Date().toISOString(),
  })
  .eq("project_id", project.id);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/app/p/\[projectToken\]/actions.ts
git commit -m "feat: portal accept proposal writes client_sig"
```

---

## Verification

After all tasks complete:

1. `cd frontend && pnpm build` — no type errors
2. Run the dev server: `pnpm dev`
3. Test proposals page: navigate to a project with no proposal → see empty state → click Create → see template → edit → save → see version created
4. Test proposals signing: click Send/Sign → check `agency_sig` populated in DB
5. Test contracts generation: navigate to a project contract page → click Generate → see contract appear
6. Test contracts versioning: edit contract → save → check `contract_versions` row created
7. Test portal: accept proposal → check `client_sig` populated
