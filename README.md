<div align="center">

# 🐋 ORKA

**The Autonomous Financial Operating System for the Global Service Economy.**

*Web2 user experience. AI-driven operations. Stellar/Soroban financial infrastructure underneath.*

[![CI](https://github.com/x0lg0n/Orka/actions/workflows/ci.yml/badge.svg)](https://github.com/x0lg0n/Orka/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Built on Stellar](https://img.shields.io/badge/Built%20on-Stellar%2FSoroban-black.svg)](https://stellar.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![Rust](https://img.shields.io/badge/Rust-Axum%20%2B%20Soroban-orange.svg)](https://www.rust-lang.org)

[Architecture](./ARCHITECTURE.md) · [Roadmap](./ROADMAP.md) · [User Flows](./docs/USER_FLOW.md) · [Contributing](./CONTRIBUTING.md) · [Security](./SECURITY.md)

</div>

---

## Table of contents

- [What is ORKA?](#what-is-orka)
- [The problem](#the-problem)
- [How it works](#how-it-works)
- [Two custody modes](#two-custody-modes)
- [Key features](#key-features)
- [A concrete example](#a-concrete-example)
- [Architecture at a glance](#architecture-at-a-glance)
- [The escrow contract](#the-escrow-contract)
- [Data model](#data-model)
- [Repository layout](#repository-layout)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Testing](#testing)
- [Tech stack](#tech-stack)
- [Project status](#project-status)
- [Design principles](#design-principles)
- [FAQ](#faq)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

---

## What is ORKA?

ORKA is **escrow-as-infrastructure** for agencies, clients, and freelancers. A
client funds USDC into a Soroban smart contract, a freelancer delivers work, the
client approves, and funds are released — **without normal users ever touching a
seed phrase or paying gas.**

The blockchain is invisible — or self-custodial, if the user wants it. That is the
standard ORKA is built to: anything less is a demo, not a product.

> ORKA is being built by dogfooding it inside a real agency (Oreenza). Every phase
> is gated by real usage — no feature is "done" until it survives real projects on
> testnet/mainnet. See [`ROADMAP.md`](./ROADMAP.md).

## The problem

The global remote-work economy runs on trust that constantly breaks:

- **Clients** fear paying upfront for work that may never arrive.
- **Freelancers** fear delivering work and never getting paid.
- **Cross-border payments** are slow, expensive, and opaque.
- **Crypto escrow** exists, but it demands wallets, seed phrases, and gas — a
  non-starter for mainstream users.

ORKA replaces that with programmable escrow, sponsored (gas-free) transactions,
multi-sig fund release, and an AI layer that cuts the administrative tax — while
keeping humans in control of every money movement.

## How it works

At its core, ORKA is a state machine over milestones, enforced on-chain:

```
Draft ──fund──► Funded ──submit──► Submitted ──approve──► Approved ──release──► Released
                  │                    │  ▲                                        ▲
             refund│              reject│  │resubmit                               │
                  ▼                    ▼  │                                        │
              Refunded             Rejected      open_dispute ──► Disputed ──resolve──►┘
```

- Money truth (who funded, how much, released/disputed) lives **on-chain** in a
  Soroban contract.
- Everything else (participants, metadata, invoices, evidence, audit trail) lives
  **off-chain** in Postgres.
- A single reconciler, `apply_chain_event()`, keeps the UI and chain in perfect
  lockstep — they can never disagree.

## Two custody modes

Both modes drive the **same** audited Soroban escrow contract. The contract only
checks `require_auth(address)` — it does not care which mode produced the signature.

| | 🟢 **Mode A — Orka-managed (default)** | 🔵 **Mode B — Self-custody (expert)** |
|---|---|---|
| Sign-in | Email / Google (Supabase JWT) | Freighter wallet connect |
| Chain key | ORKA-provisioned Stellar key, encrypted in KMS | User's own Freighter key |
| Who signs the tx | Rust backend, after verifying the session | Freighter, in-browser |
| Gas | Operator-sponsored `fee_bump` (**$0** for user) | Operator-sponsored `fee_bump` (**$0** for user) |
| Recovery | Reset password → re-grant KMS access | User's own seed phrase |
| Custody | Custodial (ORKA is custodian) | Non-custodial |

A user's `custody_mode` is set once at signup — **one address, one mode, never both.**

**Fund release is always multi-sig:** `release_funds` requires the client key
**and** the ORKA operator key. A single leaked key can never drain escrow. This
backs the promise: *"ORKA cannot unilaterally move escrow funds."*

## Key features

- 🔐 **Non-custodial-grade guarantees, custodial-grade UX** — funds move only by
  the agreed rules or an arbiter's decision, never by one party alone.
- ⛽ **Zero gas for users** — every transaction is wrapped in an operator-sponsored
  fee-bump.
- 🪪 **Dual custody** — email users and crypto-native users coexist on one contract.
- 🧾 **Milestone escrow** — fund, submit, approve, reject, refund, dispute, resolve.
- ⚖️ **Human-arbitrated disputes** — basis-point splits enforced on-chain
  (`resolve_dispute`).
- 🔄 **One sync bridge** — an idempotent, single-writer reconciler prevents UI/chain
  desync.
- 🧱 **Defense in depth** — contract rules + KMS-encrypted keys + multi-sig release +
  session-gated signing.
- 📊 **Full audit trail** — every on-chain action mirrored into `ledger_events`.
- 🤖 **AI-assisted operations (planned)** — agreement drafting and delivery
  verification that *advise*; humans still approve releases.

## A concrete example

*(Mode A — nobody touches a wallet. Full walkthrough in [docs/USER_FLOW.md](./docs/USER_FLOW.md).)*

1. **Oreenza** (an agency) creates a project for client **Sarah** and freelancer
   **Raj**: "Shopify store build", $8,000, four milestones. → *Postgres only.*
2. On confirm, the backend deploys a Soroban escrow via the factory and stores the
   contract address. → *Chain.*
3. Sarah clicks **Fund Escrow** (pays by card → USDC). Backend verifies her JWT,
   KMS-signs a sponsored `fund(...)`, and the contract locks $8,000 USDC. → *Chain, $0 gas.*
4. Raj clicks **Submit M1** with GitHub/Figma links → `submit(m1)`, milestone →
   `in_review`.
5. Sarah clicks **Approve M1** → backend co-signs `approve` + `release_funds`
   (client + operator multi-sig) → $2,000 USDC released to Raj, invoice emailed.
6. If Sarah goes silent, rejects, or disputes — **funds stay locked** and resolve
   only by the agreed rules or a human arbiter (`resolve_dispute(split_bp)`).

Behind every click, ORKA's Rust service signs Soroban transactions with KMS-held
keys, sponsored (no gas). Sarah never sees Stellar.

## Architecture at a glance

```
        ┌────────────────────────────────────────────┐
        │  Browser — Next.js 16 (frontend/)          │
        │  landing + dashboard + Freighter (Mode B)  │
        └───────────┬──────────────────┬─────────────┘
                    │ Supabase JS      │ @orka/stellar-sdk
                    ▼                  ▼
        ┌───────────────────┐   ┌──────────────────────────────┐
        │ Supabase Postgres │   │  orka-services (Rust/Axum)   │
        │ off-chain truth   │◄──┤  auth · custody(KMS) ·        │
        │ RLS per org       │   │  stellar(sign+fee_bump) ·    │
        │ ledger_events     │   │  bridge(reconciler) · indexer│
        └───────────────────┘   └──────────┬───────────────────┘
                                            │ sponsored fee_bump
                                            ▼
                                ┌──────────────────────────────┐
                                │  Stellar / Soroban RPC        │
                                │  contracts/escrow (money)     │
                                │  contracts/escrow-factory     │
                                └──────────────────────────────┘
```

Two rules drive everything:

1. **On-chain = money truth. Off-chain = everything else.**
2. **One sync bridge** — `apply_chain_event()` is the only writer of chain-derived
   milestone status.

Full detail in [**ARCHITECTURE.md**](./ARCHITECTURE.md).

## The escrow contract

`contracts/escrow` is a `#![no_std]` Soroban contract — the only authority on money
state. Each function enforces the correct signer via `require_auth`:

| Function | Auth | Effect |
|---|---|---|
| `initialize(...)` | via factory | Store config + milestones (rejects double-init) |
| `fund(milestone_ids)` | client | Lock USDC into the contract |
| `submit(milestone_id)` | freelancer | Mark work delivered |
| `reject(milestone_id)` | client | Send back for rework |
| `approve(milestone_id)` | client | Approve delivery (intent only, no transfer) |
| `refund(milestone_id)` | client | Return full amount to client |
| `open_dispute(caller, milestone_id)` | client **or** freelancer | Freeze milestone |
| `release_funds(milestone_id)` | client **AND** operator | Transfer to freelancer (**multi-sig**) |
| `resolve_dispute(milestone_id, split_bp)` | operator | Split funds by basis points |

`contracts/escrow-factory` deploys and initializes a fresh escrow per project.

## Data model

Schema lives in `frontend/supabase/*.sql`. Every table carries `org_id` with **RLS
policies scoped to workspace membership**.

- `organizations`, `organization_members` (owner/admin/member)
- `profiles` — FK `auth.users`, `stellar_address`, `custody_mode`
- `clients`, `freelancers`, `projects` (`contract_id`), `milestones`
- `invoices`, `disputes`
- `ledger_events` — append-only audit trail, mirrored from chain
- `escrow_contracts` — maps `(contract_address, milestone_index)` → DB uuids
- `waitlist` — landing-page signups

## Repository layout

| Path | What it is |
|---|---|
| [`frontend/`](./frontend) | Next.js 16 (App Router) — landing page + dashboard |
| [`contracts/`](./contracts) | Soroban Rust workspace — `escrow` + `escrow-factory` |
| [`services/`](./services) | Rust/Axum backend — auth, KMS custody, tx signing, bridge, indexer |
| [`packages/stellar-sdk/`](./packages/stellar-sdk) | `@orka/stellar-sdk` — thin TS client the UI uses |
| [`docs/`](./docs) | End-to-end user flows and design notes |
| [`ROADMAP.md`](./ROADMAP.md) | Canonical build plan (phases + gates) |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | How the system fits together |

## Quick start

**Prerequisites:** Node 20+ / pnpm 9 (the repo ships `pnpm-lock.yaml` — do **not**
use npm/yarn), plus a Rust stable toolchain for the chain layer, and a Supabase
project for data.

```bash
# 1. Frontend (landing page + dashboard)
cd frontend
pnpm install
cp .env.example .env.local   # fill in Supabase + Resend values
pnpm dev                     # http://localhost:3000
```

```bash
# 2. Contracts
cd contracts
cargo test

# 3. Backend service
cd services
cargo test
cargo run
```

From the repo root, the `Makefile` wraps common tasks:

```bash
make dev      # install + run the frontend
make setup    # scaffold frontend/.env.local
make lint     # pnpm lint
make build    # pnpm build
```

> **Waitlist prerequisite:** run `frontend/supabase/waitlist.sql` in the Supabase
> SQL editor before using the waitlist API. For dashboard data, also apply
> `phase1_schema.sql` and `workspace_mvp.sql`. See [`frontend/README.md`](./frontend/README.md).

## Configuration

Copy `frontend/.env.example` → `frontend/.env.local` and fill in:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase auth |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | **Server-side only** — never exposed to the browser |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Transactional email (waitlist, invoices) |
| `STELLAR_RPC_URL`, `STELLAR_NETWORK` | `testnet` / `mainnet` / `futurenet` |
| `ORKA_OPERATOR_SECRET` | Funded account that sponsors gas + co-signs multi-sig release |
| `KMS_CONFIG` | AWS KMS / GCP KMS / Vault endpoint for Mode A key custody |

> ⚠️ The service-role key and `ORKA_OPERATOR_SECRET` must **never** reach the
> browser or be committed. Server-side Supabase reads `SUPABASE_URL` (no
> `NEXT_PUBLIC_` prefix).

## Testing

| Area | Command | Notes |
|---|---|---|
| Frontend | `pnpm lint` + `pnpm build` | Type errors surface during `build` (no standalone typecheck) |
| Contracts | `cargo test` | Soroban testutils + snapshot tests — **required, enforced in CI** |
| Services | `cargo test` | Axum handlers, signing, bridge idempotency |
| SDK | `pnpm test` | vitest |

CI (`.github/workflows/ci.yml`) runs frontend lint + build and contracts
`cargo test` on every PR to `master` and `dev`.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v3
- **Backend:** Rust, Axum, Tokio, ed25519-dalek, stellar-xdr
- **Chain:** Stellar / Soroban (Rust smart contracts), USDC
- **Data & auth:** Supabase (Postgres + RLS), JWT, Freighter
- **Custody:** KMS-encrypted keys, operator-sponsored fee-bump, multi-sig release
- **Email:** Resend

## Project status

ORKA is under **active development**. `master` is the protected production branch
and is always demoable; active work lands on `dev` first.

| Phase | Focus | Status |
|---|---|---|
| 0 | Foundation cleanup (repo, CI, env) | ✅ In place |
| 1 | Core workspace + escrow MVP (dual-mode) | 🚧 In progress |
| 2 | Payments realism (on/off ramp, invoices, disputes) | 🔜 Planned |
| 3 | Compliance & trust (KYC/AML, audits, licensing) | 🔜 Planned |
| 4 | AI operations (agreement + verification engines) | 🔜 Planned |
| 5 | Developer platform & scale (API, SDK, webhooks) | 🔜 Planned |

See [`ROADMAP.md`](./ROADMAP.md) for the detailed plan and per-phase gates.

## Design principles

1. **On-chain = money truth; off-chain = everything else.**
2. **One sync bridge** — never write chain-derived milestone status elsewhere.
3. **Defense in depth** for custody (contract rules + KMS + multi-sig + session gating).
4. **Conservative autonomy** — AI advises and verifies; humans approve releases.
5. **Real-user gates** — no phase ships until it survives real volume on testnet/mainnet.
6. **Compliance is a feature, not an afterthought.**

## FAQ

**1. Do users need a crypto wallet?**

No. Mode A users sign in with email/Google; ORKA manages their Stellar key in KMS
and sponsors gas. Crypto-native users may opt into Mode B with Freighter.

**2. Who pays the gas fees?**

ORKA does, via operator-sponsored fee-bump transactions — zero gas for the user in
both modes.

**3. Can ORKA run off with the money?**

No. Fund release requires a client + operator **multi-sig** enforced on-chain.
ORKA alone cannot move escrowed funds.

**4. What happens if the client just goes silent?**

Funds stay locked. No approval means no payout, and the client cannot pull funds
back unilaterally while a milestone is in review or disputed. Disputes are resolved
by a human arbiter via on-chain basis-point splits.

**5. Which network does it run on?**

Stellar — testnet first, with mainnet gated behind the compliance and audit phases.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) and our
[Code of Conduct](./CODE_OF_CONDUCT.md) before opening an issue or PR.

- `master` is protected — never push to it directly. Branch off `dev`, open a PR.
- Contracts merge only with green `cargo test`; the app merges only with green lint
  + build.
- Milestone status changes must flow only through `apply_chain_event()`, and the
  `release_funds` multi-sig must never be weakened.

## Security

Escrow is regulated and holds real value. If you find a vulnerability, **do not
open a public issue** — follow the responsible disclosure process in
[SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © 2026 Siddhartha Kunwar & Janvi Singhal
