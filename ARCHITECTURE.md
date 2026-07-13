# ORKA — Architecture

> The Autonomous Financial Operating System for the Global Service Economy.
> **Web2 user experience. AI-driven operations. Stellar/Soroban financial infrastructure underneath.**

This document describes how ORKA is actually built today and how the pieces fit
together. It is grounded in the current source tree. For the forward-looking
build plan (phases, gates, roadmap) see [`ROADMAP.md`](./ROADMAP.md); for the
end-to-end user scenarios see [`docs/USER_FLOW.md`](./docs/USER_FLOW.md).

---

## 1. Core idea

ORKA is escrow-as-infrastructure for agencies, clients, and freelancers. A client
funds USDC into a Soroban smart contract, a freelancer delivers work, the client
approves, and funds are released — **without normal users ever touching a seed
phrase or paying gas**.

Two design rules drive the whole architecture:

1. **On-chain = money truth. Off-chain = everything else.** Only
   enforcement-critical state (who funded, how much, milestone released/disputed)
   lives in the Soroban contract. All metadata, participants, invoices, and
   verification evidence live in Postgres (Supabase).
2. **One sync bridge.** A single `apply_chain_event()` reconciler is the *only*
   writer of milestone status derived from chain events. The UI reads Postgres;
   Postgres is kept in lockstep with the chain. This prevents the UI and chain
   from ever disagreeing.

---

## 2. Dual custody model

ORKA supports two coexisting signer modes for the **same** Soroban contract. The
contract only ever checks `require_auth(address)` — it does not care which mode
produced the signature.

| | **Mode A — Orka-managed (default)** | **Mode B — Self-custody (expert)** |
|---|---|---|
| Sign-in | Email / Google (Supabase JWT) | Freighter wallet connect |
| Chain key | ORKA-provisioned Stellar key, encrypted in KMS | User's own Freighter key |
| Who signs the tx | Rust backend, after verifying the session | Freighter, in-browser |
| Gas | ORKA operator-sponsored `fee_bump` (zero for user) | ORKA operator-sponsored `fee_bump` (zero for user) |
| Custody | Custodial (ORKA is custodian) | Non-custodial |

A user's `profiles.custody_mode` (`'orka'` | `'freighter'`) is set once at signup.
The backend refuses to sign for `'freighter'` users; Freighter signs for
`'orka'` users' behalf never happens. **One address, one mode — never both.**

**Release is multi-sig.** `release_funds` requires the client key **and** the ORKA
operator key, so a single leaked key cannot drain escrow. This backs the promise:
*"ORKA cannot unilaterally move escrow funds."*

---

## 3. System overview

```
                        ┌──────────────────────────────────────────┐
                        │                Browser                     │
                        │  Next.js 16 App Router (frontend/)         │
                        │  - Landing + waitlist                      │
                        │  - Dashboard: projects / milestones /      │
                        │    payments / proposals                    │
                        │  - Freighter connect (Mode B)              │
                        └───────────────┬───────────────┬───────────┘
                                        │               │
                     Supabase JS /      │               │  @orka/stellar-sdk
                     Server Actions     │               │  (packages/stellar-sdk)
                                        │               │
                 ┌──────────────────────▼───┐      ┌────▼─────────────────────────┐
                 │   Supabase (Postgres)     │      │   orka-services (Rust/Axum)  │
                 │  - auth.users             │      │   services/                  │
                 │  - organizations, members │      │  - auth.rs   (JWT / Freighter)│
                 │  - profiles (custody_mode)│◄─────┤  - custody.rs (KMS keys)     │
                 │  - projects, milestones   │ bridge│  - stellar.rs (tx build/sign)│
                 │  - ledger_events (audit)  │      │  - bridge.rs  (reconciler)   │
                 │  - escrow_contracts (map) │      │  - indexer.rs (chain watch)  │
                 │  - RLS scoped to org      │      │  - router.rs  (HTTP routes)  │
                 └───────────────────────────┘      └────┬─────────────────────────┘
                                                          │ sponsored fee_bump
                                                          │ submit / query
                                                     ┌────▼─────────────────────────┐
                                                     │   Stellar / Soroban RPC       │
                                                     │  contracts/                   │
                                                     │  - escrow (money boundary)    │
                                                     │  - escrow-factory (deploy)    │
                                                     └───────────────────────────────┘
```

