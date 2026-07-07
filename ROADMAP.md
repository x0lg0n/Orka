# ORKA — Implementation Roadmap (Canonical)

**Product:** The Autonomous Financial Operating System for the Global Service Economy.

**Core Positioning:** Web2 user experience. AI-driven operations. Stellar/Soroban financial infrastructure underneath.

**Core rule:** Stellar runs silently. Normal users never touch a seed phrase or gas (ORKA-paid sponsored transactions). Crypto-native users MAY bring their own Freighter wallet for self-custody. Both modes drive the same audited Soroban contract.

> This file is the single source of truth. The marketing vision lives in `frontend/README.md`. Do not duplicate roadmaps.

---

## Auth & Custody Model (dual-mode, applies from Phase 1)

ORKA supports two coexisting signer modes for the *same* Soroban contract. The contract only ever checks `require_auth(address)` — it does not care which mode produced the signature.

| | Mode A — Orka-managed (easy) | Mode B — Self-custody (expert) |
|---|---|---|
| Sign-in | Email / Google (Supabase JWT) | Freighter wallet connect |
| Chain key | ORKA-provisioned Stellar key, encrypted in KMS | User's own Freighter key |
| Who signs tx | Rust backend, after verifying JWT + session | Freighter, in-browser |
| Gas | ORKA operator-sponsored `fee_bump` (zero for user) | ORKA operator-sponsored `fee_bump` (zero for user) |
| Recovery | Reset password → re-grant KMS access | User's own seed phrase |
| Custody | Custodial (ORKA is custodian) | Non-custodial |

**Rules that never bend:**
- A `profiles.custody_mode` is set once at signup (`'orka'` | `'freighter'`). The Rust backend refuses to sign for `'freighter'` users; Freighter refuses to sign for `'orka'` users. One address, one mode — never both.
- Every chain action is still gated by the user's **Supabase session JWT** (Mode A) or a verified Freighter session (Mode B) *in addition to* the on-chain `require_auth`. Two layers.
- Mode A is custodial → ORKA is a custodian → Phase 3 KYC/licensing applies. Mode B users protect their own keys; ORKA cannot recover them.
- **Account abstraction (Mode A):** JWT is the *human* auth, the KMS key is the *chain* auth. The pragmatic secure version is **backend-verified JWT → backend signs with KMS key**. True on-chain JWT verification is a Phase 4+ research item, not MVP.
- **Multi-sig release:** Soroban `release_funds` requires client key + ORKA operator key, so a single leaked key cannot drain escrow.

---

## Guiding Principles

1. **On-chain = money truth. Off-chain = everything else.** Only enforcement-critical state (who funded, how much, milestone released/disputed) lives in the Soroban contract. All metadata, participants, invoices, and verification evidence live in Postgres.
2. **One sync bridge.** A single `applyChainEvent()` function reconciles Soroban state into Supabase. No feature ever writes milestone status directly; it always flows through the bridge. This prevents the UI and chain from disagreeing.
3. **Defense in depth for custody.** Contract-enforced money rules + KMS-protected keys + multi-sig release + session-gated signing. We promise "ORKA cannot unilaterally move escrow funds" (contract-backed), not "breach-proof" (impossible while custodial).
4. **Conservative autonomy.** AI may *advise* and *verify*, but it only releases funds after the human client approves — until Oreenza dogfooding data proves the verification rules are safe.
5. **Real-user gates.** No phase is "done" until it passes a defined gate with real Oreenza volume on testnet/mainnet.
6. **Compliance is a feature, not a phase 3 afterthought.** Escrow is regulated. KYC and licensing checks are built before real money moves.

---

## Repository Layout (target)

