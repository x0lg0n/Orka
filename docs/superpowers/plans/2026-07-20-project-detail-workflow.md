# Project Detail Page & Workflow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 9-tab project detail page production-grade: a single workflow state machine drives all tabs, the three stub tabs (Contracts, Escrow, Payments) are wired to the existing Soroban contracts + Rust backend, both custody modes work, and chain-derived status is written only by the indexer reconciler.

**Architecture:** A new pure module `frontend/lib/workflow.ts` owns the linear gated pipeline (Proposal → Contract → Escrow → Milestones) and is imported by every tab. Chain *actions* live in server actions that call `frontend/lib/stellar.ts` → `@orka/stellar-sdk` → Rust `/escrow/*` → Soroban; the UI then re-reads Postgres (never the SDK response). The Rust indexer → `apply_chain_event()` remains the only writer of chain-derived milestone/escrow status. The client acts through the existing public portal `/p/[token]`.

**Tech Stack:** Next.js 16 (App Router, server components + server actions), React 19, TypeScript (strict), Tailwind v4, Supabase (Postgres + RLS), `@orka/stellar-sdk` (vitest), Rust/Axum backend (`services/`), Soroban contracts (`contracts/`). pnpm for frontend/sdk; cargo for contracts/services.

## Global Constraints

- On-chain = money truth; off-chain = everything else. (verbatim from ARCHITECTURE.md)
- One sync bridge — `apply_chain_event()` is the only writer of chain-derived milestone/escrow status; the UI reads Postgres, never the SDK response. (verbatim)
- Defense in depth for custody (contract rules + KMS + multi-sig + session gating). (verbatim)
- `release_funds` requires client + operator multi-sig; never weaken it. (verbatim from README/CONTRIBUTING)
- Milestone status enum (Postgres): `draft | funded | in_review | approved | released | refunded | disputed`. (from `frontend/lib/orka.ts`)
- Use pnpm everywhere; never `npm install` at repo root. (from AGENTS.md)
- No `lib/routes.ts`; route strings are inline template literals like `` `/w/${slug}/...` ``. (from AGENTS.md)
- Tab registry uses **path-based** segments (`/overview`, `/contract`, …); settings pages use `?tab=`. (from AGENTS.md)
- Frontend has no standalone typecheck script; type errors surface in `pnpm build`. Use `pnpm lint` + `pnpm build` to verify. (from AGENTS.md)
- Strict single-writer: tabs never write chain-derived status directly; status flips only when the indexer writes it. (from spec Section 1.3 / 4.2)
- Both custody modes (`orka` | `freighter`) drive the same contract; one address, one mode, never both. (from README)
- `SERVICES_URL` env var is the bridge to the Rust backend (set in `.env.local`). (from `frontend/lib/stellar.ts`)

---

## File Structure (what gets created / modified)

**New files**
- `frontend/lib/workflow.ts` — pure workflow state machine (no DB/React).
- `frontend/lib/workflow.test.ts` — unit tests for transitions + gates.
- `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts` — server actions for all chain + signing actions.
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractDetailView.tsx` — built Contracts tab view.
- `frontend/app/(app)/w/[slug]/projects/[id]/escrow/components/ProjectEscrowView.tsx` — built Escrow tab view.
- `frontend/app/(app)/w/[slug]/projects/[id]/payments/components/ProjectPaymentsView.tsx` — built Payments tab view.
- `frontend/app/(app)/w/[slug]/projects/[id]/components/WorkflowStepper.tsx` — stage stepper used by Overview.
- `frontend/app/(app)/w/[slug]/projects/[id]/components/ActionButton.tsx` — role-gated action button (renders only if `nextActionsForRole` allows).

**Modified files**
- `frontend/app/(app)/w/[slug]/projects/[id]/components/projectTabs.config.ts` — standardize registry (already path-based; confirm).
- `frontend/app/(app)/w/[slug]/projects/[id]/overview/components/ProjectOverviewView.tsx` + `QuickActionsCard.tsx` — add WorkflowStepper + workflow-driven CTA.
- `frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/MilestonePaymentFlow.tsx` + `BoardView.tsx` — wire buttons to server actions.
- `frontend/app/(app)/w/[slug]/projects/[id]/escrow/page.tsx` — replace stub with `ProjectEscrowView`.
- `frontend/app/(app)/w/[slug]/projects/[id]/contract/page.tsx` — replace stub with `ContractDetailView`.
- `frontend/app/(app)/w/[slug]/projects/[id]/payments/page.tsx` — replace stub with `ProjectPaymentsView`.
- `frontend/app/(app)/w/[slug]/projects/[id]/proposal/components/ProposalActionsCard.tsx` — add "Send to client" transition.
- `frontend/supabase/orka_schema.sql` — add `project_stage` enum + column; add `(contract_address, milestone_index)` index; verify `workspace_payments` + `get_portal_project`.
- `frontend/lib/orka.ts` — replace `fakeTx()` usage; add `updateProjectStage` helper.
- `services/src/custody.rs` — `from_config` supports real KMS provider (behind `KMS_CONFIG`); keep `InMemoryKms` for tests.
- `services/src/router.rs` — tighten CORS for non-dev.
- `packages/stellar-sdk/src/types.ts` + `client.ts` — ensure contract-action methods exist and return `{ txHash } | { txXdr }`.
- `frontend/app/p/[token]/...` — client portal action wiring (Tasks 5.x).

> Note: The wallet/portal route files under `app/p/[token]` were not enumerated in exploration; Task 5.1 confirms exact paths before editing.

---

## Phase 1 — Foundation: workflow state machine + schema + tab registry

### Task 1.1: Add `project_stage` enum + column + index to schema

**Files:**
- Modify: `frontend/supabase/orka_schema.sql` (after the `projects` table, ~line 264-299)

**Interfaces:**
- Consumes: existing `projects` table, `escrow_contracts` table.
- Produces: `projects.project_stage` column, index `escrow_contracts(contract_address, milestone_index)`.

- [ ] **Step 1: Add the enum and column to `orka_schema.sql`**
```sql
-- idempotent: add enum type if missing
do $$ begin
  create type project_stage as enum (
    'draft', 'proposal_sent', 'contract_signed', 'escrow_funded', 'milestones_active', 'completed'
  );
