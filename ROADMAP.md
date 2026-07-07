# ORKA Implementation Roadmap

ORKA is being built as a Web2 product experience with AI-assisted operations and Stellar/Soroban financial infrastructure underneath. The first objective is not full autonomy; it is a reliable milestone escrow workflow that can be dogfooded with Oreenza.

## Phase 0: Foundation Cleanup

- Fix the waitlist API route so `/api/waitlist` is handled by the Next.js App Router.
- Keep naming consistent as `ORKA` across product copy, docs, and code.
- Document environment variables, Supabase setup, and the product build sequence.
- Keep the current landing page as the public acquisition surface.

## Phase 1: Core Workspace MVP

- Add authentication and organization workspaces for agencies.
- Model users, clients, freelancers, projects, milestones, invoices, and ledger events in Supabase Postgres.
- Build dashboard routes for project creation, milestone management, and participant invitations.
- Keep payments mocked until the escrow state machine is ready.

## Phase 2: Soroban Escrow MVP

- Create a Rust/Soroban escrow contract for milestone-based project funds.
- Support `create_project`, `fund_milestone`, `approve_milestone`, `release_funds`, `request_refund`, and `open_dispute`.
- Store only enforcement-critical state on-chain; keep rich project metadata in Postgres.
- Use Stellar testnet first, with explicit transaction status tracking in the app ledger.

## Phase 3: Escrow Integration

- Connect dashboard actions to Stellar RPC through backend route handlers.
- Add sponsored transaction support so users do not manage gas manually.
- Release USDC to freelancers after manual client approval.
- Treat FX/path payments as backend orchestration after release, not as Soroban contract logic.

## Phase 4: Back-Office Automation

- Generate invoices when milestones are released.
- Email project and payment events to clients and freelancers.
- Maintain an internal ledger for audit trails, fees, invoice IDs, and payout references.

## Phase 5: AI-Assisted Operations

- Add AI proposal generation from a raw service brief.
- Convert accepted proposals into milestone schedules.
- Generate first-pass contract language from approved templates.
- Keep all AI output reviewable and editable before contract or payment actions.

## Phase 6: Verification Engine

- Start with advisory verification for GitHub delivery evidence.
- Add confidence scoring, source links, and human override.
- Do not allow autonomous release until Oreenza dogfooding data proves the verification rules are reliable.

## Immediate Build Priority

The next implementation milestone is Phase 1: authenticated project and milestone management backed by Supabase. This creates the product surface required before adding Soroban escrow.