---

## 4. Repository layout

```
Orka/
├── ROADMAP.md                # canonical build plan (phases + gates)
├── ARCHITECTURE.md           # this file
├── docs/
│   └── USER_FLOW.md          # end-to-end scenarios (happy path + dispute)
├── contracts/                # Soroban Rust workspace (money boundary)
│   ├── escrow/               # audited escrow contract
│   │   └── src/{lib,types,errors,test}.rs
│   └── escrow-factory/       # deploys + initializes escrow instances
├── services/                 # Rust backend (Axum) — orchestration + custody
│   └── src/
│       ├── main.rs           # bootstrap: config, state, indexer, HTTP server
│       ├── config.rs         # env-driven configuration
│       ├── state.rs          # shared AppState (config, KMS, Supabase client)
│       ├── router.rs         # merges module routers + CORS
│       ├── auth.rs           # JWT (Mode A) + Freighter session (Mode B) verify
│       ├── custody.rs        # KMS-backed key provision / sign (Mode A)
│       ├── stellar.rs        # strkey, tx build, sign, sponsored fee_bump, RPC
│       ├── bridge.rs         # apply_chain_event() — the single reconciler
│       └── indexer.rs        # watches chain events → bridge
├── packages/
│   └── stellar-sdk/          # thin TS client the UI uses to call services/
└── frontend/                 # Next.js 16 app (landing + dashboard)
    ├── app/                  # App Router routes + server actions
    ├── components/
    ├── lib/
    └── supabase/*.sql        # schema: waitlist, phase1, workspace MVP
```

---

## 5. Components

### 5.1 Soroban escrow contract (`contracts/escrow`)

`#![no_std]` Soroban contract. It is the **only** authority on money state.

**Stored state** (`DataKey::Config`, `DataKey::Milestones`):

- `Config { org, client, freelancer, asset (USDC), operator, dispute_rules }`
- `Milestones: Map<u64, Milestone { amount, status }>`

**Milestone lifecycle** (`MilestoneStatus`):

```
Draft ─fund→ Funded ─submit→ Submitted ─approve→ Approved ─release_funds→ Released
                │                 │  ▲                                        ▲
                │            reject│  │submit                                 │
                │                  ▼  │                                       │
                │              Rejected                                       │
                └──refund→ Refunded            open_dispute → Disputed ─resolve_dispute→ Released
```

**Functions and their auth requirements:**

| Function | Auth (`require_auth`) | Effect |
|---|---|---|
| `initialize(...)` | (deployed via factory) | Stores config + milestones, rejects double-init |
| `fund(milestone_ids)` | client | Locks USDC into contract |
| `submit(milestone_id)` | freelancer | Marks work delivered |
| `reject(milestone_id)` | client | Sends milestone back for rework |
| `approve(milestone_id)` | client | Approves delivered work (intent only, no transfer) |
| `refund(milestone_id)` | client | Returns full amount to client |
| `open_dispute(caller, milestone_id)` | client **or** freelancer | Freezes milestone |
| `release_funds(milestone_id)` | client **AND** operator (multi-sig) | Transfers to freelancer |
| `resolve_dispute(milestone_id, split_bp)` | operator (arbiter) | Splits funds by basis points |

Every state change emits an `orka` event `(id, amount)` consumed by the indexer.
Errors are typed (`EscrowError`) — `AlreadyInitialized`, `MilestoneNotFound`,
`InvalidState`, `NotAuthorized`, `InvalidSplitBp`, `NoDisputeRule`.

Note: `approve` is *intent only* — it never moves funds. The actual transfer
happens in `release_funds`, which requires the operator co-signature (multi-sig).

### 5.2 Escrow factory (`contracts/escrow-factory`)

Deploys and initializes new escrow contract instances via `create_escrow(...)` so
each project gets its own escrow address (`projects.contract_id`).

### 5.3 Rust backend service (`services/` — `orka-services`)

An Axum HTTP server. `main.rs` loads `Config::from_env()`, builds shared
`AppState` (config + KMS + Supabase client), starts the chain `indexer`, and
serves the router on `0.0.0.0:$PORT`.

- **`router.rs`** — merges `/health` with each module's routes and applies a
  (currently permissive — tighten before prod) CORS layer.
