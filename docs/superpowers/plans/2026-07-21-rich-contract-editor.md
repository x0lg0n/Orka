# Rich Contract Editor + Proposal Template — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a professional pre-filled template to ProposalCreate, and build a full BlockNote-powered contract editor at `projects/[id]/contract` with a "Generate contract" button that stamps a contract template from accepted proposal data.

**Architecture:** A `contractTemplates.ts` lib exports a static `PROPOSAL_TEMPLATE` and a `buildContractTemplate(data)` pure function. `ProposalCreate` gets the proposal template as `initialContent`. The contract route gets a new `project_contracts` table; `page.tsx` orchestrates three states (empty → editor → reader) using co-located components that mirror the proposal system's SSR-safe `dynamic(..., { ssr: false })` pattern.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React, TypeScript strict, Supabase Postgres + RLS, BlockNote (`@blocknote/core` `@blocknote/react` `@blocknote/mantine`), pnpm.

## Global Constraints

- Use **pnpm** everywhere; never `npm install` at the repo root.
- No `lib/routes.ts` — route strings are inline template literals.
- Co-located components in `components/` next to `page.tsx`, imported via relative `./components/...`.
- `ssr: false` only inside `"use client"` components — same pattern as `ProposalReaderClient.tsx`.
- All server actions return `{ ok: true; ... } | { ok: false; error: string }`.
- Rust indexer is the sole writer of on-chain derived status; `signContractAgency` only writes off-chain `agency_sig` column.
- Typecheck via `pnpm build`; no separate `typecheck` script.
- Strict TypeScript; `moduleResolution: "bundler"`.

---

## File Map

**New files:**
- `frontend/lib/contractTemplates.ts` — `PROPOSAL_TEMPLATE` constant + `buildContractTemplate(data)` pure function
- `frontend/lib/contractTemplates.test.ts` — vitest unit tests for `buildContractTemplate`
- `frontend/supabase/project_contracts.sql` — new table + RLS
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEmpty.tsx` — server component: "Generate contract" CTA
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditor.tsx` — `"use client"` BlockNote live editor
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditorClient.tsx` — thin `"use client"` `dynamic(ssr:false)` wrapper
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReader.tsx` — `"use client"` read-only BlockNote view
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReaderClient.tsx` — thin `"use client"` `dynamic(ssr:false)` wrapper
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractSigningPanel.tsx` — `"use client"` signing UI

**Modified files:**
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/page.tsx` — replace `ContractDetailView` with new orchestration
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractDetailView.tsx` — deleted
- `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts` — add `generateContract`, `saveContract`, `signContractAgency`
- `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalCreate.tsx` — add `PROPOSAL_TEMPLATE` as `initialContent`

---

## Task 1: Template library — `contractTemplates.ts` (TDD)

**Files:**
- Create: `frontend/lib/contractTemplates.ts`
- Create: `frontend/lib/contractTemplates.test.ts`

**Interfaces:**
- Produces:
  - `PROPOSAL_TEMPLATE: PartialBlock[]` — static array, exported constant
  - `buildContractTemplate(data: ContractTemplateData): PartialBlock[]` — pure function
  - `type ContractTemplateData = { projectName: string; orgName: string; clientName: string; amount: string; asset: string; deliverables: string[]; milestoneCount: number; today: string; }`

- [ ] **Step 1: Write the failing tests**

