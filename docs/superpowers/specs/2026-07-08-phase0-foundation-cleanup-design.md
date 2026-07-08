# ORKA Phase 0 — Foundation Cleanup (Design)

**Date:** 2026-07-08
**Status:** Approved design, ready for implementation plan

## Goal

Make the ORKA repo a place a real engineer can clone and run one command to see
the landing page + waitlist working locally, with docs and environment wired for
Phase 1+ (contracts, services, packages).

## Context

Current repo state (verified 2026-07-08):
- Root: `ROADMAP.md` (canonical), `AGENTS.md`, empty `README.md`, `LICENSE`,
  `Revento.png`, `.gitignore` (only ignores `.next`, `.qwen`).
- `frontend/` is the only working app: Next.js 16 App Router, React 19, Tailwind v3,
  Supabase + Resend waitlist. `package.json` name is `orka-landing`.
- `frontend/.env.example` exists but only covers Supabase + Resend; missing
  Phase 0 infra vars.
- `frontend/README.md` is a combined marketing + setup doc and says `npm install`,
  conflicting with `AGENTS.md` (use **pnpm**).
- `docs/USER_FLOW.md` exists and already aligns with `ROADMAP.md` — keep.
- No `Makefile`, no CI, no `VISION.md`.

## Decisions (user-approved)

1. **Keep `frontend/` as the app location.** Do NOT promote to repo root in Phase 0.
   Rename `package.json` `name` to `orka` and align branding/docs. Phase 1 may
   promote later.
2. **Lightweight local dev.** `make dev` runs `pnpm dev`; add documented Supabase
   quickstart + Stellar note in README/Makefile. No containerized stack in Phase 0.
3. **Split docs.** Move marketing/hackathon vision into root `VISION.md`;
   slim `frontend/README.md` to a setup-only doc.

## Design

### 1. Doc hygiene
- Create `VISION.md` at repo root with the long-term marketing/hackathon narrative,
  lifted from `frontend/README.md`.
- Slim `frontend/README.md` to: what it is (one line), tech stack, **Getting Started
  with `pnpm install` / `pnpm dev` / `pnpm build` / `pnpm lint`**, and the waitlist
  backend prerequisites (Supabase `waitlist` table via `frontend/supabase/waitlist.sql`,
  copy `.env.example` → `.env.local`). Fix the `npm` → `pnpm` inconsistency.
- Keep `ROADMAP.md` and `docs/USER_FLOW.md` unchanged.

### 2. Naming alignment
- `frontend/package.json`: rename `"name": "orka-landing"` → `"name": "orka"`.
- Grep `frontend/` for stray `orka-landing` references; align any user-facing copy
  to "ORKA". No behavioral changes.

### 3. Environment template
- Expand `frontend/.env.example` with placeholder values:
  - `SUPABASE_URL` (kept as-is — `lib/supabase.ts` reads this; do NOT switch to
    `NEXT_PUBLIC_` per `AGENTS.md` gotcha)
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `RESEND_API_KEY`
  - `STELLAR_RPC_URL`
  - `STELLAR_NETWORK`
  - `ORKA_OPERATOR_SECRET` (ORKA's funded Stellar account for sponsored txns +
    multi-sig co-signer)
  - `KMS_CONFIG` (AWS KMS / GCP KMS / Vault endpoint for Mode A key custody)
- All values are placeholders/examples. No real secrets. Service-role key stays
  server-side only.

### 4. Local dev
- Add root `Makefile`:
  - `make dev` → runs `cd frontend && pnpm install && pnpm dev`
  - `make lint` → `cd frontend && pnpm lint`
  - `make build` → `cd frontend && pnpm build`
  - Comment block documenting Supabase quickstart (create `waitlist` table via
    `frontend/supabase/waitlist.sql`) and Stellar testnet note for Phase 1.

### 5. CI
- Add `.github/workflows/ci.yml`: on PR, checkout, setup pnpm, `pnpm install`,
  `pnpm lint`, `pnpm build`. (`cargo test` added in Phase 1 when contracts exist.)

### 6. Gate (definition of done)
A new contributor can clone the repo, run `pnpm install && pnpm dev` (or `make dev`),
and see the landing page + waitlist working locally.

## Out of scope (Phase 1+)
- Soroban `contracts/`, Rust `services/`, `packages/` — added in Phase 1.
- KYC/licensing, AI engines, on/off ramp — later phases.
- Full containerized Supabase + Stellar local stack.

## Verification
- `pnpm build` succeeds in `frontend/`.
- `pnpm lint` clean.
- CI workflow present and structurally valid (lint + build jobs).
- New contributor path documented and reproducible from a fresh clone.