- **`auth.rs`** — verifies the Supabase/Google JWT (Mode A) or a Freighter session
  proof (Mode B) and enforces `custody_mode`. Defines `CustodyMode`.
- **`custody.rs`** — Mode A key lifecycle behind a `Kms` trait
  (`InMemoryKms` for tests). `provisionManagedAccount()` creates a Stellar key at
  signup, encrypted in KMS; `signForUser()` decrypts, signs, discards. The seed
  never lives in app memory beyond a single sign op.
- **`stellar.rs`** — the transaction engine (no heavy SDK dependency):
  - manual **strkey** encode/decode (base32 + CRC16-XMODEM) for `G…`/`C…`/`S…`.
  - `ScVal` mappers for escrow arguments.
  - `build_contract_tx()` builds a Soroban `InvokeContract` operation.
  - `sponsor_and_submit()` wraps the inner tx in an **operator-sponsored
    fee-bump** (zero gas for the user) and signs it with the operator key.
  - `build_sponsored()` unified builder: attaches an optional client signature
    and/or the operator inner signature, then fee-bump wraps.
  - Mode A: backend signs with the KMS-decrypted client seed and submits →
    returns `tx_hash`. Mode B: returns unsigned `tx_xdr` for Freighter to sign
    in-browser. `release_funds` attaches **both** client + operator inner
    signatures (multi-sig).
  - `submit_to_rpc()` / `get_tx_result()` talk to the Stellar RPC JSON-RPC API.
- **`bridge.rs`** — `apply_chain_event()`, **the single reconciler**. It upserts a
  `ledger_events` row (idempotent, keyed by `chain_tx`) and updates
  `milestones.status` via `map_status()`. The `LedgerSink` trait abstracts the
  store (`SupabaseSink` in prod, `MockSink` in tests). No other code path writes
  milestone status. `POST /bridge/event` is gated by the service-role bearer.
- **`indexer.rs`** — watches on-chain escrow events and feeds them to the bridge.

**HTTP routes** (feature modules): `/health`, `/escrow/create`, `/escrow/fund`,
`/escrow/submit`, `/escrow/approve`, `/escrow/release`, `/escrow/state`,
`/bridge/event`.

**Status mapping** — the Postgres `milestone_status` enum is intentionally
coarser than the contract enum: `Submitted`/`Approved`/`Rejected` all map to
`in_review` in Postgres until release.

### 5.4 TypeScript SDK (`packages/stellar-sdk` — `@orka/stellar-sdk`)

A thin client the UI uses to call `services/`. `createOrkaClient({ baseUrl, mode })`
exposes `fundEscrow`, `releaseMilestone`, `getContractState`. It **never** holds
the operator secret — it only forwards `mode`. Signing happens server-side (Mode
A) or inside Freighter (Mode B). In Mode B the result is a `txXdr` to hand to the
wallet; in Mode A it is a `txHash`.

### 5.5 Frontend (`frontend/` — Next.js 16 App Router)

- Public landing page + Supabase/Resend waitlist (`app/api/waitlist/route.ts`).
- Authenticated dashboard: `home`, `projects/[id]` (milestone board), `payments`,
  `proposals`, `settings`, plus `onboarding`, `login`, `signup`.
- `FreighterMilestoneButton.tsx` handles Mode B in-browser signing.
- Auth via Supabase (`app/auth/callback/route.ts`), server actions in
  `app/actions.ts`.
- Tailwind v3, React 19, strict TypeScript (`moduleResolution: "bundler"`).

### 5.6 Data model (Supabase Postgres)

Schema lives in `frontend/supabase/*.sql`:

- `waitlist.sql` — landing-page waitlist table + RLS.
- `phase1_schema.sql` / `workspace_mvp.sql` — `organizations`,
  `organization_members` (owner/admin/member), `profiles` (FK `auth.users`,
  `stellar_address`, `custody_mode`), `clients`, `freelancers`, `projects`
  (`contract_id`), `milestones`, `invoices`, `ledger_events`, `disputes`,
  `escrow_contracts` (maps `(contract_address, milestone_index)` → DB uuids).
- Every table carries `org_id` and has **RLS policies scoped to workspace
  membership**. `ledger_events` is the append-only audit trail.

---

## 6. Key flows

### 6.1 Fund a milestone (Mode A, Orka-managed)

