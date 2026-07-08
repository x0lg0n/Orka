# ORKA Phase 1 — Soroban Escrow Contract Design

> **Part of:** Phase 1 — Core Workspace + Escrow MVP (see `ROADMAP.md`).
> **Scope of this doc:** Subsystem 1.2 only — the Soroban escrow contract and its unit tests.
> **Dependency note:** The Supabase data model (1.1), Rust backend (1.3), and app routes (1.4)
> are all built *around* this contract's exact interface. Get this right first; everything
> downstream depends on it.

**Canonical roadmap interface (verbatim from `ROADMAP.md` §1.2):**

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

This design keeps that interface but clarifies the `approve` → `release_funds` semantics
(see §2). `approve` is **intent only**; `release_funds` is the **multi-sig payout**.

---

## 1. Architecture & storage

**Workspace:** new `contracts/escrow/` — a Cargo workspace member using `soroban-sdk` (v22.x,
Rust edition 2021). Build and test run in WSL (`stellar` 25.1.0 + cargo are installed there):
- Build: `stellar contract build` (or `cargo build --target wasm32-unknown-unknown`)
- Test: `cargo test`

**Deployment model:** one contract instance per project (user choice). The backend deploys
the compiled WASM, then calls `initialize(...)`; the instance stores that project's state and
returns its own address via `env.current_contract_address()`. `projects.contract_id` (off-chain)
maps the project to this address.

**Storage layout** (instance storage is sufficient because each instance is per-project):

- **`Config`** (instance) — written once in `initialize`, never mutated:
  ```rust
  struct Config {
      org: Bytes,          // opaque org identifier from the off-chain workspace
      client: Address,
      freelancer: Address,
      asset: Address,      // the USDC Stellar Asset Contract (SAC) address
      operator: Address,   // ORKA's multi-sig co-signer / arbiter key
  }
  ```
- **`milestones`** (instance) — `Map<u64, Milestone>`:
  ```rust
  struct Milestone {
      amount: i128,
      status: MilestoneStatus,
  }
  #[contracttype] enum MilestoneStatus {
      Draft, Funded, Submitted, Approved, Rejected, Refunded, Disputed, Released,
  }
  ```
- `initialize(org, client, freelancer, asset, operator, milestones: Vec<MilestoneInit>)`
  where `MilestoneInit { amount: i128 }`. Milestone ids are assigned sequentially
  `0..n-1` in list order. Descriptions/labels live off-chain (Postgres), not in the contract.

**Security rule enforced by storage:** `Config` is immutable after `initialize`. Only
`milestones` mutates, and only through the authorized functions below.

---

## 2. Function semantics & state machine

All value transfers use the SAC: `token::StellarAssetClient::new(env, asset)` for `balance`,
and `token::TokenClient::new(env, asset)` for `transfer(from, to, amount)`.

- **`initialize(...)`** → returns `env.current_contract_address()`.
  Guard: must not already be initialized (else `AlreadyInitialized`). Stores `Config` and the
  `milestones` map with every entry in `Draft`.

- **`fund(milestone_ids: Vec<u64>)`** — `require_auth(client)`.
  Every id must exist and be `Draft` (else `MilestoneNotFound` / `InvalidState`).
  Sum the amounts, `transfer(client → contract, total)`. Set each → `Funded`.
  (Partial funding of a subset of milestones is allowed; each funded id independently.)

- **`submit(milestone_id)`** — `require_auth(freelancer)`.
  Must be `Funded` → `Submitted`.

- **`approve(milestone_id)`** — `require_auth(client)`.
  Must be `Submitted` → `Approved`. **No transfer occurs** — this is the human's intent flag.

- **`reject(milestone_id)`** — `require_auth(client)`.
  Must be `Submitted` → `Rejected`. Freelancer may call `submit` again to re-enter `Submitted`.

- **`refund(milestone_id)`** — `require_auth(client)`.
  Must be `Funded` | `Submitted` | `Rejected` | `Approved` (i.e. not yet released/disputed/
  refunded). `transfer(contract → client, amount)` → `Refunded`. Terminal.

- **`open_dispute(milestone_id)`** — `require_auth(client)` **OR** `require_auth(freelancer)`.
  Must be `Submitted` | `Approved` | `Rejected` → `Disputed`. Pauses any payout/refund path.

- **`release_funds(milestone_id)`** — `require_auth(client)` **AND** `require_auth(operator)`
  (multi-sig). Must be `Approved` (not disputed, not already released).
  `transfer(contract → freelancer, amount)` → `Released`. Terminal.
  *This is the only normal payout path, and it requires both keys — the core safety guarantee.*

- **`resolve_dispute(milestone_id, split_bp: u32)`** — `require_auth(operator)` (arbiter).
  Must be `Disputed`; `split_bp` in `0..=10000` (else `InvalidSplitBp`).
  Pays `amount * split_bp / 10000` to `freelancer`, remainder to `client` → `Released`. Terminal.
  (Operator-only by design: the arbiter's resolution is the authorized override.)

**Terminal-state invariant:** a `Released` or `Refunded` milestone rejects all further actions
with `InvalidState`.

---

## 3. Errors

```rust
#[contracterror]
pub enum EscrowError {
    AlreadyInitialized = 1,
    NotAuthorized = 2,
    MilestoneNotFound = 3,
    InvalidState { expected: MilestoneStatus, actual: MilestoneStatus } = 4,
    TransferFailed = 5,
    InvalidSplitBp = 6,
}
```

---

## 4. Testing (unit, `cargo test`)

Test environment: Soroban `soroban_sdk::testutils`. No network required.

- **USDC stand-in:** create a *real* Stellar Asset Contract via
  `env.register_stellar_asset_contract_v2(admin)` to obtain a deterministic USDC `Address`
  we can mint from. This satisfies the "real USDC SAC address" shape (the contract takes an
  `asset: Address`; we pass this test SAC) while keeping tests local and deterministic.
- Deploy the escrow contract, `initialize` with distinct `client` / `freelancer` / `operator`
  addresses, mint the client, and exercise flows. Multi-sig is simulated with manual
  `env.mock_auths(...)` providing both the client and operator signatures for `release_funds`.

**Required passing cases (all green):**
1. `fund` locks the summed USDC in the contract; client balance drops, contract balance rises.
2. `approve` does **not** move funds (freelancer balance unchanged, status = `Approved`).
3. `release_funds` **fails with `NotAuthorized` when only the client signs**; succeeds with
   client + operator; freelancer balance increases by `amount`; status = `Released`.
4. `refund` returns the full milestone amount to the client; status = `Refunded`.
5. `open_dispute` then `resolve_dispute(7000)` splits 70% → freelancer, 30% → client; status = `Released`.
6. `release_funds` on an already-`Released` milestone is rejected (`InvalidState`).
7. `submit`/`reject` transition `Funded → Submitted → Rejected → Submitted` correctly.

---

## 5. Out of scope (Phase 1 contract)

- KMS integration, JWT verification, the `bridge.rs` syncer, and the UI — these are 1.1 / 1.3 / 1.4.
- On-chain JWT verification (Phase 4+ research item).
- Factory contract, path payments, FX — later phases.

## 6. Phase 1 gate relevance

The contract must pass these tests **including multi-sig enforcement (#3)** before the backend
or UI is wired to it. The gate requires "Contract tests green incl. multi-sig" on testnet with
real Oreenza volume in both custody modes.
