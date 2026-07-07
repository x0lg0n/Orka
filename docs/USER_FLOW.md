# ORKA — User Flow Scenarios

Concrete end-to-end walkthroughs of how Oreenza (agency, on ORKA) runs a client engagement through ORKA. Both parties use **Mode A (Orka-managed keys)** — email login, no wallet, ORKA signs Soroban transactions via KMS with sponsored (zero-gas) transactions.

See `ROADMAP.md` for the architecture. This file is the human-readable reference for "what actually happens."

## Cast
- **Oreenza** — agency, owns the ORKA workspace.
- **Sarah** — client contact at Acme (the client company).
- **Raj** — Oreenza's freelancer doing the work.
- All three: Mode A, email login. ORKA holds their Stellar keys in KMS.

---

## Scenario A — Happy Path (client approves)

### A1. Project created (DB only)
Oreenza → `/projects/new` → client "Acme", freelancer "Raj", scope "Shopify store build", total $8,000.
- Stored in `projects` + `milestones` (Discovery $2k, Design $2k, Dev $3k, Launch $1k) in **Postgres**.
- No chain action. ORKA auto-provisions Stellar addresses for Sarah & Raj if absent.

### A2. Agreement drafted
Phase 4: Agreement Engine generates proposal + contract + milestone split from the brief; Oreenza reviews. Phase 1: Oreenza enters it manually.

### A3. Both parties sign the legal contract (DB "signature")
Sarah and Oreenza click "Accept".
- `client_signed_at` + `freelancer_signed_at` recorded in **Postgres**. Binding agreement (ToS + clicks).
- Optional (Phase 4): ORKA writes a hash of the agreement to Stellar as tamper-proof proof of scope.

### A4. Deploy Soroban escrow contract (chain)
On "Confirm project", Rust service calls:
`initialize(org, client=Sarah_addr, freelancer=Raj_addr, operator=ORKA_addr, asset=USDC, milestones=[...])`
- Deployed on Stellar. Address saved to `projects.contract_id` (Postgres). Nothing funded yet.

### A5. Client funds escrow (chain, signed by client)
Sarah clicks "Fund Escrow" → card/bank (ORKA ramp: USD → USDC).
- Backend verifies Sarah's JWT → KMS-signs sponsored `fund([m1,m2,m3,m4])` → operator `fee_bump` (Sarah pays $0 gas) → RPC.
- Soroban locks $8,000 USDC. `require_auth(Sarah)` enforced.
- `applyChainEvent()` writes `ledger_events` (funded $8k) + milestones → `funded`.

### A6. Work happens (off-chain)
Raj builds deliverables in his own tools. ORKA tracks, doesn't do the work.

### A7. Milestone submitted (chain, signed by freelancer)
Raj clicks "Submit M1", attaches GitHub/Figma links.
- KMS-signs `submit(m1)` with Raj's key → `require_auth(Raj)`. Milestone → `in_review`. Sarah notified.

### A8. Verification
Phase 4: Verification Engine checks GitHub/Figma → confidence score → "AI verified, approve?". Phase 1: Sarah reviews links manually.

### A9. Approve + release (chain, multi-sig)
Sarah clicks "Approve M1".
- KMS-signs `approve(m1)` (Sarah) **AND** `release_funds(m1)` (operator) → multi-sig enforced.
- Soroban releases $2,000 USDC to Raj. `ledger_events` (released $2k, tx hash) + milestone → `released`.
- Auto-invoice emailed to Acme.

### A10. Freelancer paid (off-chain ramp)
Raj's $2,000 USDC off-ramped to his bank (Phase 2) or kept as USDC. Sees "$2,000 paid."

### A11. Repeat M2–M4
Same loop. Each release independent, multi-sig, logged.

### A12. Dispute (if needed)
See Scenario B.

### A13. Year-end (Phase 4)
ORKA compiles released totals + invoices → "Generate Tax Report" from `ledger_events`.

---

## Scenario B — Client does NOT approve (silence / rejection / dispute)

