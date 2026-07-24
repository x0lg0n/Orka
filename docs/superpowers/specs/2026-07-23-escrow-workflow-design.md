# Escrow Workflow Design — ORKA

**Date:** 2026-07-23
**Status:** Draft
**Scope:** Complete escrow workflow from milestone setup through payment release

---

## 1. Overview

This spec covers the end-to-end escrow workflow for ORKA projects. The flow follows:

```
Proposal (what) → Legal Contract (what + how much + when) → Milestone Setup → Escrow Deployment (on-chain) → Funding → Work & Release
```

**Key distinction:** The "contract" in the contract editor is a **legal contract document** (signed by both parties). The Soroban **smart contract** is the on-chain escrow deployed later. These are separate concepts.

**Approach:** Hybrid milestone creation. Milestones are described in the legal contract text, then manually entered as structured data in the Milestones page. The architecture is AI-ready — when AI is added later, it can auto-parse contract text into structured milestones for review.

---

## 2. Complete User Flow

### Phase 1: Proposal Creation (already exists)
- Agency creates proposal with work scope
- Client reviews and requests changes via portal
- Proposal finalized

### Phase 2: Legal Contract Creation (already exists)
- Contract document generated from proposal
- Includes payment terms and milestone descriptions as text
- Client reviews, requests changes
- Both parties sign the legal contract document
- Contract stored in `project_contracts` table with signatures

### Phase 3: Milestone Setup (to build)
- After legal contract is signed, agency navigates to Milestones page
- System shows "Set Up Milestones" empty state
- Agency manually enters structured milestone data:
  - Title
  - Amount (numeric)
  - Asset (XLM / USDC)
  - Due date (optional)
  - Description (what deliverables are expected)
- Milestones saved to `milestones` table with `status: 'draft'`
- Agency reviews the complete milestone list before proceeding

### Phase 4: Escrow Deployment (to build)
- Agency clicks "Deploy Escrow to Stellar"
- Pre-deployment checklist verified: contract signed, milestones defined
- Backend calls Soroban `initialize()` with all draft milestones
- Soroban contract deployed, returns contract address (e.g., `C...`)
- Address stored in `projects.contract_id` and `escrow_contracts` table
- Milestones remain `status: 'draft'` (not yet funded)

### Phase 5: Escrow Funding (to build)
- Client accesses project via portal link (`/p/[token]`)
- Sees escrow details: contract address, total amount, milestones
- Client funds escrow:
  - Mode A (Orka-managed): Backend KMS-signs, sponsored fee_bump
  - Mode B (Self-custody): Returns XDR for Freighter signing
- Backend calls Soroban `fund(milestone_ids)`
- Indexer watches chain → bridge updates `milestones.status = 'funded'`

### Phase 6: Work & Milestone Releases (to build)
- Freelancer delivers work, uploads files, clicks "Submit Milestone"
- Client reviews deliverables, approves or rejects
- On approval, client clicks "Release Payment"
- Multi-sig release (client key + operator key) transfers funds
- Indexer → bridge → `milestones.status = 'released'`
- Activity logged, timeline updated
- Repeat for each milestone until all released → project complete

---

## 3. Database Schema

### Existing Tables (no changes needed)

**`projects`** — Core project record
- `contract_id` (text) — Soroban contract address (null until deployed)
- `client_sig`, `freelancer_sig` — Legal contract signatures
- `shared_token` (uuid) — Portal access token

**`milestones`** — Milestone records
- `status` (enum) — `'draft'` | `'funded'` | `'in_review'` | `'released'` | `'disputed'` | `'refunded'`
- `title`, `amount`, `asset`, `due_date`, `chain_index`

**`escrow_contracts`** — Indexer resolution map
- `contract_address` (PK), `project_id`, `org_id`, `mapping` (jsonb)

**`activity`** — Project activity feed
- `type`, `payload` (jsonb), `actor_id`, `created_at`

**`ledger_events`** — On-chain audit trail (append-only)

### Schema Additions

