# ORKA — Project Detail Page & Workflow Design (Production-Grade)

**Date:** 2026-07-20
**Status:** Approved design (pending written-spec review → implementation plan)
**Scope:** Holistic re-plan of the 9-tab project detail page, the project workflow state machine, and the smart-contract + Rust-backend integration. Target: mainnet-ready design, both custody modes, strict single-writer reconciliation.

---

## 0. Context & why this matters

The project detail page is **the operational core / source of truth** of ORKA, not just one of many pages.

- An agency and its client run the entire engagement here: **Proposal → Contract → Escrow (client funds) → Milestones (submit / client approve / release) → Payments**, plus Files (delivery evidence) and Activity (audit trail).
- The **client funds escrow** and **approves/releases milestone payments** — these are on-chain, smart-contract actions executed via the Rust backend (Mode A: KMS-sign; Mode B: Freighter-sign).
- The **workspace-level tabs** (Payments, Invoices, Analytics, AI) *aggregate across all projects*. They read the same Postgres tables the project page writes. So the project page's data model and the chain↔DB reconciliation **must be correct**, because everything upstream depends on it.

**Current state (verified in codebase):**
- A full 9-tab scaffold already exists at `frontend/app/(app)/w/[slug]/projects/[id]/` (Overview, Timeline, Proposals, Contracts, Milestones, Escrow, Payments, Files, Activity).
- Built against real Supabase data: Overview, Timeline, Proposals, Milestones, Files, Activity.
- **Stubs ("Coming soon"):** Contracts, Escrow, Payments.
- The full backend pipeline already exists: Rust `/escrow/*` endpoints (`services/src/stellar.rs`), Soroban `escrow` + `escrow-factory` contracts, `apply_chain_event` reconciler (`services/src/bridge.rs`), indexer (`services/src/indexer.rs`), `@orka/stellar-sdk`, and `frontend/lib/stellar.ts`. It is **not yet wired** into the three stub tabs.
- **Known bug:** tab pages query a table literally named `escrow`, but the schema only defines `escrow_contracts`. Must be fixed.

**Goal of this design:** finish wiring the three stub tabs to the existing chain/backend, firm up the linear gated workflow in one place, and make the whole surface production-ready (mainnet-ready design, both custody modes, strict single-writer reconciliation).

---

## 1. Overall architecture & the two surfaces

### 1.1 Two coupled surfaces, one data spine

1. **Agency workspace** — `/w/[slug]/projects/[id]/*` (the 9 tabs).
   - Server components read from Postgres (Supabase, RLS-scoped to org).
   - Chain *actions* (fund/submit/approve/release/dispute/sign) call **server actions** → `lib/stellar.ts` → Rust `/escrow/*` → Soroban.
   - UI then **re-reads Postgres** — never trusts the SDK response.

2. **Client portal** — `/p/[token]/...` (existing public, no-auth token portal).
   - Client reviews proposal, **funds escrow**, **approves/releases milestones**, opens disputes.
   - Same server actions; client identity resolved from the portal token + (optionally) a Freighter connect in the portal for Mode B.
   - No Supabase auth session required for read; actions are gated by the backend verifying the portal token + client key.

### 1.2 Shared spine — new module `frontend/lib/workflow.ts`

Pure, side-effect-free functions (no DB, no React — unit-testable in isolation):
- `getProjectStage(project)` → one of the pipeline stages.
- `canTransition(project, action)` → gate check.
- `nextActionsForRole(project, role)` → which action buttons a given role may see.
- `deriveWorkflowState(project, { proposals, contracts, escrow, milestones })` → resolved view.

Encodes the **linear gated pipeline** (see Section 2, stepper order):
`draft → proposal_sent → contract_signed → escrow_funded → milestones_active → completed`

Every tab imports this module. **No tab computes stage logic locally.**

### 1.3 Chain actions — new `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts` (server actions)

