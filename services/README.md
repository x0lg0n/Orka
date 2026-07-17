# ORKA Services

Rust / Axum backend that bridges the ORKA **Soroban escrow contracts** and **Supabase**. It signs escrow transactions, indexes on-chain contract events into Supabase, and exposes the REST API consumed by [`@orka/stellar-sdk`](../packages/stellar-sdk).

## Tech Stack

- **Rust** (edition 2021), **Axum 0.7**, **Tokio**
- `reqwest` (rustls-tls) for Supabase REST
- `ed25519-dalek` for signing / verification
- `stellar-xdr` (`curr`) for XDR encode/decode and strkey handling
- `jsonwebtoken`, `thiserror`, `async-trait`
- `tracing` / `tracing-subscriber` for structured logs
- `dotenvy` for `.env` loading

## Modules (`services/src`)

| Module | Responsibility |
|--------|----------------|
| `main.rs` | Boots tracing + `AppState`, starts the indexer, binds the Axum server. |
| `config.rs` | `Config` loaded from the environment (safe defaults; never panics at startup). |
| `state.rs` | `AppState` + thin Supabase REST client handle (base URL + service-role key). |
| `auth.rs` | JWT / Ed25519 verification; `CustodyMode` enum (`orka` \| `freighter`). |
| `custody.rs` | Provider-agnostic `Kms` trait (`encrypt`/`decrypt`/`sign`); `InMemoryKms` for tests; ed25519 signing. |
| `stellar.rs` | Strkey helpers (G/C/S), XDR signing, transaction building. |
| `bridge.rs` | Maps on-chain escrow events to Supabase upserts. |
| `indexer.rs` | Streams contract events into Supabase (toggle via `INDEXER_ENABLED`). |
| `router.rs` | Assembles `/health` + feature routes, permissive CORS (tighten before prod). |

On-chain event types handled by the bridge: `Initialize`, `Fund`, `Submit`, `Approve`, `Release`, `Refund`, `Dispute`, `Resolve`.

## Configuration (environment)

All values come from the environment (`.env` auto-loaded by `dotenvy`). Every field has a **safe default** so `cargo test` and local boots work without a populated `.env`; production deployments must supply real values.

| Variable | Default |
|----------|---------|
| `PORT` | `3000` |
| `STELLAR_RPC_URL` | `https://soroban-testnet.stellar.org` |
| `STELLAR_NETWORK` | `testnet` |
| `ORKA_OPERATOR_SECRET` | _(empty)_ — `S...` seed or 32-byte hex |
| `ORKA_OPERATOR_ADDRESS` | _(empty placeholder)_ |
| `KMS_CONFIG` | `{}` |
| `SUPABASE_URL` | `http://localhost:54321` |
| `SUPABASE_SERVICE_ROLE_KEY` | `test-service-role` |
| `ORKA_ESCROW_FACTORY_ADDRESS` | _(empty)_ |
| `ORKA_ESCROW_WASM_HASH` | _(empty)_ |
| `INDEXER_ENABLED` | toggle the event indexer |

See `config.rs` for the authoritative list and decoding rules.

## Build & Run

```bash
cargo build
cargo run
# quality gates (not enforced in CI yet)
cargo test
cargo clippy
cargo fmt --check
```

## API Surface (high level)

- `GET  /health` — liveness probe.
- `POST /escrow/fund` — fund milestones (orka/freighter custody modes).
- `POST /escrow/release` — release a milestone.
- `GET  /escrow/state` — raw contract state query.
- Auth + bridge routes for event ingestion and custody.

See `router.rs` and each module for exact paths and request shapes.