```sql
-- milestones: add description and position columns if not present
ALTER TABLE public.milestones
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS position INTEGER;

-- escrow_contracts: ensure funding tracking columns exist
ALTER TABLE public.escrow_contracts
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(38,7) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_funded NUMERIC(38,7) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS custody_mode TEXT DEFAULT 'orka',
  ADD COLUMN IF NOT EXISTS asset TEXT DEFAULT 'USDC';
```

### Workflow State (lib/workflow.ts — no changes needed)

The existing `deriveWorkflowState()` already derives:
- `draft` — No proposal sent
- `proposal_sent` — Proposal sent to client
- `contract_signed` — Both parties signed legal contract
- `escrow_funded` — Escrow has funds on-chain
- `milestones_active` — Work in progress (submissions/approvals happening)
- `completed` — All milestones released

---

## 4. UI Components & Pages

### 4.1 Milestone Setup (Phase 3)

**Location:** `frontend/app/(app)/w/[slug]/projects/[id]/milestones/`

| Component | Type | Purpose |
|-----------|------|---------|
| `MilestoneSetupWizard.tsx` | Client | Multi-step form to add milestones one-by-one |
| `MilestoneSetupEmptyState.tsx` | Client | CTA shown after contract signed, before milestones exist |
| `MilestoneReviewTable.tsx` | Client | Summary table showing all draft milestones before deployment |

**MilestoneSetupWizard fields:**
- Title (text, required)
- Amount (number, required)
- Asset (select: XLM / USDC, default USDC)
- Due Date (date picker, optional)
- Description (textarea, optional)
- "Add Another Milestone" button
- Running total display
- "Save All Milestones" button

### 4.2 Escrow Deployment (Phase 4)

**Location:** `frontend/app/(app)/w/[slug]/projects/[id]/escrow/`

| Component | Type | Purpose |
|-----------|------|---------|
| `EscrowDeploymentFlow.tsx` | Client | Pre-deployment checklist + deploy button |
| `EscrowDeploymentChecklist.tsx` | Server | Shows readiness: contract signed, milestones defined |
| `ProjectEscrowView.tsx` | Server | Enhanced — routes between deployment flow and funded view |

**EscrowDeploymentFlow states:**
1. **Not Ready** — Shows checklist with incomplete items
2. **Ready** — Shows milestone summary + "Deploy Escrow to Stellar" button
3. **Deploying** — Loading spinner with "Deploying to Stellar..." message
4. **Deployed** — Contract address displayed, "Share with Client for Funding" CTA

### 4.3 Client Portal Funding (Phase 5)

**Location:** `frontend/app/p/[token]/`

| Component | Type | Purpose |
|-----------|------|---------|
| `PortalEscrowFundingView.tsx` | Client | Funding interface for the client |
| `FundingConfirmation.tsx` | Client | Shows tx hash + success after funding |

**PortalEscrowFundingView content:**
- Project title + agency name
- Contract address (with Stellar Explorer link)
- Milestone breakdown table (title, amount, due date)
- Total escrow value
- "Fund Escrow" button
- Mode A: Calls backend, shows pending state
- Mode B: Opens Freighter for signature

### 4.4 Milestone Workflow (Phase 6)

**Location:** `frontend/app/(app)/w/[slug]/projects/[id]/milestones/`

| Component | Enhancements |
|-----------|-------------|
| `MilestoneActionButton.tsx` | Context-aware: Submit (agency), Approve/Reject (client), Release (client) |
| `MilestonePaymentFlow.tsx` | Visual lifecycle: Funded → Submitted → Approved → Released |
| `MilestoneTable.tsx` | Status badges, action buttons per row |
| `BoardView.tsx` | Kanban columns by status |

### 4.5 Timeline Page Enhancement

**Location:** `frontend/app/(app)/w/[slug]/projects/[id]/timeline/`

Timeline shows a chronological view of the project lifecycle:

