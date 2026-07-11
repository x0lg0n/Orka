# Roadmap: ORKA — Backend-First Build

> Canonical source: root `ROADMAP.md`. This is the GSD working copy for the
> backend-first build the user directed: Rust backend → wire frontend → linear dashboard.

## Overview

ORKA's frontend workspace MVP is complete but uses a mocked chain (`lib/orka.ts`
`fakeTx`). The Soroban escrow contract exists. This build delivers the real Rust
backend (`services/`) + TS client (`packages/stellar-sdk`), wires the frontend to
it, then redesigns the dashboard in the Linear visual style.

## Phases

- [ ] **Phase 1: Rust Backend Services** - Real Axum backend: auth, custody, stellar, bridge + TS client
- [ ] **Phase 2: Wire Frontend to Real Backend** - Replace `fakeTx` with `packages/stellar-sdk` calls
- [ ] **Phase 3: Linear-style Dashboard UI** - Redesign `/dashboard` + `/projects` after Linear reference

## Phase Details

### Phase 1: Rust Backend Services
**Goal**: Replace the frontend's mocked `fakeTx` with a real Rust (Axum) backend that verifies auth, provisions/signs custody keys (KMS), submits sponsored Stellar txns, and reconciles chain events into Supabase via `applyChainEvent()`.
**Depends on**: Nothing
**Success Criteria** (what must be TRUE):
  1. `services/` compiles and runs an Axum server exposing escrow orchestration endpoints
  2. `auth.rs` verifies Supabase/Google JWT (Mode A) and Freighter session (Mode B), refusing to sign for the wrong `custody_mode`
  3. `custody.rs` provisions a Mode A Stellar key and signs with it, KMS-backed
  4. `stellar.rs` builds + submits a sponsored `fee_bump` tx to Stellar RPC
  5. `bridge.rs` `applyChainEvent()` upserts `ledger_events` and updates `milestones.status`
  6. `packages/stellar-sdk` is a thin TS client the UI imports to call `services/`
**Plans**: 6 plans

Plans:
- [ ] 01-01: services/ Cargo workspace + Axum server scaffold
- [ ] 01-02: auth.rs — JWT (Mode A) + Freighter session (Mode B) verify, custody_mode enforcement
- [ ] 01-03: custody.rs — Mode A key lifecycle (provisionManagedAccount + signForUser, KMS-backed)
- [ ] 01-04: stellar.rs — Stellar SDK client, sponsored fee_bump, submit to RPC
- [ ] 01-05: bridge.rs — applyChainEvent() reconciler to Supabase
- [ ] 01-06: packages/stellar-sdk — thin TS client

### Phase 2: Wire Frontend to Real Backend
**Goal**: Replace `fakeTx` in `lib/orka.ts` with calls to `packages/stellar-sdk` → `services/`, so fund/approve/release flow through the real chain bridge.
**Depends on**: Phase 1
**Success Criteria** (what must be TRUE):
  1. Frontend fund/approve/release actions call the backend, not `fakeTx`
  2. `ledger_events` + `milestones.status` update via the bridge after a chain action
**Plans**: 2 plans

Plans:
- [ ] 02-01: Replace fakeTx with stellar-sdk client calls in lib/orka.ts
- [ ] 02-02: Wire fund/approve/release flows end-to-end to backend

### Phase 3: Linear-style Dashboard UI
**Goal**: Redesign `/dashboard` + `/projects` in the Linear dashboard visual style (fetched reference) while keeping backend wiring.
**Depends on**: Phase 2
**Success Criteria** (what must be TRUE):
  1. `/dashboard` mirrors Linear's layout/density/typography
  2. `/projects` list + board use the Linear visual language
**Plans**: 2 plans

Plans:
- [ ] 03-01: Fetch Linear dashboard reference + extract design tokens
- [ ] 03-02: Rebuild /dashboard and /projects in Linear style

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Rust Backend Services | 4/6 | In progress | 01-04 |
| 2. Wire Frontend | 0/2 | Not started | - |
| 3. Linear Dashboard | 0/2 | Not started | - |
