# Security Policy

ORKA is financial infrastructure: it custodies keys, sponsors on-chain
transactions, and moves real value (USDC) through Soroban escrow contracts. We
take security extremely seriously and welcome responsible disclosure.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, report privately via one of:

- **Email:** security@orka.dev (preferred) — encrypt with our PGP key if you have
  sensitive details.
- **GitHub Security Advisories:** use
  [Private vulnerability reporting](https://github.com/x0lg0n/Orka/security/advisories/new)
  on this repository.

Please include:

- A clear description of the issue and its impact.
- Steps to reproduce (proof-of-concept, affected component, network).
- The affected area: `contracts/`, `services/`, `frontend/`,
  `packages/stellar-sdk/`, or infrastructure.
- Your assessment of severity and any suggested remediation.

### What to expect

| Stage | Target |
|---|---|
| Acknowledgement of your report | within **48 hours** |
| Initial severity assessment | within **5 business days** |
| Status updates | at least every **7 days** until resolved |
| Coordinated disclosure | after a fix ships, by mutual agreement |

We will credit reporters who follow responsible disclosure (unless you prefer to
remain anonymous).

## Scope

High-priority areas, roughly in order of blast radius:

1. **Soroban escrow contracts** (`contracts/escrow`, `contracts/escrow-factory`)
   — anything that could move, lock, or unlock funds incorrectly, bypass
   `require_auth`, or defeat the client + operator **multi-sig** on
   `release_funds`.
2. **Custody & signing** (`services/src/custody.rs`, `services/src/stellar.rs`)
   — KMS key handling, seed exposure, fee-bump/sponsorship abuse, signature
   forgery, mode enforcement (Mode A vs Mode B).
3. **Auth & the sync bridge** (`services/src/auth.rs`, `services/src/bridge.rs`)
   — JWT/Freighter session bypass, unauthorized `/bridge/event` writes, ledger
   desync between chain and Postgres.
4. **Frontend & data** (`frontend/`, Supabase RLS) — service-role key exposure,
   RLS bypass, XSS/CSRF, secret leakage to the browser.

## Out of scope

- Vulnerabilities in third-party dependencies without a demonstrated exploit in
  ORKA (please still tell us).
- Findings that require a compromised operator/admin machine or physical access.
- Best-practice suggestions without a concrete security impact.
- Denial of service via unrealistic traffic volumes.
- Known, documented Phase-1 gaps (see below).

## Known limitations (Phase 1)

These are documented, intentional trade-offs while the product matures — please
still report them if you find a concrete exploit, but they are not surprises:

- The backend CORS layer is currently permissive and will be tightened before
  production.
- Contract and custody-layer third-party audits (e.g. OtterSec / Trail of Bits)
  are planned for Phase 3 and not yet complete.
- On-chain JWT verification (true account abstraction) is a Phase 4+ research
  item; today Mode A uses backend-verified JWT → backend signs with the KMS key.
- Freighter operator-as-signer for `create_escrow` is not fully wired for the MVP.

See [`ROADMAP.md`](./ROADMAP.md) (Phase 3 — Compliance & Trust) for the full
security hardening plan.

## Our security commitments

- **ORKA cannot unilaterally move escrow funds** — release requires a client +
  operator multi-sig, enforced on-chain.
- Mode A keys are encrypted in KMS and only decrypted for a single sign
  operation.
- The Supabase service-role key is server-side only and never reaches the browser.
- Every on-chain action is reconciled through a single, idempotent bridge and
  recorded in the `ledger_events` audit trail.

## Supported versions

ORKA is under active development. Security fixes are applied to the `master`
branch. Until a tagged stable release exists, treat `master` as the supported
version.

Thank you for helping keep ORKA and its users safe. 🐋🔒
