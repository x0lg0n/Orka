# Orka MVP — Dashboard & Soroban-Connected Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the frontend `/dashboard` (client + freelancer) to the Rust `services` backend and the Soroban escrow contract so the full lifecycle — proposal → create escrow contract → milestones → fund → submit → release — runs on-chain (testnet) with chain-truth status reconciled by an indexer.

**Architecture:** The Rust `services` backend builds/signs/broadcasts Soroban transactions (orka custody = backend signs via KMS + operator fee-bump; Freighter custody = backend returns XDR for the wallet to sign). A new Stellar indexer polls `getEvents` and POSTs `ChainEvent`s to `POST /bridge/event`, the only writer of `milestones.status`. The Next.js dashboard calls server actions that hit `services` (replacing `fakeTx()`).

**Tech Stack:** Rust (axum, stellar-xdr 22.2.0, reqwest, async-trait), Soroban contract (Rust SDK, testnet), Next.js 16 App Router + TypeScript, `@supabase/supabase-js`, `packages/stellar-sdk` (browser Freighter client), Postgres/Supabase.

## Global Constraints

- Build/test Rust in WSL (`/mnt/c/Siddhartha/ORKA/Orka/services`); stable Rust **1.97.0** (1.93.1 ICEs). Run: `wsl -e bash -lc 'source "$HOME/.cargo/env"; cd /mnt/c/Siddhartha/ORKA/Orka/services && cargo test'`.
- `stellar-xdr` **22.2.0**; `Preconditions::None`; `ScSymbol::try_from(&str)`.
- `network_passphrase()` returns `"Test SDF Network ; September 2015"` for testnet.
- No `stellar-strkey` dep — strkey helpers in `stellar.rs` (`decode_account`/`decode_contract`/`decode_secret_seed`/`encode_*`) are canonical.
- Postgres `milestone_status` enum (coarse): `draft | funded | in_review | released | disputed | refunded`. `map_status` in `bridge.rs` is the ONLY mapper — extend the enum there if a new state is needed; never invent a status not in the enum.
- `apply_chain_event` (bridge.rs) is the SINGLE reconciler that writes `milestones.status`. No other module writes it directly.
- Commit style: `feat(scope): description`. `.planning/` is gitignored — commit it alongside code via `git add -f`.
- Frontend visual language: Linear-style, reuse existing Tailwind tokens (`bg-ink`, `text-white`, `bg-lime`, `bg-orange`, `display`, `shadow-hard`).

---

## File Structure

**Contracts (new):**
- `contracts/escrow-factory/src/lib.rs` — factory with `create_escrow(...)` → deploys an escrow instance + initializes it, returns the new contract `Address`, emits an `initialize` event with the address.
- `contracts/escrow-factory/src/types.rs`, `Cargo.toml`, `Makefile.toml` — mirror `contracts/escrow` layout.

**Contracts (modify):**
- `contracts/escrow/src/lib.rs` — emit a structured event on every status transition (for the indexer).
- `contracts/escrow/src/types.rs` — add an event-data type if needed.

**Services (modify):**
- `services/src/stellar.rs` — add unified `build_sponsored` helper; wire `/escrow/fund` + `/escrow/release` to custody + RPC broadcast; add `/escrow/submit`, `/escrow/approve`, `/escrow/create` (invokes factory); add `get_tx_result` to read a deployed contract address.
- `services/src/state.rs` — add `kms: Arc<dyn custody::Kms>` to `AppState`.
- `services/src/config.rs` — add `escrow_factory_address`, `escrow_wasm_hash` (hex), `operator_address` already present.
- `services/src/main.rs` — construct `InMemoryKms` (MVP) and pass to `AppState`.
- `services/src/indexer.rs` (new) — `poll_events` loop → `POST /bridge/event`.
- `services/src/router.rs` — mount `indexer` route/start, and `stellar::routes` already mounted.