This covers three sub-cases: **(B1)** client goes silent, **(B2)** client rejects the work, **(B3)** formal dispute with arbiter.

### B1. Client goes silent (no approval)
Raj submits M2. Sarah never clicks Approve or Reject.
- On-chain: `submit(m2)` recorded, milestone stays `in_review`. Funds remain locked in escrow — they are NOT released, and Raj is NOT paid. The crypto guarantee holds: no approval = no payout.
- Off-chain: ORKA sends Sarah reminder notifications (Phase 4: escalating, with an SLA timer). Oreenza's PM can nudge Acme manually.
- **Timeout rule (recommended):** after N days (e.g., 7) of `in_review` with no action, ORKA flags the milestone as "awaiting mediation" and notifies Oreenza ops. Either Sarah acts, or it escalates to B3. Funds stay safely locked the whole time — client cannot pull them back unilaterally because `refund` requires client auth, and release requires client+operator.

### B2. Client rejects the work
Sarah reviews M2, decides it doesn't meet scope, clicks "Reject M2" with a reason.
- Backend KMS-signs `reject(m2)` with Sarah's key → `require_auth(Sarah)`. Milestone → `rejected`.
- Funds for M2 stay in escrow (locked, not released, not refunded yet).
- Raj gets notified with Sarah's reason + evidence link. Two outcomes:
  - **Re-work:** Raj revises, clicks "Submit M2" again → back to A7. Same escrow funds reused.
  - **No agreement:** if Raj believes the work is correct and Sarah won't approve, either party clicks "Open Dispute" → B3.

### B3. Formal dispute + arbiter resolution
Either party opens a dispute on M2.
- `open_dispute(m2)` → milestone → `disputed`. Release and refund are both paused on-chain.
- A human arbiter (Oreenza ops initially; later an independent reviewer) is assigned.
- Arbiter reviews: original signed agreement (Postgres), Raj's deliverables, Sarah's rejection reason, AI verification evidence.
- Arbiter decides a split, e.g., Raj earned 70%, Sarah refunded 30%:
  - Backend KMS-signs `resolve_dispute(m2, split_bp=7000)` with **operator/arbiter key** → `require_auth(ORKA)`.
  - Soroban releases $1,400 (70% of $2k) to Raj, returns $600 to Sarah. Both enforced on-chain.
- `ledger_events` records the split; invoice/credit note adjusted; both parties notified.
- If arbiter rules 100% for Sarah: `split_bp=0` → full refund, $0 to Raj. If 100% for Raj: `split_bp=10000` → full release.

### What the client CANNOT do
- Sarah **cannot** unilaterally pull escrowed funds back — `refund` requires her auth but a refund of a disputed/released milestone is blocked while `disputed` is active.
- Sarah **cannot** force a release to herself — `release_funds` requires client + operator multi-sig.
- Raj **cannot** release to himself — same multi-sig rule.
- This is the core trust guarantee: escrow funds move only by agreed rules or arbiter decision, never by one party alone.

---

## Where each artifact lives

| Artifact | Location | "Signed" how |
|---|---|---|
| Legal agreement (scope/terms) | Postgres | Both click Accept (DB record) |
| Escrow rules (money program) | Soroban contract | Deployed by ORKA; enforced by per-tx signatures |
| Fund / approve / release / resolve | Stellar transactions | `require_auth` from client / freelancer / operator keys |
| Audit trail | `ledger_events` (Postgres) | Mirrored from chain via `applyChainEvent` |
| Invoice | Postgres + emailed | Auto-generated on release |

## One-line summary
Sarah clicks "Fund" and "Approve" — never touching Stellar. Behind those clicks, ORKA's Rust service signs Soroban transactions with KMS-held keys, sponsored (no gas), and the contract guarantees Raj is paid only when Sarah approves (or an arbiter decides). If Sarah stays silent, rejects, or disputes, the funds stay locked and resolve only by the agreed rules or human arbiter — never by one party alone.