```ts
// frontend/lib/contractTemplates.test.ts
import { describe, it, expect } from "vitest";
import { PROPOSAL_TEMPLATE, buildContractTemplate } from "./contractTemplates";

describe("PROPOSAL_TEMPLATE", () => {
  it("has 8 top-level sections", () => {
    const headings = PROPOSAL_TEMPLATE.filter((b) => b.type === "heading");
    expect(headings.length).toBe(8);
  });

  it("first heading is Executive Summary", () => {
    const first = PROPOSAL_TEMPLATE.find((b) => b.type === "heading");
    const text = (first?.content as Array<{ text: string }>)?.[0]?.text ?? "";
    expect(text).toBe("Executive Summary");
  });
});

describe("buildContractTemplate", () => {
  const data = {
    projectName: "ACME Website",
    orgName: "Studio One",
    clientName: "ACME Corp",
    amount: "5000",
    asset: "USDC",
    deliverables: ["Landing page", "Admin dashboard"],
    milestoneCount: 3,
    today: "2026-07-21",
  };

  it("returns an array of blocks", () => {
    const blocks = buildContractTemplate(data);
    expect(Array.isArray(blocks)).toBe(true);
    expect(blocks.length).toBeGreaterThan(5);
  });

  it("includes project name in heading text", () => {
    const blocks = buildContractTemplate(data);
    const allText = blocks
      .map((b) =>
        (b.content as Array<{ text?: string }>)
          ?.map((c) => c.text ?? "")
          .join("") ?? ""
      )
      .join(" ");
    expect(allText).toContain("ACME Website");
  });

  it("includes each deliverable as a bullet block", () => {
    const blocks = buildContractTemplate(data);
    const bullets = blocks.filter((b) => b.type === "bulletListItem");
    const texts = bullets.map(
      (b) =>
        (b.content as Array<{ text?: string }>)
          ?.map((c) => c.text ?? "")
          .join("") ?? ""
    );
    expect(texts).toContain("Landing page");
    expect(texts).toContain("Admin dashboard");
  });

  it("includes amount and asset in a paragraph", () => {
    const blocks = buildContractTemplate(data);
    const allText = blocks
      .map((b) =>
        (b.content as Array<{ text?: string }>)
          ?.map((c) => c.text ?? "")
          .join("") ?? ""
      )
      .join(" ");
    expect(allText).toContain("5000");
    expect(allText).toContain("USDC");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd frontend && pnpm vitest run lib/contractTemplates.test.ts
```
Expected: FAIL — `contractTemplates` module not found.

- [ ] **Step 3: Implement `contractTemplates.ts`**

```ts
// frontend/lib/contractTemplates.ts
// PartialBlock is the type BlockNote accepts for initialContent.
// We use a loose shape so this file has zero @blocknote imports
// (avoids SSR issues in test/server contexts).
export type PartialBlock = {
  type: string;
  props?: Record<string, unknown>;
  content?: Array<{ type: string; text: string; styles?: Record<string, unknown> }>;
};

export type ContractTemplateData = {
  projectName: string;
  orgName: string;
  clientName: string;
  amount: string;
  asset: string;
  deliverables: string[];
  milestoneCount: number;
  today: string;
};

function heading(text: string, level: 1 | 2 | 3 = 2): PartialBlock {
  return {
    type: "heading",
    props: { level },
    content: [{ type: "text", text, styles: {} }],
  };
}

function para(text: string): PartialBlock {
  return {
    type: "paragraph",
    content: [{ type: "text", text, styles: {} }],
  };
}

function bullet(text: string): PartialBlock {
  return {
    type: "bulletListItem",
    content: [{ type: "text", text, styles: {} }],
  };
}

function emptyPara(): PartialBlock {
  return { type: "paragraph", content: [] };
}

// Static proposal template — 8 sections, all empty for user to fill.
export const PROPOSAL_TEMPLATE: PartialBlock[] = [
  heading("Executive Summary"),
  emptyPara(),
  heading("About Us"),
  emptyPara(),
  heading("Scope of Work"),
  emptyPara(),
  heading("Deliverables"),
  bullet(""),
  bullet(""),
  heading("Timeline & Milestones"),
  emptyPara(),
  heading("Investment"),
  emptyPara(),
  heading("Terms & Conditions"),
  emptyPara(),
  heading("Next Steps"),
  emptyPara(),
];

// Contract template — pre-filled with project data from proposal.
export function buildContractTemplate(data: ContractTemplateData): PartialBlock[] {
  const deliverableBullets: PartialBlock[] =
    data.deliverables.length > 0
      ? data.deliverables.map((d) => bullet(d))
      : [bullet("")];

  return [
    heading("Service Agreement", 1),
    para(`Date: ${data.today}`),
    para(`Project: ${data.projectName}`),
    emptyPara(),

    heading("1. Parties"),
    para(
      `This Service Agreement ("Agreement") is entered into as of ${data.today} between ` +
        `${data.orgName} ("Agency") and ${data.clientName} ("Client").`
    ),
    emptyPara(),

    heading("2. Scope of Services"),
    para("The Agency agrees to provide the following services:"),
    ...deliverableBullets,
    emptyPara(),

    heading("3. Project Timeline"),
    para(
      `This project is structured across ${data.milestoneCount} milestone(s). ` +
        `Specific dates and deadlines are outlined below:`
    ),
    emptyPara(),

    heading("4. Payment Terms"),
    para(
      `The total project value is ${data.amount} ${data.asset}. ` +
        `Payment schedule and method are as follows:`
    ),
    emptyPara(),

    heading("5. Intellectual Property"),
    para(
      "Upon receipt of full and final payment, the Agency assigns to the Client all rights, " +
        "title, and interest in the work product created specifically for this project. " +
        "The Agency retains ownership of any pre-existing tools, frameworks, or methodologies used."
    ),
    emptyPara(),

    heading("6. Confidentiality"),
    para(
      "Both parties agree to keep confidential all non-public information disclosed during " +
        "this engagement and to use such information solely for the purposes of this Agreement."
    ),
    emptyPara(),

    heading("7. Revisions & Approval"),
    para(
      "The Client is entitled to two (2) rounds of revisions per deliverable. " +
        "Additional revisions will be billed at the Agency's standard hourly rate."
    ),
    emptyPara(),

    heading("8. Termination"),
    para(
      "Either party may terminate this Agreement with fourteen (14) days written notice. " +
        "The Client shall pay for all work completed up to the termination date."
    ),
    emptyPara(),

    heading("9. Governing Law"),
    para(
      "This Agreement shall be governed by and construed in accordance with applicable law. " +
        "Any disputes shall be resolved through binding arbitration."
    ),
    emptyPara(),

    heading("10. Signatures"),
    para("By signing below, both parties agree to the terms of this Agreement."),
    emptyPara(),
    para(`Agency (${data.orgName}): ___________________________   Date: ____________`),
    para(`Client (${data.clientName}): ___________________________   Date: ____________`),
  ];
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd frontend && pnpm vitest run lib/contractTemplates.test.ts
```
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/contractTemplates.ts frontend/lib/contractTemplates.test.ts
git commit -m "feat(lib): add contractTemplates with PROPOSAL_TEMPLATE and buildContractTemplate"
```

---

## Task 2: Add proposal template to ProposalCreate

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalCreate.tsx`