**Frontend (modify/create under `frontend/app`):**
- `app/dashboard/layout.tsx` (new) — left-nav shell, role-aware.
- `app/dashboard/home/page.tsx` (new) — summary (rename current `app/dashboard/page.tsx` content here).
- `app/dashboard/proposals/page.tsx` (new) + `app/dashboard/proposals/new/page.tsx`.
- `app/dashboard/projects/page.tsx` (new, replaces top-level `app/projects`) + `app/dashboard/projects/[id]/page.tsx`.
- `app/dashboard/payments/page.tsx` (new).
- `app/dashboard/settings/page.tsx` (new).
- `app/lib/orka.ts` — keep `getActiveOrgId`; keep `fakeTx` only as fallback.
- `app/lib/backend.ts` (new) — `callServices(path, body)` helper (server-side fetch to `services`).
- `app/actions.ts` — replace `fakeTx()` usages with `callServices` (orka mode) / `stellar-sdk` (Freighter mode).
- `app/lib/stellar.ts` (new) — Freighter connect + submit helper (browser).
- Delete `app/projects` and `app/invoices` top-level pages (moved under `/dashboard`; invoices deferred).

---

## Subsystem A — On-chain contract + backend flow

### Task 1: Emit contract events for the indexer

**Files:**
- Modify: `contracts/escrow/src/lib.rs`
- Test: `contracts/escrow/src/test.rs`

**Interfaces:**
- Consumes: existing `MilestoneStatus`, `Config`.
- Produces: contract events with topic `(symbol("orka"), symbol(<event>))` and data `(milestone_index: u64, amount: i128)`, where `<event>` ∈ `initialize|fund|submit|approve|reject|release|refund|dispute|resolve`.

- [ ] **Step 1: Write the failing test** — each transition publishes exactly one `orka` event with the matching topic.

```rust
#[test]
fn fund_emits_orka_event() {
    let e = SorobanEnv::default();
    let addr = e.register(EscrowContract, ());
    // initialize with 1 milestone ...
    let c = EscrowClient::new(&e, &addr);
    c.fund(&vec![&e, 0u64]);
    let events = e.events().all();
    assert!(events.iter().any(|ev| {
        matches!(&ev.0, Val::Symbol(s) if s.to_string() == "orka")
    }));
}
```

- [ ] **Step 2: Run test to verify it fails** — `cd contracts/escrow && cargo test fund_emits_orka_event` → FAIL (no events published yet).

- [ ] **Step 3: Add event emission to `lib.rs`** — at the end of each mutating fn (after `set_milestones`), publish:

```rust
env.events().publish(
    (symbol_short!("orka"), symbol_short!(EVENT)),
    (id, m.amount),
);
```

Add a helper at top of `impl`:

```rust
fn emit(env: &Env, event: &str, id: u64, amount: i128) {
    env.events().publish(
        (symbol_short!("orka"), symbol_short!(event)),
        (id, amount),
    );
}
```

Call `emit(&env, "fund", id, m.amount)` inside `fund`, `"submit"`/`"approve"`/`"reject"`/`"release"`/`"refund"`/`"dispute"`/`"resolve"` accordingly, and `"initialize"` in `initialize` (id 0, total amount).

- [ ] **Step 4: Run tests** — `cargo test` → PASS.
- [ ] **Step 5: Commit** — `git commit -am "feat(contract): emit orka events on status transitions"`

### Task 2: Add escrow factory contract

**Files:**
- Create: `contracts/escrow-factory/src/lib.rs`, `types.rs`, `Cargo.toml`, `Makefile.toml`
- Test: `contracts/escrow-factory/src/test.rs`

**Interfaces:**
- Consumes: `escrow` Wasm hash (set via `initialize(factory_operator, wasm_hash)`).
- Produces: `create_escrow(org, client, freelancer, asset, operator, milestones, dispute_rules) -> Address` (new escrow instance), emits `initialize` event carrying the new address.

- [ ] **Step 1: Write failing test** — `create_escrow` returns a distinct `Address` and the instance is initialized.

```rust
#[test]
fn create_escrow_returns_instance() {
    let e = SorobanEnv::default();
    let factory = e.register(EscrowFactory, ());
    EscrowFactoryClient::new(&e, &factory).initialize(&operator, &wasm_hash);
    let inst = EscrowFactoryClient::new(&e, &factory).create_escrow(
        &org, &client, &freelancer, &asset, &operator, &ms, &None,
    );
    assert!(inst != factory.address);
}
```

