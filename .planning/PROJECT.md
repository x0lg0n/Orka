# ORKA — Backend Build (GSD working project)

**Product:** Autonomous Financial Operating System (Stellar/Soroban under Web2 UX).
**Canonical roadmap:** `ROADMAP.md` (root). This file is the GSD working copy.

**Current state (verified via git + code):**
- Frontend workspace MVP: DONE (mocked chain via `lib/orka.ts` `fakeTx`).
- Soroban escrow contract (`contracts/escrow`): DONE (lib.rs + test.rs).
- Rust backend (`services/`): NOT STARTED (empty scaffold only).
- `packages/stellar-sdk` (TS client): NOT STARTED (empty scaffold only).
- Frontend↔backend wiring: NOT STARTED (UI calls `fakeTx`).

**Plan (user-directed): backend first → frontend wiring → linear-style dashboard.**
