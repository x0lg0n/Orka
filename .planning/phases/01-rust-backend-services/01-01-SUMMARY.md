# Plan 01-01 Summary — services/ Cargo + Axum scaffold

**Status:** Complete
**Date:** 2025-07-10

## What was built
- `services/Cargo.toml` — `orka-services` crate (edition 2021) with axum 0.7, tokio, tower-http, serde, dotenvy, reqwest (rustls-tls, default-features off to avoid OpenSSL), thiserror, tracing.
- `services/src/config.rs` — `Config` with the six required env vars (STELLAR_RPC_URL, STELLAR_NETWORK, ORKA_OPERATOR_SECRET, KMS_CONFIG, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) + port; `from_env()` never panics (safe defaults).
- `services/src/state.rs` — `AppState` (config + http client + Supabase handle) and `Supabase` REST client handle.
- `services/src/router.rs` — `build_router(state)` merging `/health` + the four module routers, wrapped in permissive CORS.
- `services/src/main.rs` — boots Axum, loads config, serves on `0.0.0.0:port`; includes a passing `config_parses_with_defaults` unit test.
- Stub `auth.rs` / `custody.rs` / `stellar.rs` / `bridge.rs` each exposing `pub fn routes(&AppState) -> Router` so the workspace compiles; replaced by 01-02..01-05.

## Verification
- `cargo build` exits 0 (built inside WSL Ubuntu — host is `x86_64-unknown-linux-gnu`; the Windows-gnu target lacks MinGW binutils/dlltool, so builds run in WSL against the repo at `/mnt/c/...`).
- `cargo test` → 1 passed (`config_parses_with_defaults`).
- `cargo run` + `curl -s localhost:3999/health` → `HTTP/1.1 200 OK` body `ok`.

## Notes / deviations
- `reqwest` uses `rustls-tls` with `default-features = false` (avoids `native-tls`/OpenSSL on Linux and `ring`/C toolchain on Windows-gnu).
- `build_router` threads `&state` into module routers rather than `Router::with_state(...)`; once handlers adopt the `State<AppState>` extractor (01-02+), this moves to `with_state`.