- Proposal created/sent
- Contract signed (both parties)
- Milestones defined (count + total)
- Escrow deployed (contract address)
- Escrow funded (amount)
- Per-milestone events: submitted, approved/rejected, released
- Project completion

**Status indicators:**
- Completed (green check)
- In Progress (blue spinner)
- Not Started (gray circle)
- Blocked/Disputed (red warning)

### 4.6 Overview Page Enhancement

**Location:** `frontend/app/(app)/w/[slug]/projects/[id]/overview/`

| Card | Content |
|------|---------|
| WorkflowStepper | Proposal → Contract → Escrow → Milestones → Complete (current stage highlighted) |
| Escrow Summary | Contract address, total value, funded %, released % |
| Milestone Progress | Progress bar (X/Y completed), current milestone status, next due date |
| Recent Activity | Last 5 activity items with link to full feed |
| Actions | Context-aware next actions based on workflow stage |

---

## 5. Server Actions

### Existing (no changes)
- `signContract()` — Signs legal contract
- `fundEscrow()` — Funds escrow via Rust backend
- `submitMilestone()` — Submits work for review
- `approveMilestone()` — Client approves work
- `rejectMilestone()` — Client rejects work
- `releaseMilestone()` — Multi-sig payment release

### New Actions

**`saveMilestones()`**
```typescript
export async function saveMilestones(input: {
  orgId: string;
  projectId: string;
  milestones: Array<{
    title: string;
    amount: number;
    asset: string;
    dueDate?: string;
    description?: string;
  }>;
}): Promise<{ ok: true } | { ok: false; error: string }>;
```
- Inserts milestones into `milestones` table with `status: 'draft'`
- Sets `position` and `chain_index` based on order
- Records activity: "Milestones defined"

**`deployEscrow()`**
```typescript
export async function deployEscrow(input: {
  orgId: string;
  projectId: string;
  mode: 'orka' | 'freighter';
}): Promise<{ ok: true; contractAddress: string } | { ok: false; error: string }>;
```
- Validates: contract signed, milestones exist
- Calls Rust backend `POST /escrow/create` with milestone data
- Backend calls Soroban factory → deploys contract → returns address
- Stores address in `projects.contract_id` and `escrow_contracts` table
- Records activity: "Escrow deployed to Stellar"

**`getEscrowStatus()`**
```typescript
export async function getEscrowStatus(input: {
  projectId: string;
  contractAddress: string;
}): Promise<{
  ok: true;
  totalAmount: number;
  totalFunded: number;
  milestones: Array<{ id: string; status: string; amount: number }>;
} | { ok: false; error: string }>;
```
- Queries `escrow_contracts` and `milestones` tables
- Returns funding progress and per-milestone status

---

## 6. Activity Logging

Every workflow action logs to the `activity` table:

| Action | `type` | `payload` |
|--------|--------|-----------|
| Milestones defined | `milestones_defined` | `{ count, total_amount, asset }` |
| Escrow deployed | `escrow_deployed` | `{ contract_address, milestone_count, total_amount }` |
| Escrow funded | `escrow_funded` | `{ amount, asset, tx_hash }` |
| Milestone submitted | `milestone_submitted` | `{ milestone_id, title }` |
| Milestone approved | `milestone_approved` | `{ milestone_id, title }` |
| Milestone rejected | `milestone_rejected` | `{ milestone_id, title, reason }` |
| Payment released | `payment_released` | `{ milestone_id, title, amount, asset, tx_hash }` |

Implementation pattern:
```typescript
await supabase.from('activity').insert({
  org_id: orgId,
  project_id: projectId,
  actor_id: user.id,
  type: 'escrow_deployed',
  payload: { contract_address, milestone_count, total_amount, asset }
});
```

---

## 7. Backend Integration

### Deploy Escrow Flow
```
Frontend (Deploy button)
  → Server Action deployEscrow()
  → Rust Backend POST /escrow/create
  → Soroban Factory → Creates contract with milestones
  → Returns contract address
  → Store in projects.contract_id + escrow_contracts
  → Frontend refreshes, shows address
```

