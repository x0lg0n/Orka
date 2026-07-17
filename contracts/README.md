# ORKA Soroban Contracts

Soroban (Stellar smart contract) workspace holding the ORKA escrow contracts. The backend in [`services/`](../services) signs and indexes these contracts; see the root `ROADMAP.md` for the custody model they implement.

## Workspace

Cargo workspace (`resolver = "2"`) with two member crates:

| Member | Crate | Purpose |
|--------|--------|---------|
| `escrow/` | `orka-escrow` | The per-deal escrow contract (fund / submit / approve / release / refund / dispute / resolve). |
| `escrow-factory/` | `orka-escrow-factory` | Deploys new `orka-escrow` instances. |

The `[workspace.dependencies]` block pins `soroban-sdk`. Each contract has its own `Cargo.toml` relying on the workspace for shared dependencies. The release profile is tuned for wasm (`opt-level = "z"`, `lto`, `panic = "abort"`, `overflow-checks`).

## Prerequisites

- Rust stable with the `wasm32v1-none` target:

```bash
rustup target add wasm32v1-none
```

## Build

```bash
# build the escrow wasm (required before the escrow-factory tests)
cargo build -p orka-escrow --target wasm32v1-none --release
```

## Test

```bash
cargo test
```

Tests use `soroban-sdk` testutils and assert against snapshot JSON under `test_snapshots/`.

> **CI note:** the GitHub workflow builds the `orka-escrow` wasm *before* running `cargo test`, because the `escrow-factory` tests depend on the compiled wasm.