1. Client clicks **Fund** in the dashboard → SDK `fundEscrow({ contractId, milestoneIds })`.
2. `POST /escrow/fund` (`mode: "orka"`). Backend verifies the session, decrypts
   the client's KMS seed, builds a `fund` inner tx signed by the client key.
3. `build_sponsored()` wraps it in an operator-sponsored fee-bump and
   `submit_to_rpc()` broadcasts it → returns `tx_hash`.
4. The indexer sees the `fund` event → `apply_chain_event()` upserts
   `ledger_events` and sets `milestones.status = funded`.
5. UI reflects `funded` from Postgres.

### 6.2 Release funds (multi-sig)

1. Client clicks **Release** → `POST /escrow/release`.
2. Backend builds a `release_funds` inner tx and attaches **two** inner
   signatures: the client (KMS in Mode A / Freighter in Mode B) **and** the ORKA
   operator. Fee-bump wrapped, submitted.
3. Contract's `release_funds` enforces `client.require_auth()` **and**
   `operator.require_auth()`; funds transfer to the freelancer; status →
   `Released`.
4. Bridge reconciles → `milestones.status = released`.

### 6.3 Dispute

`open_dispute` freezes the milestone (`Disputed`). A human arbiter (operator)
calls `resolve_dispute(split_bp)` to split funds by basis points (0–10000);
bridge maps it to `released`/`disputed` in Postgres.

---

## 7. Security model (defense in depth)

- **Contract-enforced money rules** — only the correct party can trigger each
  action (`require_auth`); release is multi-sig (client + operator).
- **KMS-protected keys** — Mode A seeds are encrypted at rest and only decrypted
  for a single sign operation.
- **Session-gated signing** — every chain action is gated by the Supabase JWT
  (Mode A) or a verified Freighter session (Mode B) *in addition to* on-chain
  `require_auth`.
- **Single-writer reconciliation** — only `apply_chain_event()` writes milestone
  status; idempotent on `chain_tx`.
- **Service-role isolation** — the Supabase service-role key is server-side only
  and never reaches the browser; `/bridge/event` requires the service-role bearer.

Known Phase-1 gaps are tracked in code comments and the threat model (e.g.
permissive CORS, Freighter operator-as-signer for `create_escrow`, contract +
custody audits pending). See [`ROADMAP.md`](./ROADMAP.md) Phase 3 and
[`SECURITY.md`](./SECURITY.md).

---

## 8. Build, test & run

| Area | Location | Commands |
|---|---|---|
| Frontend | `frontend/` | `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint` |
| Contracts | `contracts/` | `cargo test` (Soroban testutils + snapshot tests) |
| Services | `services/` | `cargo test`, `cargo run` |
| SDK | `packages/stellar-sdk/` | `pnpm test` (vitest) |
| Shortcuts | repo root | `make dev`, `make lint`, `make build`, `make setup` |

CI (`.github/workflows/ci.yml`) runs frontend lint + build and `cargo test` for
contracts on every PR to `master` and `dev`.

**Branch policy:** `master` is the protected production branch and is always
demoable; day-to-day work integrates into `dev` first. Contracts merge only with
green `cargo test`; the app merges only with green lint + type check (type errors
surface during `pnpm build`). See [CONTRIBUTING.md](./CONTRIBUTING.md#branching-strategy).

---

## 9. Configuration

Copy `frontend/.env.example` → `frontend/.env.local`. Key variables:

- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never in the browser).
- **Resend:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`.
- **Stellar (Phase 1+):** `STELLAR_RPC_URL`, `STELLAR_NETWORK`
  (`testnet`|`mainnet`|`futurenet`), `ORKA_OPERATOR_SECRET` (funded account for
  sponsored txns + multi-sig release co-signer).
- **KMS (Mode A):** `KMS_CONFIG` (AWS KMS / GCP KMS / Vault).

---

## 10. Guiding principles (recap)

1. On-chain = money truth; off-chain = everything else.
2. One sync bridge (`apply_chain_event()`) — never write milestone status elsewhere.
3. Defense in depth for custody (contract rules + KMS + multi-sig + session gating).
4. Conservative autonomy — AI advises and verifies; humans approve releases.
5. Real-user gates — no phase is "done" until it passes with real volume on testnet/mainnet.
6. Compliance is a feature, not an afterthought.