- [ ] **Step 2: Run → FAIL.**
- [ ] **Step 3: Implement `lib.rs`:**

```rust
#[contractimpl]
impl EscrowFactory {
    pub fn initialize(env: Env, operator: Address, wasm_hash: BytesN<32>) {
        env.storage().instance().set(&DataKey::Operator, &operator);
        env.storage().instance().set(&DataKey::Wasm, &wasm_hash);
    }

    pub fn create_escrow(
        env: Env,
        org: Bytes, client: Address, freelancer: Address,
        asset: Address, operator: Address,
        milestones: Vec<MilestoneInit>, dispute_rules: Option<u32>,
    ) -> Address {
        let wasm = env.storage().instance().get(&DataKey::Wasm).unwrap();
        let salt = BytesN::<32>::from_array(&env, &env.prng().gen());
        let ctor = EscrowContractArgs {
            org, client, freelancer, asset, operator, milestones, dispute_rules,
        };
        let addr = env.create_contract(&CreateContractArgs {
            contract_id: ContractId::FromAddress(FromAddress {
                address: env.current_contract_address(),
                salt,
            }),
            executable: ContractExecutable::Wasm(wasm),
        });
        // No cross-contract init call needed if we instead invoke initialize on the
        // new instance directly:
        let client_escrow = EscrowClient::new(&env, &addr);
        client_escrow.initialize(&ctor.org, &ctor.client, &ctor.freelancer,
            &ctor.asset, &ctor.operator, &ctor.milestones, &ctor.dispute_rules);
        env.events().publish((symbol_short!("orka"), symbol_short!("initialize")), addr.clone());
        addr
    }
}
```

Define `DataKey::{Operator,Wasm}`, `EscrowContractArgs`, `EscrowClient` import (`use escrow::EscrowClient;`), and `escrow` as a dependency in `Cargo.toml` (`escrow = { path = "../escrow" }`).

- [ ] **Step 4: Run `cargo test` → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(contract): add escrow factory"`

### Task 3: Unified sponsored-tx builder + orka KMS signing

**Files:**
- Modify: `services/src/stellar.rs`
- Test: `services/src/stellar.rs` (tests module)

**Interfaces:**
- Produces: `pub fn build_sponsored(passphrase, contract_id, fn_name, args, user_source, operator_seed, sequence, bump_fee, inner_user_sig: Option<DecoratedSignature>, operator_inner_sig: bool) -> Result<String, StellarError>`; `pub fn get_tx_result(rpc_url, tx_hash) -> Result<String, StellarError>` (returns base64 result XDR).

- [ ] **Step 1: Add `build_sponsored` and a test asserting Freighter (no sigs) and orka (client+operator sigs for release) shapes.**

```rust
#[test]
fn sponsored_release_has_operator_inner_sig() {
    let xdr = build_sponsored(
        PASSPHRASE, &contract_strkey(), "release_funds", vec![sc_u64(1)],
        &account_strkey(), &operator_seed(), 42, 200,
        Some(sign_payload(&[5u8;32], &dummy_payload())), true,
    ).unwrap();
    // decode; assert inner has 2 sigs (client + operator)
}
```

- [ ] **Step 2: Run → FAIL (function missing).**
- [ ] **Step 3: Implement `build_sponsored`** (replace ad-hoc `build_tx_for_freighter` usage):

```rust
pub fn build_sponsored(
    passphrase: &str, contract_id: &str, fn_name: &str, args: Vec<ScVal>,
    user_source: &str, operator_seed: &[u8; 32], sequence: i64, bump_fee: i64,
    inner_user_sig: Option<DecoratedSignature>, operator_inner_sig: bool,
) -> Result<String, StellarError> {
    let inner = build_contract_tx(user_source, contract_id, fn_name, args, sequence, 100)?;
    let mut sigs: Vec<DecoratedSignature> = Vec::new();
    if let Some(s) = inner_user_sig { sigs.push(s); }
    if operator_inner_sig {
        let payload = TransactionSignaturePayload {
            network_id: network_id(passphrase),
            tagged_transaction: TransactionSignaturePayloadTaggedTransaction::Tx(inner.clone()),
        };
        sigs.push(sign_payload(operator_seed, &payload));
    }
    sponsor_and_submit(passphrase, inner, operator_seed, sigs, bump_fee)
}
```