**Interfaces:**
- Consumes: `PROPOSAL_TEMPLATE` from `@/lib/contractTemplates`
- No interface changes — `initialContent` is an existing `useCreateBlockNote` param

- [ ] **Step 1: Update ProposalCreate to use PROPOSAL_TEMPLATE**

Replace the entire file with:

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalCreate.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { saveProposal } from "../../actions";
import { ProposalTags } from "./ProposalTags";
import { PROPOSAL_TEMPLATE } from "@/lib/contractTemplates";

export function ProposalCreate({ projectId }: { projectId: string }) {
  const router = useRouter();
  const editor = useCreateBlockNote({
    initialContent: PROPOSAL_TEMPLATE as never,
  });
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    setBusy(true);
    setError(null);
    const res = await saveProposal({
      orgId: "",
      projectId,
      title: title.trim() || "Untitled proposal",
      blocks: editor.document as unknown[],
      tags,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled proposal"
          className="w-full bg-transparent text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300"
        />
        <button
          onClick={onCreate}
          disabled={busy}
          className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create proposal"}
        </button>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <ProposalTags tags={tags} editable onChange={setTags} />
        <div className="mt-4">
          <BlockNoteView editor={editor} theme="light" />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend && pnpm build 2>&1 | tail -10
```
Expected: build succeeds (no type errors on this file).

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalCreate.tsx"
git commit -m "feat(proposals): pre-fill ProposalCreate with professional 8-section template"
```

---

## Task 3: SQL — `project_contracts` table

**Files:**
- Create: `frontend/supabase/project_contracts.sql`

**Interfaces:** DB only — consumed by Tasks 4 and 5.

- [ ] **Step 1: Create the SQL file**

```sql
-- frontend/supabase/project_contracts.sql
-- Run in Supabase SQL Editor.

create table if not exists public.project_contracts (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  org_id      uuid not null references public.organizations(id) on delete cascade,
  blocks      jsonb,
  markdown    text not null default '',
  status      text not null default 'draft',
  -- status: draft | agency_signed | client_signed | complete
  agency_sig          text,
  client_sig          text,
  agency_signed_at    timestamptz,
  client_signed_at    timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.project_contracts enable row level security;

drop policy if exists "project_contracts_org" on public.project_contracts;
create policy "project_contracts_org" on public.project_contracts
  for all using (
    public.auth_is_org_member(org_id)
  ) with check (
    public.auth_is_org_member(org_id)
  );

create index if not exists project_contracts_project_id_idx
  on public.project_contracts (project_id);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/supabase/project_contracts.sql
git commit -m "feat(db): add project_contracts table with RLS"
```

> Apply this SQL in the Supabase SQL Editor before running the app.

---

## Task 4: Server actions — `generateContract`, `saveContract`, `signContractAgency`

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts` (append)

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/server`; `blocksToMarkdown` from `@/lib/proposalBlocks`; `buildContractTemplate`, `ContractTemplateData` from `@/lib/contractTemplates`; `resolveOrgId` (already defined in file at line 159)
- Produces:
  - `generateContract(input: { projectId: string }): Promise<{ ok: true } | { ok: false; error: string }>`
  - `saveContract(input: { projectId: string; blocks: unknown[] }): Promise<{ ok: true } | { ok: false; error: string }>`
  - `signContractAgency(input: { projectId: string }): Promise<{ ok: true } | { ok: false; error: string }>`

- [ ] **Step 1: Append actions to `actions.ts`**

Add this block at the end of `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts`:

```ts
import { buildContractTemplate } from "@/lib/contractTemplates";

export async function generateContract(input: {
  projectId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const orgId = await resolveOrgId(supabase, input.projectId);
    if (!orgId) throw new Error("Project org not found");

    // Fetch project for name + asset
    const { data: project } = await supabase
      .from("projects")
      .select("name, asset, client_name, contract_data")
      .eq("id", input.projectId)
      .single();
    if (!project) throw new Error("Project not found");

    // Fetch org name
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();

    // Fetch latest proposal for deliverables + amount
    const { data: proposal } = await supabase
      .from("project_proposals")
      .select("title, blocks, tags, markdown")
      .eq("org_id", orgId)
      .eq("project_id", input.projectId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const contractData = (project.contract_data ?? {}) as {
      amount?: string | number;
      deliverables?: string[];
    };

    const deliverables: string[] =
      contractData.deliverables ??
      (proposal?.tags ?? []).filter((t: string) => !t.includes(":")) ??
      [];

    const templateData = {
      projectName: (project.name as string) ?? "Project",
      orgName: (org?.name as string) ?? "Agency",
      clientName: (project.client_name as string) ?? "Client",
      amount: String(contractData.amount ?? ""),
      asset: (project.asset as string) ?? "XLM",
      deliverables,
      milestoneCount: 0,
      today: new Date().toISOString().split("T")[0],
    };

    const blocks = buildContractTemplate(templateData);
    const markdown = blocksToMarkdown(blocks as unknown[]);

    // Check if contract already exists
    const { data: existing } = await supabase
      .from("project_contracts")
      .select("id")
      .eq("project_id", input.projectId)
      .eq("org_id", orgId)
      .maybeSingle();

    if (existing) {
      // Already generated — do not overwrite
      return { ok: true };
    }

    const { error } = await supabase.from("project_contracts").insert({
      project_id: input.projectId,
      org_id: orgId,
      blocks,
      markdown,
      status: "draft",
    });
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "generateContract failed",
    };
  }
}

export async function saveContract(input: {
  projectId: string;
  blocks: unknown[];
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const orgId = await resolveOrgId(supabase, input.projectId);
    if (!orgId) throw new Error("Project org not found");

    const markdown = blocksToMarkdown(input.blocks);

    const { error } = await supabase
      .from("project_contracts")
      .update({ blocks: input.blocks, markdown, updated_at: new Date().toISOString() })
      .eq("project_id", input.projectId)
      .eq("org_id", orgId);
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "saveContract failed",
    };
  }
}

export async function signContractAgency(input: {
  projectId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const orgId = await resolveOrgId(supabase, input.projectId);
    if (!orgId) throw new Error("Project org not found");

    // Fetch authenticated user id as the sig hash (placeholder until on-chain)
    const { data: { user } } = await supabase.auth.getUser();
    const sig = user?.id ?? "signed";

    const { error } = await supabase
      .from("project_contracts")
      .update({
        agency_sig: sig,
        agency_signed_at: new Date().toISOString(),
        status: "agency_signed",
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", input.projectId)
      .eq("org_id", orgId);
    if (error) throw new Error(error.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "signContractAgency failed",
    };
  }
}
```

- [ ] **Step 2: Add the import for `buildContractTemplate` at the top of `actions.ts`**

The file already imports from `@/lib/proposalBlocks`. Add to the existing imports block at the top (after line 6):

```ts
import { buildContractTemplate } from "@/lib/contractTemplates";
```

- [ ] **Step 3: Typecheck**

```bash
cd frontend && pnpm build 2>&1 | tail -10
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/actions.ts"
git commit -m "feat(actions): add generateContract, saveContract, signContractAgency"
```

---

## Task 5: ContractSigningPanel component

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractSigningPanel.tsx`

**Interfaces:**
- Consumes: `signContractAgency` from `../../actions`
- Produces: `ContractSigningPanel({ projectId, agencySig, clientSig, status, onSigned }: Props)`

- [ ] **Step 1: Create ContractSigningPanel**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractSigningPanel.tsx
"use client";
import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { signContractAgency } from "../../actions";

type Props = {
  projectId: string;
  agencySig: string | null;
  clientSig: string | null;
  status: string;
  onSigned: () => void;
};

function SigRow({
  label,
  sig,
  signedAt,
}: {
  label: string;
  sig: string | null;
  signedAt?: string | null;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {sig ? (
          <p className="font-mono text-xs text-gray-500">
            {sig.slice(0, 12)}…{sig.slice(-6)}
          </p>
        ) : (
          <p className="text-xs text-gray-400">Pending signature</p>
        )}
      </div>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
          sig
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {sig ? (
          <><CheckCircle2 className="h-3 w-3" /> Signed</>
        ) : (
          <><Clock className="h-3 w-3" /> Pending</>
        )}
      </span>
    </div>
  );
}

export function ContractSigningPanel({
  projectId,
  agencySig,
  clientSig,
  status,
  onSigned,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSign() {
    setBusy(true);
    setError(null);
    const res = await signContractAgency({ projectId });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSigned();
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Signatures</h3>
      <SigRow label="Agency" sig={agencySig} />
      <SigRow label="Client" sig={clientSig} />

      {!agencySig && (
        <div className="mt-4">
          <button
            onClick={handleSign}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {busy ? "Signing…" : "Sign as agency"}
          </button>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
      )}

      {agencySig && !clientSig && (
        <p className="mt-3 text-xs text-gray-500">
          Waiting for client to sign via the portal.
        </p>
      )}

      {agencySig && clientSig && (
        <p className="mt-3 text-xs font-medium text-green-700">
          Both parties have signed. Contract is complete.
        </p>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend && pnpm build 2>&1 | tail -10
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractSigningPanel.tsx"
git commit -m "feat(contract): add ContractSigningPanel component"
```

---

## Task 6: ContractEditor + ContractEditorClient (BlockNote live editor)

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditor.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditorClient.tsx`

**Interfaces:**
- Consumes: `useCreateBlockNote` from `@blocknote/react`; `BlockNoteView` from `@blocknote/mantine`; `saveContract` from `../../actions`; `ContractSigningPanel`
- Produces:
  - `ContractEditor({ slug, projectId, initialBlocks, agencySig, clientSig, status, onDone }: Props)`
  - `ContractEditorClient` — re-exports `ContractEditor` via `dynamic(ssr:false)`

- [ ] **Step 1: Create ContractEditor**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditor.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { saveContract } from "../../actions";
import { ContractSigningPanel } from "./ContractSigningPanel";

type Props = {
  slug: string;
  projectId: string;
  initialBlocks: unknown[];
  agencySig: string | null;
  clientSig: string | null;
  status: string;
  onDone: () => void;
};

export function ContractEditor({
  slug,
  projectId,
  initialBlocks,
  agencySig,
  clientSig,
  status,
  onDone,
}: Props) {
  const router = useRouter();
  const editor = useCreateBlockNote({
    initialContent: (initialBlocks?.length ? initialBlocks : undefined) as never,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setBusy(true);
    setError(null);
    const res = await saveContract({
      projectId,
      blocks: editor.document as unknown[],
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onDone();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Contract</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onDone}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={busy}
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <BlockNoteView editor={editor} theme="light" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ContractSigningPanel
        projectId={projectId}
        agencySig={agencySig}
        clientSig={clientSig}
        status={status}
        onSigned={() => router.refresh()}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create ContractEditorClient wrapper**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditorClient.tsx
"use client";
import dynamic from "next/dynamic";

// BlockNote calls `window` during useCreateBlockNote — must be client-only.
const ContractEditor = dynamic(
  () => import("./ContractEditor").then((m) => m.ContractEditor),
  { ssr: false }
);

export { ContractEditor as ContractEditorClient };
```

- [ ] **Step 3: Typecheck**

```bash
cd frontend && pnpm build 2>&1 | tail -10
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditor.tsx" "frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEditorClient.tsx"
git commit -m "feat(contract): add ContractEditor with BlockNote + ContractEditorClient ssr:false wrapper"
```

---

## Task 7: ContractReader + ContractReaderClient (read-only view)

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReader.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReaderClient.tsx`

**Interfaces:**
- Consumes: `useCreateBlockNote` from `@blocknote/react`; `BlockNoteView` from `@blocknote/mantine`; `ContractSigningPanel`
- Produces:
  - `ContractReader({ slug, projectId, blocks, agencySig, clientSig, status }: Props)`
  - `ContractReaderClient` — re-exports `ContractReader` via `dynamic(ssr:false)`

- [ ] **Step 1: Create ContractReader**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReader.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { Pencil } from "lucide-react";
import { ContractEditorClient } from "./ContractEditorClient";
import { ContractSigningPanel } from "./ContractSigningPanel";

type Props = {
  slug: string;
  projectId: string;
  blocks: unknown[];
  agencySig: string | null;
  clientSig: string | null;
  status: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  agency_signed: "Agency Signed",
  client_signed: "Client Signed",
  complete: "Complete",
};

export function ContractReader({
  slug,
  projectId,
  blocks,
  agencySig,
  clientSig,
  status,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const editor = useCreateBlockNote({
    initialContent: (blocks?.length ? blocks : undefined) as never,
  });

  if (editing) {
    return (
      <ContractEditorClient
        slug={slug}
        projectId={projectId}
        initialBlocks={blocks}
        agencySig={agencySig}
        clientSig={clientSig}
        status={status}
        onDone={() => { setEditing(false); router.refresh(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Contract</h1>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {STATUS_LABEL[status] ?? status}
          </span>
        </div>
        {status === "draft" && (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Pencil className="h-4 w-4" /> Edit
          </button>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <BlockNoteView editor={editor} editable={false} theme="light" />
      </div>

      <ContractSigningPanel
        projectId={projectId}
        agencySig={agencySig}
        clientSig={clientSig}
        status={status}
        onSigned={() => router.refresh()}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create ContractReaderClient wrapper**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReaderClient.tsx
"use client";
import dynamic from "next/dynamic";

const ContractReader = dynamic(
  () => import("./ContractReader").then((m) => m.ContractReader),
  { ssr: false }
);

export { ContractReader as ContractReaderClient };
```

- [ ] **Step 3: Typecheck**

```bash
cd frontend && pnpm build 2>&1 | tail -10
```
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReader.tsx" "frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractReaderClient.tsx"
git commit -m "feat(contract): add ContractReader + ContractReaderClient ssr:false wrapper"
```

---

## Task 8: ContractEmpty — "Generate contract" CTA

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEmpty.tsx`

**Interfaces:**
- Consumes: `generateContract` from `../../actions` (server action, called via form action)
- Produces: `ContractEmpty({ slug, projectId }: Props)` — server component

- [ ] **Step 1: Create ContractEmpty**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEmpty.tsx
import { FileText } from "lucide-react";
import { generateContract } from "../../actions";

export function ContractEmpty({
  slug,
  projectId,
}: {
  slug: string;
  projectId: string;
}) {
  async function generate() {
    "use server";
    await generateContract({ projectId });
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center">
      <div className="mb-4 rounded-full bg-violet-50 p-4">
        <FileText className="h-8 w-8 text-violet-500" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        No contract yet
      </h2>
      <p className="mb-6 max-w-sm text-sm text-gray-500">
        Generate a professional contract pre-filled with your project and
        proposal details. You can edit every clause before signing.
      </p>
      <form action={generate}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
        >
          <FileText className="h-4 w-4" />
          Generate contract
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd frontend && pnpm build 2>&1 | tail -10
```
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractEmpty.tsx"
git commit -m "feat(contract): add ContractEmpty CTA with generate action"
```

---

## Task 9: Wire up `contract/page.tsx` + remove ContractDetailView

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/contract/page.tsx`
- Delete: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractDetailView.tsx`

**Interfaces:**
- Consumes: `createClient`, `getActiveOrgBySlug`; `ContractEmpty`, `ContractReaderClient`
- The page fetches `project_contracts` and branches on whether a row exists

- [ ] **Step 1: Replace `contract/page.tsx`**

```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/contract/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ContractEmpty } from "./components/ContractEmpty";
import { ContractReaderClient } from "./components/ContractReaderClient";

export default async function ContractPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: contract } = await supabase
    .from("project_contracts")
    .select("id, blocks, markdown, status, agency_sig, client_sig")
    .eq("project_id", id)
    .eq("org_id", org.id)
    .maybeSingle();

  if (!contract) {
    return <ContractEmpty slug={slug} projectId={id} />;
  }

  return (
    <ContractReaderClient
      slug={slug}
      projectId={id}
      blocks={(contract.blocks as unknown[]) ?? []}
      agencySig={(contract.agency_sig as string | null) ?? null}
      clientSig={(contract.client_sig as string | null) ?? null}
      status={(contract.status as string) ?? "draft"}
    />
  );
}
```

- [ ] **Step 2: Delete ContractDetailView**

```bash
git rm "frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractDetailView.tsx"
```

- [ ] **Step 3: Typecheck + lint**

```bash
cd frontend && pnpm build 2>&1 | tail -15
```
Expected: build succeeds, no references to `ContractDetailView` remain.

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/contract/page.tsx"
git commit -m "feat(contract): wire contract page — empty/reader states, remove ContractDetailView"
```

---

## Task 10: Full verification

- [ ] **Step 1: Run all tests**

```bash
cd frontend && pnpm vitest run
```
Expected: all pass (contractTemplates + proposalBlocks + actions.proposal).

- [ ] **Step 2: Full build**

```bash
cd frontend && pnpm build 2>&1 | tail -15
```
Expected: build succeeds, zero type errors.

- [ ] **Step 3: Manual smoke test checklist**

Visit `http://localhost:3000/w/<slug>/projects/<id>/proposals` — new proposal:
- [ ] Editor opens with 8 pre-filled section headings
- [ ] User can type in each section and save

Visit `http://localhost:3000/w/<slug>/projects/<id>/contract` — first visit:
- [ ] "Generate contract" empty state shows
- [ ] Clicking generates and page reloads with pre-filled contract
- [ ] Contract shows project name, org name, amount, deliverables from proposal
- [ ] Edit button opens editor
- [ ] Save returns to reader
- [ ] "Sign as agency" button appears; clicking signs and shows "Waiting for client"

- [ ] **Step 4: Final commit if any polish fixes made**

```bash
git add -A
git commit -m "fix(contract): smoke test fixes"
```

---

## Self-Review

**Spec coverage:**
- Proposal template (spec §2) → Task 2
- `contractTemplates.ts` lib (spec §4) → Task 1
- `project_contracts` table (spec §3) → Task 3
- `generateContract` / `saveContract` / `signContractAgency` (spec §3) → Task 4
- `ContractSigningPanel` (spec §3) → Task 5
- `ContractEditor` + `ContractEditorClient` (spec §3) → Task 6
- `ContractReader` + `ContractReaderClient` (spec §3) → Task 7
- `ContractEmpty` (spec §3) → Task 8
- `contract/page.tsx` orchestration (spec §3) → Task 9
- `ContractDetailView` deletion (spec §5) → Task 9

**Placeholder scan:** No TBD/TODO. All code blocks are complete.

**Type consistency:**
- `generateContract({ projectId })` defined in Task 4, called in Task 8 ✓
- `saveContract({ projectId, blocks })` defined in Task 4, called in Task 6 ✓
- `signContractAgency({ projectId })` defined in Task 4, called in Task 5 ✓
- `ContractSigningPanel` props match between Task 5 (definition) and Tasks 6, 7 (usage) ✓
- `ContractEditorClient` imported in Task 7 (ContractReader) — defined in Task 6 ✓
- `ContractReaderClient` imported in Task 9 (page) — defined in Task 7 ✓
- `ContractEmpty` imported in Task 9 — defined in Task 8 ✓
- `PROPOSAL_TEMPLATE` imported in Task 2 — defined in Task 1 ✓