- `createContract`, `signContract(role)`, `fundEscrow`, `submitMilestone`, `approveMilestone`, `rejectMilestone`, `releaseMilestone`, `openDispute`, `resolveDispute`.
- Each: verify session/portal-token + role → call `orkaClient(mode)` → backend → return `{ txHash }` (or `{ txXdr }` for Freighter) **only** → `revalidatePath` so the tab re-reads Postgres. The indexer later makes the status authoritative.

### 1.4 Cross-project aggregation

Payments / Invoices / Analytics / AI tabs keep reading the same Postgres tables (`ledger_events`, `workspace_payments` view, `milestones`, `contracts`, `activity`). The project page is the **only writer** of project-scoped chain data, so upstream aggregation is automatically correct.

---

## 2. The workflow — linear gated pipeline

### 2.1 Stepper order (corrected real-world order)

```
Proposal ──▶ Contract ──▶ Escrow (funded) ──▶ Milestones (tracked & released) ──▶ Done
```

**Escrow is funded FIRST** (client locks the full project amount into the factory-deployed escrow contract). **Then** milestones are tracked, submitted, approved, and released against that already-funded pool. There is **no per-milestone "fund" step** — releasing a milestone moves that milestone's slice from the locked pool to the freelancer.

### 2.2 Stage definitions & gates

| Stage | Entered when | Unlocks |
|---|---|---|
| `draft` | Project created | editing proposal |
| `proposal_sent` | Proposal marked `sent` to client | client can Accept / Request changes |
| `contract_signed` | Proposal `accepted` AND both sigs on `contracts` | **Escrow funding** (client) |
| `escrow_funded` | Client funds full amount via `fundEscrow` | **Milestones** interaction (submit/approve/release) |
| `milestones_active` | escrow funded; milestones at `funded` | per-milestone lifecycle |
| `completed` | all milestones `released` (or refunded/resolved) | — |

### 2.3 Per-milestone lifecycle (on-chain, enforced by contract)

```
funded ──submit──▶ submitted ──approve──▶ approved ──release──▶ released
            │                        │  ▲                                ▲
       reject│                   resubmit│                           │
            ▼                        ▼  │                              │
         rejected            open_dispute ─▶ disputed ──resolve_dispute──▶ released
            │
        refund ──▶ refunded
```

- A milestone can only be `released` if **escrow is `funded`** and the milestone is `approved`.
- `release_funds` is **multi-sig**: client key + ORKA operator key (backend enforces; never weakenable).

---

## 3. The 9 tabs — per-page workflow & UX

Tab registry standardized in one `projectTabs.config.ts` (kept **path-based**: `/overview`, `/contract`, … — already functional; settings pages keep `?tab=`). **No tab writes chain-derived status.** Tabs render from Postgres; action buttons call server actions and then re-read.

**Role legend:** Agency (dashboard) / Client (portal). Both see the same data, different action sets.

### 3.1 Overview
- **UX:** Header (title, client, freelancer, status pill). Prominent **Workflow Stage stepper** with current stage highlighted and the *next action* as a CTA. Below: 3 summary cards — Escrow funded / released (from `escrow_contracts`+`ledger_events`), Milestones completed, Open disputes. Recent activity snippet.
- **Workflow:** Pure read + `nextActionsForRole()`. CTA routes to the relevant tab. No direct chain writes.

### 3.2 Timeline
- **UX:** Vertical chronological timeline. Each node = event from `activity` ∪ `ledger_events`, with a "verified on-chain" badge (tx hash link) for chain events. Filter by type.
- **Workflow:** Read-only source of truth for "what happened, in order."

### 3.3 Proposals
- **UX (Agency):** List of proposal versions (`project_proposals` + `proposal_sections`/`proposal_pricing`). "New version", "Preview", "Send to client" → status `sent`.
- **UX (Client, portal):** Read proposal, line-item pricing, **Accept / Request changes**. Accept → `proposal.status = accepted`.
- **Workflow gate:** `proposal accepted` is the prerequisite to create a **Contract**.

