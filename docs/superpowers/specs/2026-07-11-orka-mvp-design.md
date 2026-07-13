# Orka MVP — Dashboard & Soroban-Connected Flow (Design)

Status: Brainstorming output. Defines MVP scope for Phase 2 — connecting the frontend ↔ Rust backend ↔ Soroban escrow contract.

## Decisions locked (from brainstorming)

- **Full escrow lifecycle on-chain** — real Soroban contract on Stellar testnet, not mocked.
- **Both custody modes** — *orka* (backend signs + broadcasts via service role) and *Freighter* (wallet signs in the browser). Mode chosen per escrow.
- **Reconciliation via Stellar indexer** — a watcher in `services` polls `getEvents` on the testnet RPC for the deployed escrow contract and POSTs each event to `/bridge/event` → `apply_chain_event` → chain-truth `milestones.status` + `ledger_events`. Works identically for both custody modes.
- **Visual language** — Linear-style: left vertical nav + right detail pane, dense rows, status pills, ⌘K command menu, subtle motion. (User supplied a reference JPEG; this model cannot read images, so styling follows the agreed Linear conventions and the user will correct visuals later.)

## MVP scope (this phase)

**Roles:** Client and Freelancer only. Agency role + pro subscription are explicitly deferred.

**Routes in MVP** (all nested under a shared `/dashboard` layout — left nav + right detail pane):

- `/dashboard/home` — **Dashboard**: summary + crisp detail for the logged-in role (their escrows, milestones, pending actions).
- `/dashboard/proposals` — **Proposals**: list proposals/contracts; create a new proposal; accept a proposal → creates the Soroban escrow contract (the on-chain entry point).
- `/dashboard/projects` — **Projects**: list active + closed projects; detail view with a milestone dropdown showing milestones and project state; write/manage milestones.
- `/dashboard/payments` — **Payments**: client funds the escrow and releases milestone payments; check status.
- `/dashboard/settings` — **Settings**: minimal: profile, wallet-connect (Freelancer), testnet/operator config.

The `/dashboard` segment is the authenticated app shell (shared left nav); each sub-route renders into the right detail pane.

**Deferred to post-MVP ("final things"):** Invoice, Analytics, Clients directory (freelancer → their clients), Agency role + pro subscription, and the abort/refund payments UI (the refund path may exist on-chain but has no MVP UI).

## Core MVP user flow (Soroban-focused)

1. **Freelancer** creates a *proposal* (off-chain draft: scope, milestones, amounts).
2. **Client** *accepts* the proposal → backend creates the Soroban *escrow contract*. Custody mode decides signing: orka service-role signs + broadcasts, or a Freighter popup in the browser.
3. **Freelancer** *writes milestones* (metadata linked to the contract; on-chain status tracked by the contract).
4. **Client** *funds* the escrow (USDC transfer into the contract) → status `Funded`.
5. **Freelancer** *submits* work → status `Submitted` (shown as `in_review`).
6. **Client** *releases* payment → milestone `Released` (USDC to freelancer).
7. **Indexer** watches contract events → `/bridge/event` → `apply_chain_event` → the database reflects chain truth for both roles.

## Backend wiring — built vs needed

**Built in Phase 1 (GSD, committed):**

- `services/src/stellar.rs` — builds `fund` / `release` / `state` transaction XDR. ⚠ Does **not** yet broadcast to RPC.
- `services/src/bridge.rs` — `apply_chain_event`, `LedgerSink`, `POST /bridge/event` (service-role gated).
- `packages/stellar-sdk` — browser client that branches on custody mode and never holds the operator secret.

**Needed for MVP:**

- `POST /escrow/create` (proposal → deploy/create escrow contract) and **broadcast** the tx to RPC.
- Wire `/escrow/fund` and `/escrow/release` to custody (sign + broadcast); return `txHash` (orka) or `txXdr` (Freighter).
- **Stellar indexer** — poll `getEvents` on the testnet RPC for the escrow contract → `/bridge/event`.
- **Proposal / project / milestone metadata** storage (Postgres) linked to the contract address.

## Frontend wiring

- Replace `fakeTx()` in `frontend/app/actions.ts` with real calls: server actions → Next.js API routes → Rust `services` (orka mode) or `stellar-sdk` (Freighter mode).
- Role-based views (client vs freelancer) over the same data; the "Clients" nav item is hidden (added with agency later).
- Linear-style shell: left nav = Dashboard, Proposals, Projects, Payments, Settings; right pane = selected view's detail.

## Open items carried into writing-plans

- Proposal → contract mapping: one contract per proposal, or per project?
- Milestone metadata schema (off-chain) vs on-chain `MilestoneStatus` enum.
- Refund / dispute paths: include minimally on-chain, defer UI.
- Testnet USDC source for funding demos.