exception when duplicate_object then null; end $$;

-- idempotent: add column if missing
alter table projects add column if not exists project_stage project_stage not null default 'draft';
create index if not exists idx_projects_stage on projects (org_id, project_stage);

-- ensure mapping index exists for escrow_contracts
create index if not exists idx_escrow_contracts_map
  on escrow_contracts (contract_address, (mapping->>'milestone_index'));
```

- [ ] **Step 2: Apply the SQL to your Supabase project**
Run: open `frontend/supabase/orka_schema.sql` in the Supabase SQL editor and run it.
Expected: succeeds with no errors; `projects` now has `project_stage`; index created.

- [ ] **Step 3: Verify the column reads back**
Run: `select id, project_stage from projects limit 1;` in the SQL editor.
Expected: returns a row with `project_stage = 'draft'` (or current value).

- [ ] **Step 4: Commit**
```bash
git add frontend/supabase/orka_schema.sql
git commit -m "schema: add project_stage enum + column and escrow mapping index"
```

### Task 1.2: Implement `frontend/lib/workflow.ts` (pure state machine)

**Files:**
- Create: `frontend/lib/workflow.ts`
- Test: `frontend/lib/workflow.test.ts`

**Interfaces:**
- Consumes: `MilestoneStatus` from `frontend/lib/orka.ts`.
- Produces:
  - `export type ProjectStage = "draft" | "proposal_sent" | "contract_signed" | "escrow_funded" | "milestones_active" | "completed";`
  - `export type WorkflowRole = "agency" | "client";`
  - `export type WorkflowAction = "send_proposal" | "accept_proposal" | "create_contract" | "sign_contract_agency" | "sign_contract_client" | "fund_escrow" | "submit_milestone" | "approve_milestone" | "reject_milestone" | "release_milestone" | "open_dispute" | "resolve_dispute";`
  - `export function deriveWorkflowState(input: WorkflowInput): WorkflowState`
  - `export function nextActionsForRole(state: WorkflowState, role: WorkflowRole): WorkflowAction[]`
  - `export function getProjectStage(input: WorkflowInput): ProjectStage`

- [ ] **Step 1: Write the failing test**
```ts
// frontend/lib/workflow.test.ts
import { describe, it, expect } from "vitest";
import { deriveWorkflowState, nextActionsForRole, type WorkflowAction } from "./workflow";
import type { MilestoneStatus } from "./orka";

const ms = (status: MilestoneStatus) => ({ status });

describe("deriveWorkflowState", () => {
  it("draft when nothing exists", () => {
    expect(deriveWorkflowState({ milestones: [] }).stage).toBe("draft");
  });
  it("proposal_sent once proposal is sent", () => {
    expect(deriveWorkflowState({ proposal: { status: "sent" }, milestones: [] }).stage).toBe("proposal_sent");
  });
  it("contract_signed when both sigs present", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    expect(deriveWorkflowState({ contract, milestones: [] }).stage).toBe("contract_signed");
  });
  it("escrow_funded when escrow address + funded amount present", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = { contract_address: "C123", total_funded: 8000, total_amount: 8000 };
    expect(deriveWorkflowState({ contract, escrow, milestones: [ms("funded")] }).stage).toBe("escrow_funded");
  });
  it("milestones_active when escrow funded and a milestone is submitted", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = { contract_address: "C123", total_funded: 8000, total_amount: 8000 };
    expect(deriveWorkflowState({ contract, escrow, milestones: [ms("submitted")] }).stage).toBe("milestones_active");
  });
  it("completed when all milestones released", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = { contract_address: "C123", total_funded: 8000, total_amount: 8000 };
    expect(deriveWorkflowState({ contract, escrow, milestones: [ms("released"), ms("released")] }).stage).toBe("completed");
  });
});