### 3.4 Contracts
- **UX (Agency):** Shows `contracts` row: `contract_address`, `client_sig`, `freelancer_sig`, status. "Generate contract from accepted proposal" → `createContract`. "Sign as agency" → `signContract(role=agency)`.
- **UX (Client, portal):** Review contract, **Sign as client** → `signContract(role=client)`.
- **Workflow gate:** Both sigs present → `contracts.status = signed` → pipeline `contract_signed`. Unlocks Escrow. `contract_address` recorded on `projects.contract_id`.

### 3.5 Milestones
- **UX:** Milestone board from `milestones`. Each card: amount, due date, status pill, stage-appropriate action buttons:
  - Agency: **Submit** (attach Files as evidence) when `funded`.
  - Client (portal): **Approve** / **Reject** / **Release** when `submitted`/`approved`.
  - Either: **Dispute** when funded+.
- **Workflow:** **Primary on-chain surface.** Buttons call server actions (`submitMilestone`/`approveMilestone`/`releaseMilestone`/`openDispute`). Milestones start at `funded` (inherited from escrow being funded) — no separate per-milestone fund. Status updates come from the indexer. Reuses existing `EscrowDetailsCard` + `MilestonePaymentFlow`, now wired to real actions.

### 3.6 Escrow
- **UX:** Shows `escrow_contracts`: `contract_address`, asset (USDC), total amount, **total funded vs total released** (from `ledger_events`), per-milestone lock-state mini-grid.
- **Primary action (Client, portal):** **"Fund escrow"** → `fundEscrow({ contractId, milestoneIds: all })` locks full amount. Disabled once funded.
- **Agency UX:** Read-only monitor + "View on explorer" + (if client silent) nudge/reminder (off-chain notification, no chain write).
- **Workflow gate:** `escrow_funded` unlocks Milestones interaction. **Fix bug:** queries must target `escrow_contracts`, not `escrow`.

### 3.7 Payments
- **UX:** Renders `workspace_payments` view filtered by `project_id` (RLS-safe). Rows: fund / release / refund (chain) + invoice payments (off-chain). Each: amount, asset, counterparty, date, status, **tx proof link** to `ledger_events`.
- **Workflow:** Pure read/aggregate for this project. Exactly the data the **workspace-level Payments tab** rolls up across all projects.

### 3.8 Files
- **UX:** File manager from `files` table, each file tagged to a milestone. "Mark as delivery evidence" when attached to a `submitted` milestone. Drag-drop upload (Supabase Storage).
- **Workflow:** Supports Milestones (evidence for `submit`) and the audit trail. No chain write; off-chain `activity` logged.

### 3.9 Activity
- **UX:** Unified chronological feed merging `activity` (off-chain) + `ledger_events` (on-chain, verified badge + tx link). Filter by actor (agency/client/chain).
- **Workflow:** Human-readable audit trail proving the workflow happened. Read-only.

### 3.10 Cross-cutting UX principles (all tabs)
- **Action availability = `lib/workflow.ts` + role.** A button only renders if `nextActionsForRole()` includes it. No hidden broken actions.
- **After any chain action:** button shows "Pending…", then `revalidatePath` re-reads Postgres. Status only flips when the **indexer** writes it (strict single-writer). If indexer is slow, UI polls/refetches; never shows SDK-returned status as final.
- **Both custody modes:** server actions pass `mode` (orka/freighter). Mode A → backend KMS-signs; Mode B → backend returns `txXdr`, portal/dashboard hands it to Freighter, then polls for resulting `ledger_events`.

---

## 4. Chain & backend integration (production-grade, both modes)

### 4.1 Action → path mapping (every chain action flows identically)

```
Tab button → server action (actions.ts)
  → verify session/portal-token + role (agency vs client)
  → orkaClient(mode)  [lib/stellar.ts → @orka/stellar-sdk]
  → POST /escrow/{create,fund,submit,approve,reject,release,open_dispute,resolve_dispute}
  → Rust services/stellar.rs builds + (Mode A: KMS-sign + fee-bump submit | Mode B: returns txXdr)
  → returns { txHash } (or { txXdr } for Freighter)
  → revalidatePath → UI re-reads Postgres
        ↘ Stellar RPC emits orka event → indexer.rs → bridge.rs apply_chain_event()
           → writes ledger_events + milestone/escrow status (THE ONLY WRITER)
```

