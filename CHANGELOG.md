# Changelog

All notable changes to ORKA are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Soroban escrow contract (`contracts/escrow`) with full milestone lifecycle:
  `initialize`, `fund`, `submit`, `reject`, `approve`, `refund`, `open_dispute`,
  `release_funds` (client + operator multi-sig), and `resolve_dispute`.
- Escrow factory (`contracts/escrow-factory`) for deploying per-project escrows.
- Rust/Axum backend (`services/`): dual-mode auth, KMS custody, Stellar
  transaction building/signing with operator-sponsored fee-bump, the
  `apply_chain_event()` sync bridge, and a chain event indexer.
- TypeScript SDK (`packages/stellar-sdk`, `@orka/stellar-sdk`) with
  `fundEscrow`, `releaseMilestone`, and `getContractState`.
- Next.js dashboard (`frontend/app/dashboard`): projects, milestones, payments,
  proposals, settings, onboarding, and Freighter (Mode B) signing.
- Supabase schema for phase 1 workspace + escrow contract mapping.
- Open-source project files: `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`,
  `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue/PR templates.

### Changed
- Root `README.md` now documents the full project (previously intentionally empty).

## [0.1.0] — Landing page

### Added
- Next.js 16 (App Router) landing page with a Supabase + Resend waitlist.
- Canonical build plan (`ROADMAP.md`) and end-to-end user flows (`docs/USER_FLOW.md`).
- CI (`.github/workflows/ci.yml`): frontend lint + build and contracts `cargo test`.

[Unreleased]: https://github.com/x0lg0n/Orka/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/x0lg0n/Orka/releases/tag/v0.1.0