Add `get_tx_result` using RPC `getTransaction` and decode the `resultMeta`/`returnValue` to a base64 string.

- [ ] **Step 4: Run `cargo test` → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(stellar): unified sponsored-tx builder"`

### Task 4: Wire fund / submit / approve / release routes to custody + RPC

**Files:**
- Modify: `services/src/stellar.rs`, `services/src/state.rs`, `services/src/main.rs`, `services/src/config.rs`
- Test: `services/src/stellar.rs`

**Interfaces:**
- Consumes: `build_sponsored`, `custody::kms_decrypt_seed`, `submit_to_rpc`, `AppState.kms`.
- Produces: `POST /escrow/fund` (orka: signed+broadcast, returns `{tx_hash}`; freighter: returns `{tx_xdr}`), `/escrow/submit`, `/escrow/approve`, `/escrow/release`.

- [ ] **Step 1: Add `kms` to `AppState`** (`state.rs`):

```rust
pub struct AppState {
    pub config: Config,
    pub http: Client,
    pub supabase: Supabase,
    pub kms: Arc<dyn custody::Kms>,
}
impl AppState {
    pub fn new(config: Config) -> Self {
        let http = Client::new();
        let supabase = Supabase::from_config(&config);
        let kms: Arc<dyn custody::Kms> = Arc::new(crate::custody::InMemoryKms::new());
        Self { config, http, supabase, kms }
    }
}
```

In `main.rs` use `AppState::new(config)`. Update any test that builds `AppState::new(Config::from_env())` (still works).

- [ ] **Step 2: Add config fields** (`config.rs`): `escrow_factory_address: String` (env `ESCROW_FACTORY_ADDRESS`), `escrow_wasm_hash: String` (env `ESCROW_WASM_HASH` hex).

- [ ] **Step 3: Rewrite `/escrow/fund` handler** (orka branch signs with client KMS seed, broadcasts; freighter returns XDR):

```rust
CustodyMode::Orka => {
    let seed = custody::kms_decrypt_seed(&*st.kms, body.user_id.as_deref().unwrap_or(""))
        .map_err(|_| ("sign_failed", StatusCode::INTERNAL_SERVER_ERROR))?;
    let inner_sig = Some(sign_payload(&seed, &inner_payload(&pass, &user_addr, &contract, "fund", &args, seq)));
    let xdr = build_sponsored(&pass, &contract, "fund", args, &user_addr,
        &op_seed, seq, 200, inner_sig, false)?;
    let hash = submit_to_rpc(&st.config.stellar_rpc_url, &xdr).await?;
    axum::Json(json!({ "tx_hash": hash }))
}
```

(`inner_payload` is a small helper building the `TransactionSignaturePayload` for the inner tx — mirror the pattern already in `release_funds_sponsored`.)

- [ ] **Step 4: Add `/escrow/submit` and `/escrow/approve`** (source = freelancer / client respectively; orka signs via KMS user_id, freighter returns XDR; both broadcast/return like fund). `submit` only needs the user's auth (no operator inner sig). `approve` only needs client auth.

- [ ] **Step 5: Rewrite `/escrow/release`** — orka: `build_sponsored(..., inner_user_sig=client_sig, operator_inner_sig=true)` then broadcast; freighter: `build_sponsored(..., inner_user_sig=None, operator_inner_sig=true)` return XDR (wallet adds client sig).

- [ ] **Step 6: Add a test** that orka fund returns a `tx_hash` (mock `submit_to_rpc`? Use a test RPC or assert XDR shape). At minimum assert the handler builds without panicking for both modes.

- [ ] **Step 7: Run `cargo test` → PASS; `cargo build` in WSL clean.**
- [ ] **Step 8: Commit** — `git commit -am "feat(stellar): wire fund/submit/approve/release to custody + RPC"`