### Fund Escrow Flow
```
Client Portal (Fund button)
  → Server Action fundEscrow()
  → Rust Backend POST /escrow/fund
  → Mode A: KMS signs → sponsored fee_bump → Stellar RPC
  → Mode B: Returns XDR → Freighter signs → Stellar RPC
  → Indexer watches chain event
  → Bridge: apply_chain_event() → milestones.status = 'funded'
  → UI refreshes from Postgres
```

### Release Milestone Flow
```
Client (Release button)
  → Server Action releaseMilestone()
  → Rust Backend POST /escrow/release
  → Multi-sig: client key + operator key
  → Soroban release_funds() → Transfers to freelancer
  → Indexer → Bridge → milestones.status = 'released'
  → Activity logged
  → UI refreshes
```

---

## 8. File Structure

New and modified files:

```
frontend/app/(app)/w/[slug]/projects/[id]/
├── actions.ts                          # Add: saveMilestones, deployEscrow, getEscrowStatus
├── escrow/
│   ├── page.tsx                        # Existing (no change)
│   └── components/
│       ├── ProjectEscrowView.tsx       # Enhance: route between deploy flow and funded view
│       ├── EscrowDeploymentFlow.tsx     # NEW: checklist + deploy button
│       └── EscrowDeploymentChecklist.tsx # NEW: readiness checks
├── milestones/
│   ├── page.tsx                        # Enhance: pass deployment state
│   └── components/
│       ├── ProjectMilestonesView.tsx   # Enhance: show setup flow when no milestones
│       ├── MilestoneSetupWizard.tsx    # NEW: multi-step form
│       ├── MilestoneSetupEmptyState.tsx # NEW: post-contract CTA
│       ├── MilestoneReviewTable.tsx    # NEW: review before deploy
│       ├── MilestoneTable.tsx          # Enhance: action buttons per row
│       ├── MilestoneActionButton.tsx   # Enhance: context-aware actions
│       ├── MilestonePaymentFlow.tsx    # Enhance: visual lifecycle
│       ├── BoardView.tsx              # Enhance: status-based kanban
│       └── AddMilestoneModal.tsx       # Existing (minor enhancements)
├── overview/
│   └── components/
│       └── (enhance existing cards with escrow summary)
├── timeline/
│   └── components/
│       └── (enhance with milestone lifecycle events)
└── activity/
    └── components/
        └── (enhance feed with escrow/milestone event types)

frontend/app/p/[token]/
├── components/
│   ├── PortalEscrowFundingView.tsx     # NEW: client funding interface
│   └── FundingConfirmation.tsx         # NEW: success state

frontend/supabase/
└── escrow_milestone_additions.sql      # NEW: schema additions
```

---

## 9. Scope Boundaries

### In Scope (this spec)
- Milestone setup UI (manual entry with AI-ready architecture)
- Escrow deployment flow (Soroban contract creation)
- Escrow funding via client portal
- Milestone submit/approve/reject/release workflow
- Activity logging for all escrow actions
- Timeline page enhancement with milestone lifecycle
- Overview page enhancement with escrow summary
- Server actions for new operations

### Out of Scope (future work)
- AI-powered milestone parsing from contract text (Phase 4)
- Email/push notifications for status changes
- Dispute resolution UI (Phase 2)
- On/off ramp integration (Phase 2)
- Auto-invoicing on milestone release (Phase 2/4)
- File review workflow for deliverables (enhancement)
- Multi-currency support beyond XLM/USDC

---

## 10. Success Criteria

- [ ] Agency can define milestones after contract signing
- [ ] Agency can deploy escrow to Stellar with defined milestones
- [ ] Client can fund escrow through the portal
- [ ] Freelancer can submit milestone work
- [ ] Client can approve or reject milestones
- [ ] Approved milestone payments release via multi-sig
- [ ] All actions logged in activity feed
- [ ] Timeline shows complete project lifecycle
- [ ] Overview page shows escrow summary and next actions
- [ ] Workflow state correctly transitions through all stages