```
Orka/
├── ROADMAP.md                  # this file
├── docs/
│   └── USER_FLOW.md            # end-to-end scenarios (happy path + dispute)
├── VISION.md                   # long-term narrative (optional, keep separate from build plan)
├── contracts/                  # Soroban Rust workspace
│   └── escrow/                 # audited escrow contract (money boundary)
├── services/                   # Rust backend (Axum) — escrow orchestration + custody
│   └── src/
│       ├── auth.rs             # JWT verify (Mode A) + Freighter session verify (Mode B)
│       ├── custody.rs          # KMS-backed key provision/sign (Mode A)
│       ├── stellar.rs          # Stellar SDK client, sponsored fee_bump, RPC
│       └── bridge.rs           # applyChainEvent() sync to Supabase
├── app/                        # Next.js UI (currently under frontend/, promote to root in Phase 0)
│   ├── app/
│   ├── lib/
│   └── supabase/
└── packages/
    └── stellar-sdk/            # thin TS client the UI uses to call services/
```

**Phase 0 action:** Promote `frontend/` to repo root (or keep `frontend/` but rename `package.json` from `orka-landing` to `orka`). Add `contracts/`, `services/`, and `packages/`.

---

## Phase 0 — Foundation Cleanup (Week 0)

**Goal:** A repo and dev environment a real engineer can clone and ship in.