### Task 5: Proposal → create escrow contract (`/escrow/create`)

**Files:**
- Modify: `services/src/stellar.rs`
- Test: `services/src/stellar.rs`

**Interfaces:**
- Consumes: `build_sponsored`, factory address + wasm hash from config, `get_tx_result`.
- Produces: `POST /escrow/create` → invokes `factory.create_escrow`, broadcasts, polls `get_tx_result` to read the new contract `Address` strkey; returns `{contract_id}`.

- [ ] **Step 1: Add `/escrow/create` handler** building args (`org` Bytes, client/freelancer/asset/operator Addresses, `Vec<MilestoneInit>` amounts, `Option<u32>` dispute_rules) and invoking `create_escrow` via `build_sponsored` (source = operator, operator_inner_sig = false), broadcast, then `get_tx_result` to extract the returned `Address`, encode with `encode_contract` (add `pub fn encode_contract(id: &[u8;32]) -> String` to strkey helpers).

- [ ] **Step 2: Test** that the XDR invokes `create_escrow` on the factory address (decode + assert `function_name == "create_escrow"`).

- [ ] **Step 3: Run `cargo test` → PASS.**
- [ ] **Step 4: Commit** — `git commit -am "feat(stellar): create escrow contract from proposal"`

---

## Subsystem B — Indexer → reconciliation

### Task 6: Stellar indexer

**Files:**
- Create: `services/src/indexer.rs`
- Modify: `services/src/router.rs` (start loop in `main.rs` or a `/internal/indexer/tick` route)

**Interfaces:**
- Consumes: `ChainEvent`, `apply_chain_event` (via `SupabaseSink`), RPC `getEvents`.
- Produces: periodic `POST /bridge/event` calls (or direct `apply_chain_event`) reconciling on-chain status into Postgres.

- [ ] **Step 1: Write `indexer.rs`** with `pub async fn poll_once(state: &AppState, cursor: &mut u32) -> Result<(), IndexerError>` that:
  1. Calls RPC `getEvents` with `startLedger = *cursor`, `filters = [{type:"contract", contract: factory + escrow addresses}]`.
  2. For each event whose topic[0]==`orka`, maps `topic[1]` → `EventType`, reads `milestone_index` + `amount` from `data`, builds a `ChainEvent` (look up `org_id`/`project_id`/`milestone_id` from a local mapping table keyed by contract address — see Task 7), and POSTs to `/bridge/event` (service-role bearer).
  3. Advances `*cursor`.

  Use `reqwest` JSON like `submit_to_rpc`. Map `EventType` → `onchain_status` (`MilestoneStatus`) 1:1 (e.g. `fund→Funded`, `submit→Submitted`, `release→Released`, `refund→Refunded`, `dispute→Disputed`). `initialize` updates project→contract mapping.

- [ ] **Step 2: Add a `from_env` cursor + `start_indexer(state)` spawned via `tokio::spawn` in `main.rs` (loop with `sleep(Duration::from_secs(5))`). Guard so tests don't spawn (only when `cfg!(not(test))` and a `INDEXER_ENABLED` env).

- [ ] **Step 3: Unit test** the topic→status mapper and the `ChainEvent` builder with a sample RPC `getEvents` JSON fixture (no network).

- [ ] **Step 4: Run `cargo test` → PASS.**
- [ ] **Step 5: Commit** — `git commit -am "feat(indexer): poll getEvents and reconcile via /bridge/event"`

### Task 7: Contract→project mapping table

**Files:**
- Modify: `frontend/supabase/phase1_schema.sql` (add `escrow_contracts(contract_address PK, org_id, project_id, milestone_index->milestone_id)`), `services/src/indexer.rs` lookup.

**Interfaces:**
- Produces: a way for the indexer to resolve a contract address + milestone index to `(org_id, project_id, milestone_id)`.