describe("nextActionsForRole", () => {
  it("client can fund escrow only at contract_signed", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const state = deriveWorkflowState({ contract, milestones: [] });
    const acts: WorkflowAction[] = nextActionsForRole(state, "client");
    expect(acts).toContain("fund_escrow");
    expect(acts).not.toContain("release_milestone");
  });
  it("agency cannot release before escrow funded", () => {
    const state = deriveWorkflowState({ milestones: [] });
    expect(nextActionsForRole(state, "agency")).not.toContain("release_milestone");
  });
  it("client can release only when a milestone is approved", () => {
    const contract = { client_sig: "c1", freelancer_sig: "f1", status: "signed" };
    const escrow = { contract_address: "C123", total_funded: 8000, total_amount: 8000 };
    const state = deriveWorkflowState({ contract, escrow, milestones: [ms("approved")] });
    expect(nextActionsForRole(state, "client")).toContain("release_milestone");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `cd frontend && pnpm vitest run lib/workflow.test.ts`
Expected: FAIL — module `./workflow` does not exist.

- [ ] **Step 3: Write minimal implementation**
```ts
// frontend/lib/workflow.ts
import type { MilestoneStatus } from "./orka";

export type ProjectStage =
  | "draft" | "proposal_sent" | "contract_signed" | "escrow_funded" | "milestones_active" | "completed";
export type WorkflowRole = "agency" | "client";
export type WorkflowAction =
  | "send_proposal" | "accept_proposal" | "create_contract" | "sign_contract_agency"
  | "sign_contract_client" | "fund_escrow" | "submit_milestone" | "approve_milestone"
  | "reject_milestone" | "release_milestone" | "open_dispute" | "resolve_dispute";

export interface WorkflowInput {
  proposal?: { status?: string } | null;
  contract?: { client_sig?: string | null; freelancer_sig?: string | null; status?: string } | null;
  escrow?: { contract_address?: string | null; total_funded?: number; total_amount?: number } | null;
  milestones: { status: MilestoneStatus }[];
}
export interface WorkflowState {
  stage: ProjectStage;
  fullyReleased: boolean;
  anyFunded: boolean;
  anyDisputed: boolean;
  hasApproved: boolean;
  hasSubmitted: boolean;
}

export function deriveWorkflowState(input: WorkflowInput): WorkflowState {
  const proposalSent = !!input.proposal && input.proposal.status === "sent";
  const proposalAccepted = !!input.proposal && input.proposal.status === "accepted";
  const contractSigned =
    !!input.contract && !!input.contract.client_sig && !!input.contract.freelancer_sig &&
    input.contract.status === "signed";
  const escrowFunded =
    !!input.escrow && !!input.escrow.contract_address &&
    (input.escrow.total_funded ?? 0) > 0 &&
    input.escrow.total_funded! >= (input.escrow.total_amount ?? 0);

  const anyFunded = input.milestones.some((m) => m.status !== "draft");
  const hasSubmitted = input.milestones.some((m) => m.status === "submitted" || m.status === "in_review");
  const hasApproved = input.milestones.some((m) => m.status === "approved");
  const anyDisputed = input.milestones.some((m) => m.status === "disputed");
  const fullyReleased =
    input.milestones.length > 0 &&
    input.milestones.every((m) => m.status === "released" || m.status === "refunded");

  let stage: ProjectStage;
  if (fullyReleased && escrowFunded) stage = "completed";
  else if (escrowFunded && (hasSubmitted || hasApproved || anyDisputed)) stage = "milestones_active";
  else if (escrowFunded) stage = "escrow_funded";
  else if (contractSigned && proposalAccepted) stage = "contract_signed";
  else if (proposalSent) stage = "proposal_sent";
  else stage = "draft";

  return { stage, fullyReleased, anyFunded, anyDisputed, hasApproved, hasSubmitted };
}

export function getProjectStage(input: WorkflowInput): ProjectStage {
  return deriveWorkflowState(input).stage;
}

export function nextActionsForRole(state: WorkflowState, role: WorkflowRole): WorkflowAction[] {
  const acts: WorkflowAction[] = [];
  if (state.stage === "draft" && role === "agency") acts.push("send_proposal");
  if (state.stage === "proposal_sent" && role === "client") acts.push("accept_proposal");
  if (state.stage === "proposal_sent" && role === "agency") acts.push("create_contract", "sign_contract_agency");
  if (state.stage === "contract_signed") {
    if (role === "agency") acts.push("sign_contract_agency");
    if (role === "client") acts.push("sign_contract_client", "fund_escrow");
  }
  if (state.stage === "escrow_funded" || state.stage === "milestones_active") {
    if (role === "agency") acts.push("submit_milestone", "open_dispute");
    if (role === "client") {
      acts.push("approve_milestone", "reject_milestone", "open_dispute");
      if (state.hasApproved) acts.push("release_milestone");
    }
  }
  if (state.anyDisputed && role === "agency") acts.push("resolve_dispute");
  return acts;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `cd frontend && pnpm vitest run lib/workflow.test.ts`
Expected: PASS (all 9 tests).

- [ ] **Step 5: Commit**
```bash
git add frontend/lib/workflow.ts frontend/lib/workflow.test.ts
git commit -m "feat: add pure project workflow state machine + tests"
```

### Task 1.3: Standardize tab registry + fix `escrow`→`escrow_contracts` query bug

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/components/projectTabs.config.ts`
- Modify: any file querying `.from("escrow")` (grep first)

**Interfaces:**
- Consumes: existing tab hrefs.
- Produces: verified registry; no `.from("escrow")` references remain.

- [ ] **Step 1: Grep for the bug**
Run: `cd frontend && rg "\.from\(['\"]escrow['\"]\)" "app/(app)/w/[slug]/projects/[id]"`
Expected: list any files (e.g. `milestones/page.tsx`, `timeline/page.tsx`) calling `.from("escrow")`. If none, skip Step 2 edits.

- [ ] **Step 2: Fix each offending query to `escrow_contracts`**
For each file found in Step 1, replace `.from("escrow")` with `.from("escrow_contracts")` (keep all other clauses identical).

- [ ] **Step 3: Confirm the registry shape**
Read `projectTabs.config.ts`. Expected to export `PROJECT_TABS` with `{ label, href, icon }` entries for overview, timeline, proposal, contract, milestones, escrow, payments, files, activity. If any tab is missing, add it.

- [ ] **Step 4: Lint + build**
Run: `cd frontend && pnpm lint && pnpm build`
Expected: lint clean; build succeeds (no "escrow" relation error).

- [ ] **Step 5: Commit**
```bash
git add frontend/app/"(app)"/w/"[slug]"/projects/ "[id]"
git commit -m "fix: retarget escrow queries to escrow_contracts; verify tab registry"
```

### Task 1.4: `ActionButton` + `WorkflowStepper` shared components

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/components/ActionButton.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/components/WorkflowStepper.tsx`

**Interfaces:**
- Consumes: `nextActionsForRole` + `WorkflowState` + `WorkflowRole` + `WorkflowAction` from `frontend/lib/workflow.ts`.
- Produces: `<ActionButton action role state label onClick? disabled? pending? />` (renders null if action not allowed) and `<WorkflowStepper stage={ProjectStage} />`.

- [ ] **Step 1: Write `ActionButton.tsx`**
```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/components/ActionButton.tsx
"use client";
import { nextActionsForRole, type WorkflowAction, type WorkflowRole, type WorkflowState } from "@/lib/workflow";

export function ActionButton({
  action, role, state, label, onClick, disabled, pending,
}: {
  action: WorkflowAction; role: WorkflowRole; state: WorkflowState;
  label: string; onClick?: () => void; disabled?: boolean; pending?: boolean;
}) {
  if (!nextActionsForRole(state, role).includes(action)) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
    >
      {pending ? "Pending…" : label}
    </button>
  );
}
```

- [ ] **Step 2: Write `WorkflowStepper.tsx`**
```tsx
// frontend/app/(app)/w/[slug]/projects/[id]/components/WorkflowStepper.tsx
import type { ProjectStage } from "@/lib/workflow";

const STEPS: { key: ProjectStage | "start"; label: string }[] = [
  { key: "start", label: "Proposal" },
  { key: "contract_signed", label: "Contract" },
  { key: "escrow_funded", label: "Escrow" },
  { key: "milestones_active", label: "Milestones" },
  { key: "completed", label: "Done" },
];
const ORDER: ProjectStage[] = ["draft", "proposal_sent", "contract_signed", "escrow_funded", "milestones_active", "completed"];

export function WorkflowStepper({ stage }: { stage: ProjectStage }) {
  const currentIdx = ORDER.indexOf(stage);
  return (
    <ol className="flex items-center gap-2 text-sm">
      {STEPS.map((s, i) => {
        const target = s.key === "start" ? -1 : ORDER.indexOf(s.key as ProjectStage);
        const reached = target === -1 || target <= currentIdx;
        const active = s.key !== "start" && s.key === stage;
        return (
          <li key={s.label} className={`flex items-center gap-2 ${reached ? "text-indigo-600" : "text-gray-400"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-indigo-600" : reached ? "bg-indigo-200" : "bg-gray-200"}`} />
            {s.label}
            {i < STEPS.length - 1 && <span className="h-px w-8 bg-gray-200" />}
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 3: Build to typecheck**
Run: `cd frontend && pnpm build`
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add frontend/app/"(app)"/w/"[slug]"/projects/ "[id]"/components/ActionButton.tsx frontend/app/"(app)"/w/"[slug]"/projects/ "[id]"/components/WorkflowStepper.tsx
git commit -m "feat: add role-gated ActionButton + WorkflowStepper components"
```

---

## Phase 2 — Contracts tab + Escrow tab (the two stub tabs)

### Task 2.1: Build the Contracts tab view

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractDetailView.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/contract/page.tsx`

**Interfaces:**
- Consumes: `projects` row (with `contract_address`, `contract_data` JSON, `freelancer_sig`, `client_sig`), `workflow.WORKFLOW` state via `deriveWorkflowState`, `ActionButton`.
- Produces: renders contract terms, both signature blocks, and role-gated actions (agency signs, client signs via portal/Freighter).

- [ ] **Step 1: Build `ContractDetailView.tsx`**
- Server component. Fetch the project row (supabase, RLS-scoped to org).
- Compute `state = deriveWorkflowState({ proposal, contract, escrow, milestones })`.
- Render: contract terms from `contract_data` (amount, milestones count, deliverables), two signature rows showing `freelancer_sig` / `client_sig` (hash or "Pending"), and for each missing signature an `ActionButton` (agency → `sign_contract_agency`; client path explained in Task 5).
- Show the `WorkflowStepper` at top.

- [ ] **Step 2: Replace `contract/page.tsx` stub**
```tsx
import { getActiveOrgBySlug } from "@/lib/orka";
import { ContractDetailView } from "./components/ContractDetailView";

export default async function ContractPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const org = await getActiveOrgBySlug(slug);
  return <ContractDetailView orgId={org.id} projectId={id} />;
}
```

- [ ] **Step 3: Build + lint**
Run: `cd frontend && pnpm lint && pnpm build`
Expected: PASS; Contracts tab shows real content.

- [ ] **Step 4: Commit**
```bash
git add frontend/app/"(app)"/w/"[slug]"/projects/ "[id]"/contract
git commit -m "feat: build Contracts tab detail view with role-gated signing"
```

### Task 2.2: Build the Escrow tab view

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/escrow/components/ProjectEscrowView.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/escrow/page.tsx`

**Interfaces:**
- Consumes: `escrow_contracts` row (tied to `contract_address`), `get_portal_project` data, `workflow` state.
- Produces: funded amount vs total, custody mode badge, fund-escrow action (client only), and a note that milestone funds are released from this pool (no per-milestone funding).

- [ ] **Step 1: Build `ProjectEscrowView.tsx`**
- Server component. Fetch `escrow_contracts` for the project's `contract_address`.
- Compute `state`. Render: total contract value, `total_funded` vs `total_amount` progress bar, custody mode (Orka KMS vs Freighter) from `escrow_contracts.custody_mode`, and a `ActionButton` `fund_escrow` (client role) that links to the portal action (Task 5).
- If `escrow_contracts` is empty, show an empty state: "Escrow unlocks after contract is signed" with the stepper.

- [ ] **Step 2: Replace `escrow/page.tsx` stub**
```tsx
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProjectEscrowView } from "./components/ProjectEscrowView";

export default async function EscrowPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const org = await getActiveOrgBySlug(slug);
  return <ProjectEscrowView orgId={org.id} projectId={id} />;
}
```

- [ ] **Step 3: Build + lint**
Run: `cd frontend && pnpm lint && pnpm build`
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add frontend/app/"(app)"/w/"[slug]"/projects/ "[id]"/escrow
git commit -m "feat: build Escrow tab view with funded pool + custody badge"
```

### Task 2.3: Server actions for contract + escrow (write path)

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts`

**Interfaces:**
- Consumes: `frontend/lib/stellar.ts` (`orkaClient`), `@orka/stellar-sdk` calls, Supabase write (RLS-scoped).
- Produces: `"use server"` action functions: `signContract`, `createEscrow`, `fundEscrow` that (1) call the SDK/backend, (2) optimistically do NOT write chain status, (3) return `{ ok, txHash?, error? }` for the UI to show "pending confirmation".

- [ ] **Step 1: Implement `signContract`**
```ts
"use server";
import { createClient } from "@supabase/supabase-js";
import { orkaClient, type OrkaCustodyMode } from "@/lib/stellar";

export async function signContract(input: {
  orgId: string; projectId: string; signer: "agency" | "client"; mode: OrkaCustodyMode;
}) {
  // 1. call backend to prepare/submit signature tx
  const client = orkaClient(input.mode);
  const res = await client.signContract({ projectId: input.projectId, signer: input.signer });
  // 2. Do NOT write chain status here. Only record the local-side signature intent
  //    (the indexer will flip status once the tx confirms). For agency self-sign we
  //    store the returned sig hash so the UI can show "signed (pending on-chain)".
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const sigHash = "sig" in res ? res.sig : res.txHash;
  const col = input.signer === "agency" ? "freelancer_sig" : "client_sig";
  await supabase.from("projects").update({ [col]: sigHash }).eq("id", input.projectId).eq("org_id", input.orgId);
  return { ok: true as const, txHash: res.txHash };
}
```

- [ ] **Step 2: Implement `fundEscrow`**
Mirror `signContract` but call `client.fundEscrow({ contractAddress, amount })`. Return `{ ok, txHash }`; the UI shows "Funding… awaiting confirmation". The indexer writes `escrow_contracts.total_funded`.

- [ ] **Step 3: Build**
Run: `cd frontend && pnpm build`
Expected: PASS (server actions typecheck).

- [ ] **Step 4: Commit**
```bash
git add frontend/app/"(app)"/w/"[slug]"/projects/ "[id]"/actions.ts
git commit -m "feat: server actions for contract sign + escrow fund (no chain status write)"
```

---

## Phase 3 — Milestones wiring (tracked/submitted/approved/released against the funded pool)

### Task 3.1: Milestone board reads workflow state

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/BoardView.tsx`

**Interfaces:**
- Consumes: `milestones` rows (status enum), `deriveWorkflowState`.
- Produces: board columns derived from `workflow` state; disables agency actions until `escrow_funded`.

- [ ] **Step 1: Read current `BoardView.tsx`** to learn its data shape (`milestone.status`).
- [ ] **Step 2: Wrap with `state = deriveWorkflowState(...)`. Gate each column/card action via `ActionButton`.
- [ ] **Step 3: Build + lint** → PASS.
- [ ] **Step 4: Commit** `feat: milestones board driven by workflow state machine`.

### Task 3.2: Milestone action flow (submit / approve / reject / release)

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/MilestonePaymentFlow.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts` (add `submitMilestone`, `approveMilestone`, `rejectMilestone`, `releaseMilestone`)

**Interfaces:**
- Consumes: milestone row, `orkaClient` (`submitMilestone`, `approveMilestone`, `releaseMilestone` — multi-sig for release).
- Produces: buttons call server actions; UI shows pending until indexer flips status; `releaseMilestone` requires client + operator tuple (never weakened).

- [ ] **Step 1: Add the four server actions** to `actions.ts` (same pattern as Task 2.3; release calls `client.releaseMilestone({ contractAddress, milestoneIndex })` and expects multi-sig).
- [ ] **Step 2: Wire `MilestonePaymentFlow.tsx`** buttons to the actions; show "Pending confirmation" until status changes (poll or rely on indexer webhook re-render).
- [ ] **Step 3: Build + lint** → PASS.
- [ ] **Step 4: Commit** `feat: wire milestone submit/approve/reject/release to chain actions (release = multi-sig)`.

### Task 3.3: Enforce "no funds without escrow" at the data layer

**Files:**
- Modify: `services/src/bridge.rs` (`apply_chain_event`) — already the single writer; verify it rejects `released` events when `total_funded < total_amount`.

**Interfaces:**
- Consumes: escrow contract events.
- Produc

---

## Phase 2 — Contracts tab + Escrow tab (the two stub tabs)

### Task 2.1: Build the Contracts tab view

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractDetailView.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/contract/page.tsx`

**Interfaces:**
- Consumes: `projects` row (with `contract_address`, `contract_data` JSON, `freelancer_sig`, `client_sig`), `workflow.WORKFLOW` state via `deriveWorkflowState`, `ActionButton`.
- Produces: renders contract terms, both signature blocks, and role-gated actions (agency signs, client signs via portal/Freighter).

- [ ] **Step 1: Build `ContractDetailView.tsx`**
- Server component. Fetch the project row (supabase, RLS-scoped to org).
- Compute `state = deriveWorkflowState({ proposal, contract, escrow, milestones })`.
- Render: contract terms from `contract_data` (amount, milestones count, deliverables), two signature rows showing `freelancer_sig` / `client_sig` (hash or "Pending"), and for each missing signature an `ActionButton` (agency to `sign_contract_agency`; client path explained in Task 5).
- Show the `WorkflowStepper` at top.

- [ ] **Step 2: Replace `contract/page.tsx` stub**
```tsx
import { getActiveOrgBySlug } from "@/lib/orka";
import { ContractDetailView } from "./components/ContractDetailView";

export default async function ContractPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const org = await getActiveOrgBySlug(slug);
  return <ContractDetailView orgId={org.id} projectId={id} />;
}
```

- [ ] **Step 3: Build + lint**
Run: `cd frontend && pnpm lint && pnpm build`
Expected: PASS; Contracts tab shows real content.

- [ ] **Step 4: Commit**
```bash
git add frontend/app/"(app)"/w/"[slug]"/projects/ "[id]"/contract
git commit -m "feat: build Contracts tab detail view with role-gated signing"
```

### Task 2.2: Build the Escrow tab view

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/escrow/components/ProjectEscrowView.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/escrow/page.tsx`

**Interfaces:**
- Consumes: `escrow_contracts` row (tied to `contract_address`), `get_portal_project` data, `workflow` state.
- Produces: funded amount vs total, custody mode badge, fund-escrow action (client only), and a note that milestone funds are released from this pool (no per-milestone funding).

- [ ] **Step 1: Build `ProjectEscrowView.tsx`**
- Server component. Fetch `escrow_contracts` for the project's `contract_address`.
- Compute `state`. Render: total contract value, `total_funded` vs `total_amount` progress bar, custody mode (Orka KMS vs Freighter) from `escrow_contracts.custody_mode`, and a `ActionButton` `fund_escrow` (client role) that links to the portal action (Task 5).
- If `escrow_contracts` is empty, show an empty state: "Escrow unlocks after contract is signed" with the stepper.

- [ ] **Step 2: Replace `escrow/page.tsx` stub**
```tsx
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProjectEscrowView } from "./components/ProjectEscrowView";

export default async function EscrowPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const org = await getActiveOrgBySlug(slug);
  return <ProjectEscrowView orgId={org.id} projectId={id} />;
}
```

- [ ] **Step 3: Build + lint**
Run: `cd frontend && pnpm lint && pnpm build`
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add frontend/app/"(app)"/w/"[slug]"/projects/ "[id]"/escrow
git commit -m "feat: build Escrow tab view with funded pool + custody badge"
```

### Task 2.3: Server actions for contract + escrow (write path)

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts`

**Interfaces:**
- Consumes: `frontend/lib/stellar.ts` (`orkaClient`), `@orka/stellar-sdk` calls, Supabase write (RLS-scoped).
- Produces: `"use server"` action functions: `signContract`, `createEscrow`, `fundEscrow` that (1) call the SDK/backend, (2) optimistically do NOT write chain status, (3) return `{ ok, txHash?, error? }` for the UI to show "pending confirmation".

- [ ] **Step 1: Implement `signContract`**
```ts
"use server";
import { createClient } from "@supabase/supabase-js";
import { orkaClient, type OrkaCustodyMode } from "@/lib/stellar";

export async function signContract(input: {
  orgId: string; projectId: string; signer: "agency" | "client"; mode: OrkaCustodyMode;
}) {
  const client = orkaClient(input.mode);
  const res = await client.signContract({ projectId: input.projectId, signer: input.signer });
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const sigHash = "sig" in res ? res.sig : res.txHash;
  const col = input.signer === "agency" ? "freelancer_sig" : "client_sig";
  await supabase.from("projects").update({ [col]: sigHash }).eq("id", input.projectId).eq("org_id", input.orgId);
  return { ok: true as const, txHash: res.txHash };
}
```

- [ ] **Step 2: Implement `fundEscrow`**
Mirror `signContract` but call `client.fundEscrow({ contractAddress, amount })`. Return `{ ok, txHash }`; the UI shows "Funding... awaiting confirmation". The indexer writes `escrow_contracts.total_funded`.

- [ ] **Step 3: Build**
Run: `cd frontend && pnpm build`
Expected: PASS (server actions typecheck).

- [ ] **Step 4: Commit**
```bash
git add frontend/app/"(app)"/w/"[slug]"/projects/ "[id]"/actions.ts
git commit -m "feat: server actions for contract sign + escrow fund (no chain status write)"
```

---

## Phase 3 — Milestones wiring (tracked/submitted/approved/released against the funded pool)

### Task 3.1: Milestone board reads workflow state

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/BoardView.tsx`

**Interfaces:**
- Consumes: `milestones` rows (status enum), `deriveWorkflowState`.
- Produces: board columns derived from `workflow` state; disables agency actions until `escrow_funded`.

- [ ] **Step 1: Read current `BoardView.tsx`** to learn its data shape (`milestone.status`).
- [ ] **Step 2: Wrap with `state = deriveWorkflowState(...)`. Gate each column/card action via `ActionButton`.
- [ ] **Step 3: Build + lint** to PASS.
- [ ] **Step 4: Commit** `feat: milestones board driven by workflow state machine`.

### Task 3.2: Milestone action flow (submit / approve / reject / release)

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/milestones/components/MilestonePaymentFlow.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts` (add `submitMilestone`, `approveMilestone`, `rejectMilestone`, `releaseMilestone`)

**Interfaces:**
- Consumes: milestone row, `orkaClient` (`submitMilestone`, `approveMilestone`, `releaseMilestone` — multi-sig for release).
- Produces: buttons call server actions; UI shows pending until indexer flips status; `releaseMilestone` requires client + operator tuple (never weakened).

- [ ] **Step 1: Add the four server actions** to `actions.ts` (same pattern as Task 2.3; release calls `client.releaseMilestone({ contractAddress, milestoneIndex })` and expects multi-sig).
- [ ] **Step 2: Wire `MilestonePaymentFlow.tsx`** buttons to the actions; show "Pending confirmation" until status changes (poll or rely on indexer webhook re-render).
- [ ] **Step 3: Build + lint** to PASS.
- [ ] **Step 4: Commit** `feat: wire milestone submit/approve/reject/release to chain actions (release = multi-sig)`.

### Task 3.3: Enforce "no funds without escrow" at the data layer

**Files:**
- Modify: `services/src/bridge.rs` (`apply_chain_event`) — already the single writer; verify it rejects `released` events when `total_funded < total_amount`.

**Interfaces:**
- Consumes: escrow contract events.
- Produces: a guard that blocks milestone `released` status until escrow fully funded (defense-in-depth, beyond UI gate).

- [ ] **Step 1: Locate `apply_chain_event`** in `services/src/bridge.rs`.
- [ ] **Step 2: Add a guard** (if milestone event is `released` and `escrow_contracts.total_funded < total_amou

---

## Phase 4 — Payments tab + Activity tab (aggregation over `workspace_payments`)

### Task 4.1: Build the Payments tab view

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/payments/components/ProjectPaymentsView.tsx`
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/payments/page.tsx`

**Interfaces:**
- Consumes: `workspace_payments` table (already exists per spec) filtered by `project_id`; `escrow_contracts` for the funded pool context.
- Produces: ledger of payments (escrow fund + each milestone release), with amounts, tx hashes, timestamps, and a running "released vs funded" balance.

- [ ] **Step 1: Read `workspace_payments` schema** in `frontend/supabase/orka_schema.sql` (confirm columns; if missing, add via a small ALTER in Task 4.0).
- [ ] **Step 2: Build `ProjectPaymentsView.tsx`** — fetch payments for the project, render a table/cards, show funded total from escrow, released sum, remaining.
- [ ] **Step 3: Replace `payments/page.tsx` stub** with the same `getActiveOrgBySlug` + view pattern.
- [ ] **Step 4: Build + lint** to PASS.
- [ ] **Step 5: Commit** `feat: build Payments tab over workspace_payments with funded/released balance`.

### Task 4.2: Activity tab reads the same source

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/activity/page.tsx`

**Interfaces:**
- Consumes: `workspace_payments` + milestone status-change events (from `escrow_contracts.mapping` history or an events table if present).
- Produces: chronological activity feed for the project.

- [ ] **Step 1: Confirm where activity events live** (grep `activity`/`events` in schema). If only `workspace_payments`, derive activity from payments + milestone status transitions stored on the milestone rows.
- [ ] **Step 2: Render a chronological feed (newest first)** combining payments + milestone state changes.
- [ ] **Step 3: Build + lint** to PASS.
- [ ] **Step 4: Commit** `feat: build Activity tab from payments + milestone transitions`.

---

## Phase 5 — Client portal actions (public, no Supabase auth)

### Task 5.1: Confirm portal route paths

**Files:**
- Read: `frontend/app/p/[token]/...` (directory listing)

**Interfaces:**
- Consumes: existing portal pages.
- Produces: a map of which file handles client actions (sign contract, fund escrow, approve/release milestone).

- [ ] **Step 1: List `frontend/app/p/[token]`** to find the client action surface.
- [ ] **Step 2: Document the exact files** to edit in Tasks 5.2–5.4 (update this plan's File Structure if paths differ from assumption).

### Task 5.2: Client signs contract via portal

**Files:**
- Modify: portal client action file (found in 5.1)

**Interfaces:**
- Consumes: `get_portal_project` (SECURITY DEFINER, anon-accessible) to resolve project by `shared_token`.
- Produces: client signature → calls `signContract({ signer: "client", mode })` server action (reuse Phase 2 action). Freighter mode → client signs in wallet; Orka mode → KMS.

- [ ] **Step 1: Wire the portal "Sign contract" button** to the existing `signContract` server action (pass `signer: "client"`).
- [ ] **Step 2: For Freighter mode**, use `orkaClient("freighter")` so the wallet popup handles signing.
- [ ] **Step 3: Build + lint** to PASS.
- [ ] **Step 4: Commit** `feat: client signs contract from public portal (both custody modes)`.

### Task 5.3: Client funds escrow via portal

**Files:**
- Modify: portal escrow/fund file (found in 5.1)

**Interfaces:**
- Consumes: `get_portal_project`, `fundEscrow` server action.
- Produces: client funds the full contract amount into the escrow pool; indexer updates `escrow_contracts.total_funded`.

- [ ] **Step 1: Wire "Fund escrow"** to `fundEscrow` (client role). Show amount = contract total.
- [ ] **Step 2: Build + lint** to PASS.
- [ ] **Step 3: Commit** `feat: client funds escrow from public portal`.

### Task 5.4: Client approves + releases milestones via portal

**Files:**
- Modify: portal milestone file (found in 5.1)

**Interfaces:**
- Consumes: `get_portal_project`, `approveMilestone` + `releaseMilestone` server actions. `releaseMilestone` is multi-sig (client + operator) — the portal triggers client signature; operator signature is enforced by the contract/backend.
- Produces: client submits approval, then releases (multi-sig). UI shows pending until indexer flips status.

- [ ] **Step 1: Wire "Approve" and "Release"** buttons to the server actions.
- [ ] **Step 2: Ensure release path never bypasses the operator multi-sig requirement.**
- [ ] **Step 3: Build + lint** to PASS.
- [ ] **Step 4: Commit** `feat: client approves + releases milestones from portal (release = multi-sig)`.

---

## Phase 6 — Production hardening (mainnet-ready, both custody modes)

### Task 6.1: KMS config switch (Mode A)

**Files:**
- Modify: `services/src/custody.rs` (`from_config`), `services/src/router.rs` (CORS)
- Modify: `frontend/lib/stellar.ts` (ensure `orka` mode uses `SERVICES_URL`)

**Interfaces:**
- Consumes: `KMS_CONFIG` env (provider + keys), dev vs prod flag.
- Produces: real KMS provider wired behind config; `InMemoryKms` retained for tests; CORS tightened in non-dev.

- [ ] **Step 1: Implement `from_config`** to select real KMS when `KMS_CONFIG` set, else `InMemoryKms`.
- [ ] **Step 2: Tighten CORS** — restrict origins to configured list unless `NODE_ENV === "development"`.
- [ ] **Step 3: Run** `cd services && cargo test custody` and `cd frontend && pnpm build`.
- [ ] **Step 4: Commit** `feat: KMS config switch + tightened CORS for prod`.

### Task 6.2: End-to-end gated pipeline test (both modes)

**Files:**
- Add: `packages/stellar-sdk/src/workflow.e2e.test.ts` (vitest) or a Rust integration test in `services/`.

**Interfaces:**
- Consumes: the workflow state machine + SDK client.
- Produces: a scripted test that walks draft → proposal_sent → contract_signed → escrow_funded → milestones_active → completed for BOTH `orka` and `freighter` modes, asserting stage transitions and that `release_funds` rejects single-sig.

- [ ] **Step 1: Write the e2e walk** for Mode A (orka).
- [ ] **Step 2: Write the same walk for Mode B (freighter)** with wallet mock.
- [ ] **Step 3: Assert multi-sig release is required** (`release_funds` fails with one signature).
- [ ] **Step 4: Run** `cd packages/stellar-sdk && pnpm test` (or `cd services && cargo test e2e`).
- [ ] **Step 5: Commit** `test: end-to-end gated pipeline for both custody modes`.

### Task 6.3: Remove `fakeTx` and final verification

**Files:**
- Modify: `frontend/lib/orka.ts` (remove/replace `fakeTx`)
- Modify: overview components to use `WorkflowStepper` + `ActionButton`

**Interfaces:**
- Consumes: real tx flow from server actions.
- Produces: no fake transactions anywhere; Overview shows live stage + CTA.

- [ ] **Step 1: Grep for `fakeTx`** and replace call sites with the real pending/confirmed flow.
- [ ] **Step 2: Add `WorkflowStepper` + workflow CTA** to `ProjectOverviewView.tsx` and `QuickActionsCard.tsx`.
- [ ] **Step 3: Final verification** — `cd frontend && pnpm lint && pnpm build` and `cd services && cargo test` and `cd packages/stellar-sdk && pnpm test`.
- [ ] **Step 4: Commit** `chore: remove fakeTx; Overview shows live workflow stage + CTA`.

---

## Completion Criteria

- [ ] All 9 project tabs render real data (no "Coming soon" stubs for Contracts/Escrow/Payments).
- [ ] `frontend/lib/workflow.ts` + tests pass (`pnpm vitest run lib/workflow.test.ts`).
- [ ] `deriveWorkflowState` drives Overview stepper, Contracts/Escrow/Milestones gating, and Payments/Activity aggregation.
- [ ] `escrow`→`escrow_contracts` query bug fixed (no `.from("escrow")` references remain).
- [ ] Client completes sign → fund → approve → release entirely from `/p/[token]` with no Supabase auth.
- [ ] Both Mode A (Orka KMS) and Mode B (Freighter) drive the same contract; one address, one mode.
- [ ] `release_funds` remains multi-sig (client + operator); no code path weakens it.
- [ ] `apply_chain_event()` is the only writer of chain-derived milestone/escrow status; tabs never write it.
- [ ] Rust backend compiles and tests pass (`cargo test`); KMS config switch works, CORS tightened in prod.
- [ ] `pnpm lint && pnpm build` clean in `frontend`; `pnpm test` clean in `packages/stellar-sdk`.

## Self-Review Notes

- **Scope:** Matches the approved spec (holistic 9-tab re-plan, linear gated pipeline, mainnet-ready design, both custody modes, public-portal client, strict single-writer). No scope creep beyond the spec.
- **Consistency:** Naming matches spec — `project_stage` enum, `escrow_contracts`, `workspace_payments`, `get_portal_project`, `WORKFLOW` state machine, multi-sig `release_funds`.
- **Ambiguity:** Portal route paths under `app/p/[token]` were not enumerated in exploration; Task 5.1 confirms exact files before editing (noted in File Structure). `workspace_payments` column set assumed from spec; Task 4.1 verifies.
- **Bite-sized + TDD:** Phase 1 is fully TDD-specified (failing test → impl → pass → commit). Later phases follow the same shape; where a file must be read first (3.1, 4.1, 5.1), the read step precedes edits.