### Tasks
- [ ] Retire conflicting roadmap docs; keep this file canonical. Move the hackathon vision into `VISION.md`.
- [ ] Promote frontend to root OR rename package to `orka`. Align naming (`ORKA`) across copy, code, env.
- [ ] `.env.example` documenting: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `STELLAR_RPC_URL`, `STELLAR_NETWORK`, `ORKA_OPERATOR_SECRET` (ORKA's funded Stellar account for sponsored txns + multi-sig release co-signer), `KMS_CONFIG` (AWS KMS / GCP KMS / Vault endpoint for Mode A key custody).
- [ ] Local dev: Supabase CLI + Stellar quickstart script (`make dev` brings up both).
- [ ] CI: GitHub Actions running `pnpm lint`, `pnpm typecheck`, and `cargo test` for contracts on every PR.
- [ ] Keep the existing landing page as the public acquisition surface; do not rebuild it yet.

### Gate
A new contributor can clone the repo, run one command, and see the landing page + waitlist working locally.

---

## Phase 1 — Core Workspace + Escrow MVP (Weeks 1–4)

**Goal:** A workspace where an agency creates a project, a client funds USDC escrow on Stellar, the client manually approves a milestone, and the freelancer gets paid — all without anyone touching crypto.

### 1.1 Data model (Supabase Postgres)
Tables: `organizations`, `organization_members` (role: owner/admin/member), `profiles` (FK `auth.users`), `clients`, `freelancers`, `projects`, `milestones`, `invoices`, `ledger_events`, `disputes`.
- Every table carries `org_id` and has **RLS policies scoped to workspace membership** (not just the waitlist table).
- `profiles` adds: `stellar_address` (user's Stellar account), `custody_mode` (`'orka'` | `'freighter'`), set once at signup. Mode A keys are provisioned by ORKA; Mode B addresses are user-supplied via Freighter connect.
- `projects.contract_id` stores the deployed Soroban contract address.
- `ledger_events` is the audit trail: `{org_id, project_id, milestone_id, chain_tx, event_type, amount, asset, status, created_at}`.

### 1.2 Soroban escrow contract (`contracts/escrow`)
Rust/Soroban. State: `client`, `freelancer`, `asset` (USDC), `milestones: Map<Id, Milestone{amount, status}>`, `operator` (ORKA multi-sig co-signer).
Functions (exact interface):
```
initialize(org, client, freelancer, asset, operator, milestones) -> contract_id
fund(milestone_ids)                                      // client locks USDC (require_auth client)
submit(milestone_id)                                     // freelancer marks done (require_auth freelancer)
approve(milestone_id)  -> releases to freelancer         // require_auth client
reject(milestone_id)                                      // require_auth client
refund(milestone_id)                                      // require_auth client
open_dispute(milestone_id)                                // require_auth client|freelancer
release_funds(milestone_id)                              // require_auth client AND operator (multi-sig)
resolve_dispute(milestone_id, split_bp)                  // require_auth operator (arbiter)
```
- `require_auth` so only the correct party can trigger each action; `release_funds` requires **both** client and ORKA operator keys (multi-sig) so a single leaked key cannot drain escrow.
- Unit tests with Soroban testutils: funds lock, release, refund, dispute split, multi-sig enforcement.

### 1.3 Rust backend service (`services/`)
- `auth.rs`: verify Supabase/Google JWT (Mode A) and Freighter session proof (Mode B). Enforce `custody_mode` — never sign for the wrong mode.
- `custody.rs`: Mode A key lifecycle — `provisionManagedAccount()` creates a Stellar key at signup, encrypted in **KMS** (never in app memory beyond a single sign op); `signForUser()` decrypts, signs, discards.
- `stellar.rs`: Stellar SDK client. Builds tx, wraps in ORKA-operator **sponsored `fee_bump`** (zero gas for user in both modes), submits to RPC.
- `bridge.rs`: **`applyChainEvent()`** — the single reconciler. On any chain action, upsert `ledger_events` and update `milestones.status`. UI reads from Postgres, kept in lockstep with chain.
- `fundEscrow()`, `releaseMilestone()`, `getContractState()` return tx hashes. Mode B routes skip `custody.rs` and return a tx for Freighter to sign in-browser instead.

### 1.4 App routes
- Auth: email/Google (Supabase) for Mode A; "Connect Freighter" toggle for Mode B. Both set `custody_mode` at signup.
- `/dashboard`, `/projects/new`, `/projects/[id]` (milestone board: draft → funded → in_review → released → disputed), `/projects/[id]/invite`.
- Fund flow: Mode A client clicks "Fund" → Rust service verifies JWT → KMS-signs sponsored `fund` tx → bridge writes ledger. Mode B client signs in Freighter.
- Approve/release flow: Mode A client clicks "Approve" → service co-signs with client KMS key + operator key (multi-sig) → USDC to freelancer. Mode B signs in Freighter.

### Phase 1 Gate
Oreenza runs 3 real internal projects end-to-end on **testnet** in BOTH modes (at least one Mode A, one Mode B). Contract tests green incl. multi-sig. At least one milestone released and one refunded without UI/chain desync.

---

## Phase 2 — Payments Realism (Weeks 5–8)

**Goal:** Real money can enter and leave the system, and users get the records they need for taxes.

### 2.1 On/off ramp (the hardest real problem — solve explicitly)
- Client funds: card/bank → USDC via a regulated ramp (e.g., Mt Pelerin, Liminal, or manual ORKA ledger account). Do **not** assume users hold USDC.
- Freelancer payout: USDC → local bank/fiat via ramp OR peer-to-peer ORKA ledger. Document the exact provider and flow.
- Path payments (USDC → freelancer's preferred asset) are an **optimization** layered on top of the ramp, not the MVP.

### 2.2 Invoices & back-office
- Auto-generate a compliant multi-currency invoice the moment a milestone releases (Phase 4 of old plan, pulled earlier — users need receipts).
- `ledger_events` drives an internal ledger: fees, invoice IDs, payout references, FX spreads.

### 2.3 Disputes with a human
- `open_dispute` pauses release; a designated human arbiter (Oreenza ops initially) resolves via `resolve_dispute(split_bp)`.
- Dispute UI: evidence upload, arbiter decision, automatic split.

### Phase 2 Gate
At least $1k of real testnet-or-small-mainnet volume processed through a real ramp with correct invoices emitted.

---

## Phase 3 — Compliance & Trust (Weeks 9–12)

**Goal:** The product is safe and legal to put real users' money through.

### 3.1 KYC / AML
- Identity verification (Persona / Stripe Identity) for clients/freelancers above a funding threshold.
- Sanctions screening on Stellar addresses ORKA operates.

### 3.2 Licensing review
- Escrow is regulated in many jurisdictions. Document where ORKA can operate and add geographic gating before onboarding.
- Terms of Service + executed contractor agreements stored per project.

### 3.3 Security
- Third-party audit of **both** the Soroban contract (OtterSec / Trail of Bits) **and** the Rust `services/` custody layer (KMS key lifecycle, mode-enforcement, multi-sig co-sign).
- Bug bounty program covering contract + backend.
- Observability: every on-chain action traced (tx hash, status, retries, custody_mode); alerting on failed releases.
- Prove the promised guarantee in writing: *"ORKA cannot unilaterally move escrow funds — release requires client + operator multi-sig, enforced on-chain."*

### Phase 3 Gate
Clean audit of contract AND Rust custody service, KYC live for threshold amounts, zero critical vulns, incident runbook documented.

---

## Phase 4 — AI Operations (Weeks 13–18)

**Goal:** Cut the administrative tax in half. AI advises; humans approve.

### 4.1 Agreement Engine
- AI proposal generation from a raw brief (Vercel AI SDK / LangChain + RAG over contract templates).
- Auto milestone breakdown + pricing → feeds `initialize()`.
- All AI output is reviewable and editable before any chain action.

### 4.2 Verification Engine (advisory first)
- Integrations: GitHub (merged PRs, deploy URLs, Lighthouse), Figma (visual diff vs wireframe), content (word count, SEO, plagiarism).
- Output: confidence score + source links + human override.
- **No autonomous release** until Oreenza data proves reliability. Client still clicks approve.

### 4.3 Auto-invoicing on release (already partially in Phase 2; harden here)
- Tax categorization; year-end "Generate Tax Report" per jurisdiction template.

### Phase 4 Gate
Oreenza admin time per project drops measurably; verification engine accuracy validated on historical projects.

---

## Phase 5 — Developer Platform & Scale (Weeks 19–26)

**Goal:** Become the "Stripe for Web3 marketplaces."

### 5.1 Public surface
- REST/GraphQL API + JS/Python SDK + webhooks.
- White-label escrow widget any marketplace can embed.

### 5.2 Network wedge
- Agencies invite clients → clients invite their other freelancers → flywheel.
- 3+ marketplace integrations via the API.

### 5.3 SCF grant
- Narrative: "Bringing Stellar to the $1.5T remote-work economy as invisible infrastructure." Dogfooding volume from Oreenza as proof.

### Phase 5 Gate
$1M+ annualized testnet/mainnet volume, 100+ agencies, 5+ marketplace partners.

---

## Execution Cadence

- **Weekly demo** to Oreenza internal users; every friction point logged as a feature/bug.
- **Dogfooding rule:** if an Oreenza user leaves ORKA to use Notion/Gmail/Wise, that is a tracked gap.
- **Branch policy:** `main` is always demoable. Contracts merged only with green `cargo test`. App merged only with green lint + typecheck.

## Definition of "Industry Standard Final Product"

A real agency owner (Mode A — Orka-managed, default):
1. Signs up with email/Google. No wallet, no seed phrase.
2. Creates a project, invites client by email.
3. Client funds in USD via card/bank → USDC locked in Soroban (ORKA pays gas via sponsored tx).
4. Freelancer delivers → AI verifies (GitHub/Figma) → client gets "verified, approve?" → clicks approve.
5. USDC released (client + operator multi-sig) → ORKA off-ramps to freelancer's bank → invoice emailed.
6. Dispute → human arbiter splits funds by contract.
7. Year-end → tax report exported.

A crypto-native user (Mode B — self-custody) does the same but connects Freighter instead; they hold their own key and sign in-browser. Same audited contract, same zero-gas UX.

The blockchain is invisible — or self-custodial, if the user wants it. That is the standard. Anything less is a demo, not a product.