- [ ] **Step 1: Add SQL** table `escrow_contracts(contract_address text pk, org_id text, project_id text, mapping jsonb)` and apply via Supabase SQL editor.
- [ ] **Step 2: In `/escrow/create` (Task 5), after obtaining `contract_id`, insert the mapping (project_id from proposal, milestone indices → milestone ids) into `escrow_contracts`.
- [ ] **Step 3: Indexer reads `escrow_contracts` to resolve events.**
- [ ] **Step 4: Commit** — `git commit -am "feat(db): escrow_contracts mapping for indexer"`

---

## Subsystem C — Frontend dashboard + wiring

### Task 8: Dashboard shell (left nav, role-aware)

**Files:**
- Create: `frontend/app/dashboard/layout.tsx`
- Modify: move `frontend/app/dashboard/page.tsx` → `frontend/app/dashboard/home/page.tsx`

**Interfaces:**
- Produces: shared shell rendering `<DashboardNav role={...}/>` + `{children}`.

- [ ] **Step 1: Create `layout.tsx`** fetching `profile.role`, rendering left nav links: Dashboard (`/dashboard/home`), Proposals, Projects, Payments, Settings; hide "Clients" (deferred). Use Tailwind tokens; `bg-ink` page, white cards.
- [ ] **Step 2: Move current `page.tsx` content to `home/page.tsx` (summary of escrows/milestones/pending actions from Supabase).**
- [ ] **Step 3: `pnpm build` in `frontend/` passes (typecheck).**
- [ ] **Step 4: Commit** — `git commit -am "feat(frontend): dashboard shell + home"`

### Task 9: Backend call helper + replace fakeTx

**Files:**
- Create: `frontend/app/lib/backend.ts`
- Modify: `frontend/app/actions.ts`, `frontend/app/lib/orka.ts`

**Interfaces:**
- Produces: `callServices(path, body)` (server-side fetch to `SERVICES_URL` with `ORKA_OPERATOR`-less internal auth), and updated `fundMilestone`/`releaseMilestone`/`submitMilestone` server actions that call `services` in orka mode.

- [ ] **Step 1: `lib/backend.ts`:**