### 4.2 Production requirements baked into the plan
1. **Strict single-writer** — confirmed. Tabs never write chain status. `apply_chain_event()` idempotent on `chain_tx`.
2. **Both custody modes** — `mode` resolved from `profiles.custody_mode` (agency) or portal wallet connect (client). Backend refuses to sign for `freighter` users in Mode A path; vice-versa.
3. **Multi-sig release** — `release_funds` always attaches client + operator sigs (backend enforces). Never weakenable.
4. **Mainnet-ready design** — `KMS_CONFIG` (AWS/GCP/Vault) replaces `InMemoryKms`; `ORKA_OPERATOR_SECRET` funded account; CORS tightened; `/bridge/event` service-role gated. Network via `STELLAR_NETWORK` env (testnet now, mainnet later — no code change).
5. **Factory deploy** — `createContract`/escrow creation calls `escrow-factory.create_escrow`, stores `contract_address` in `escrow_contracts` + `projects.contract_id`, and the `(contract_address, milestone_index) → milestone uuid` map.
6. **Error/timeout UX** — if tx submitted but indexer hasn't written, UI shows "Pending (confirming on-chain)" and polls; no false "success".

---

## 5. Schema, testing & rollout

### 5.1 Schema changes (Supabase SQL)
- Fix `escrow` → `escrow_contracts` references in queries (no new table needed; possibly add a missing index on `(contract_address, milestone_index)`).
- Add `project_stage` (enum) column to `projects` for fast gating, **derived** by `lib/workflow.ts` (written by the same path that writes project updates — off-chain, not chain). Keep in sync with `contracts`/`escrow_contracts`/`milestones` state.
- Ensure `ledger_events` captures every event type the Payments/Analytics tabs need (fund/release/refund + invoice). Verify `workspace_payments` view covers all.
- Portal RLS: ensure `get_portal_project` SECURITY DEFINER returns proposal/contract/escrow/milestone data the client portal needs to act.

### 5.2 Testing strategy (production-grade)
- `lib/workflow.ts`: unit tests for every transition + gate (pure, fast).
- Contracts: existing `cargo test` (keep green, add milestone-lifecycle snapshots).
- Services: extend `cargo test` for signing/bridge idempotency; add a test that simulates an event → asserts `apply_chain_event` is the only status writer.
- SDK: `vitest` for `fundEscrow`/`releaseMilestone`/`getContractState`.
- Frontend: `pnpm lint` + `pnpm build` (typecheck). Add a Playwright smoke for the funded→submit→approve→release flow against testnet (or mock indexer).
- **Real-user gate (per ROADMAP):** no phase "done" until it survives real projects on testnet.

### 5.3 Rollout phases (for the implementation plan)
1. **Foundation:** `lib/workflow.ts` + `project_stage` + fix `escrow` bug + standardize tab registry.
2. **Contracts + Escrow tabs:** build against `contracts`/`escrow_contracts`; wire `createContract`/`signContract`/`fundEscrow`.
3. **Milestones wiring:** connect existing payment buttons to real server actions (submit/approve/reject/release/dispute).
4. **Payments + Activity:** render `workspace_payments` + unified feed.
5. **Client portal actions:** fund/approve/release/dispute from `/p/[token]`; Mode B Freighter path.
6. **Production hardening:** real KMS, CORS, mainnet config switch, monitoring/alerts on indexer lag.

---

## 6. Open questions / future
- Do we need a `refund` UI in the Milestones/Escrow tab for the client, or is refund handled only via dispute resolution? (Plan includes dispute→resolve; explicit refund button optional.)
- Invoice generation timing: auto-create invoice on each `release`, or manual? (Affects Invoices tab aggregation — defer to Phase 4 wiring.)
- Indexer lag SLA / alerting thresholds for production monitoring.