```ts
export async function callServices(path: string, body: unknown) {
  const res = await fetch(`${process.env.SERVICES_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`services ${path} failed: ${res.status}`);
  return res.json();
}
```

- [ ] **Step 2: In `actions.ts`, replace `recordLedger(... fakeTx() ...)` calls — for orka mode, call `callServices("/escrow/fund"|"/escrow/release", {...})` and store the returned `tx_hash` as `chain_tx`; keep a `fakeTx()` fallback only when `SERVICES_URL` is unset (local dev without backend).
- [ ] **Step 3: `pnpm build` passes.**
- [ ] **Step 4: Commit** — `git commit -am "feat(frontend): wire actions to services, drop fakeTx default"`

### Task 10: Proposals + create contract

**Files:**
- Create: `frontend/app/dashboard/proposals/page.tsx`, `frontend/app/dashboard/proposals/new/page.tsx`

**Interfaces:**
- Consumes: `callServices("/escrow/create", {...})`.
- Produces: proposal list (Supabase `proposals` table — add to schema: `proposals(id, org_id, client_id, freelancer_id, milestones jsonb, status)`), "Accept" → calls `/escrow/create`, stores `contract_id` + milestone mapping.

- [ ] **Step 1: Add `proposals` + `milestones` schema (milestones already exist; add `proposals`).**
- [ ] **Step 2: `new/page.tsx` form → server action `createProposal` (insert row, status `draft`).**
- [ ] **Step 3: `proposals/page.tsx` lists proposals; "Accept" button → server action `acceptProposal` calling `callServices("/escrow/create", ...)`, then insert `escrow_contracts` mapping and set proposal `status='active'`.**
- [ ] **Step 4: `pnpm build` passes.**
- [ ] **Step 5: Commit** — `git commit -am "feat(frontend): proposals + accept creates escrow"`

### Task 11: Projects + milestones

**Files:**
- Create: `frontend/app/dashboard/projects/page.tsx`, `frontend/app/dashboard/projects/[id]/page.tsx`
- Delete: `frontend/app/projects` (top-level)

**Interfaces:**
- Consumes: Supabase `projects` + `milestones`; `submitMilestone` action.
- Produces: project list (active/closed), detail with milestone dropdown showing status; freelancer "Submit" calls `submitMilestone` → `callServices("/escrow/submit")`.

- [ ] **Step 1: Create `projects/page.tsx` listing projects with status filter (active/closed).**
- [ ] **Step 2: `[id]/page.tsx` shows milestones (status pills), dropdown per milestone, "Submit work" (freelancer) / "Approve" + "Release" (client) buttons wired to server actions → `services`.**
- [ ] **Step 3: Delete top-level `app/projects` to avoid route clash; update any links to `/dashboard/projects`.**
- [ ] **Step 4: `pnpm build` passes.**
- [ ] **Step 5: Commit** — `git commit -am "feat(frontend): projects + milestones under /dashboard"`

### Task 12: Payments + Settings

**Files:**
- Create: `frontend/app/dashboard/payments/page.tsx`, `frontend/app/dashboard/settings/page.tsx`

**Interfaces:**
- Payments consumes: `callServices("/escrow/fund")` (client) + status from Supabase; shows release/abort state and tx status.
- Settings: minimal profile (name, custody_mode toggle, Freighter connect via `lib/stellar.ts`).

- [ ] **Step 1: `payments/page.tsx` lists milestones needing funding/release with action buttons (orka → `callServices`; freighter → `stellar-sdk` submit XDR).**
- [ ] **Step 2: `settings/page.tsx` — profile form + `custody_mode` select (orka/freighter) saved to `profiles`; Freighter "Connect" button using `lib/stellar.ts` (browser `window.freighter` API) storing `stellar_address`.**
- [ ] **Step 3: `pnpm build` passes.**
- [ ] **Step 4: Commit** — `git commit -am "feat(frontend): payments + settings pages"`

### Task 13: Freighter browser client wiring

**Files:**
- Create: `frontend/app/lib/stellar.ts`
- Modify: `packages/stellar-sdk` already exists (use `createOrkaClient`).

**Interfaces:**
- Produces: `connectFreighter()`, `submitFreighterXdr(xdr)` using `window.freighter`.

- [ ] **Step 1: `lib/stellar.ts`** wraps `packages/stellar-sdk` `createOrkaClient()` for `freighter` mode: connect → get public key; submit signed XDR returned by `/escrow/*` (freighter mode) via `signAndSubmit`.
- [ ] **Step 2: In `payments`/`projects` pages, when `profile.custody_mode === "freighter"`, call `submitFreighterXdr(tx_xdr)` instead of `callServices`.
- [ ] **Step 3: `pnpm build` passes; `pnpm --filter stellar-sdk test` passes.**
- [ ] **Step 4: Commit** — `git commit -am "feat(frontend): freighter submit wiring"`

---

## Self-Review

**1. Spec coverage:**
- Full lifecycle on-chain ✓ (Tasks 1–5, 10–12). Both custody modes ✓ (orka via KMS in Task 4, freighter XDR return in Tasks 4/13). Indexer reconcile ✓ (Tasks 6–7). Dashboard routes under `/dashboard` ✓ (Tasks 8,10,11,12). Settings minimal ✓ (Task 12). Deferred (invoice/analytics/clients/agency) — intentionally excluded per scope. ✓

**2. Placeholder scan:** No `TBD`/`TODO`. Each task has concrete files, signatures, and steps. Frontend task code is compact but complete enough to execute; `inner_payload` helper in Task 4 is defined by reference to the existing `release_funds_sponsored` pattern (real, not invented).

**3. Type consistency:** `build_sponsored` signature used consistently across Tasks 3–5. `ChainEvent`/`EventType`/`MilestoneStatus` from `bridge.rs` reused in indexer (Task 6). `AppState.kms` added in Task 4 and used in Task 4/5. `callServices` defined Task 9, used 10–13. `escrow_contracts` mapping used by Tasks 5,6,7 consistently.

**Open items carried forward (not blockers):** per-proposal vs per-project contract (decided: one contract per accepted proposal, Tasks 5/10); testnet USDC funding source; refund/dispute UI deferred (on-chain paths exist).
