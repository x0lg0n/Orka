# ORKA Phase 0 — Foundation Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the ORKA repo a place a new contributor can clone and run one command to see the landing page + waitlist working, with docs and environment wired for Phase 1+.

**Architecture:** Pure repo hygiene — no behavioral changes to the app. Rename the package, split marketing copy into `VISION.md`, expand the env template with placeholder infra vars, add a lightweight `Makefile`, and add a CI workflow. App stays in `frontend/`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v3, pnpm, GitHub Actions, Make.

## Global Constraints

- Use **pnpm** (repo ships `pnpm-lock.yaml`; no `package-lock.json`). `npm` is wrong.
- `lib/supabase.ts` reads `SUPABASE_URL` (server-side, NO `NEXT_PUBLIC_` prefix). Do NOT rename to `NEXT_PUBLIC_SUPABASE_URL`.
- Service-role key (`SUPABASE_SERVICE_ROLE_KEY`) must never reach the browser.
- Keep `frontend/` as the app location. Do NOT promote to repo root.
- `ROADMAP.md` is canonical — do not edit it. `docs/USER_FLOW.md` stays as-is.
- All `.env.example` values are placeholders/examples — never commit real secrets.
- There is NO `typecheck` script; type errors surface during `pnpm build`.

---

### Task 1: Rename package to `orka` and align branding

**Files:**
- Modify: `frontend/package.json:2`
- Modify (grep): any `frontend/` source/docs referencing `orka-landing`

**Interfaces:**
- Consumes: nothing
- Produces: package `name` = `orka`; no code changes to runtime behavior

- [ ] **Step 1: Rename the package name**

Edit `frontend/package.json`, change line 2:
```json
  "name": "orka",
```

- [ ] **Step 2: Scan for stray `orka-landing` references**

Run from repo root:
```bash
grep -rn "orka-landing" frontend/ --include="*.ts" --include="*.tsx" --include="*.json" --include="*.md" --include="*.mjs" 2>/dev/null
```
Expected: only `frontend/package.json` (just edited) matches, or no matches. If any appear in user-facing copy, update them to "ORKA".

- [ ] **Step 3: Verify build still works**

Run:
```bash
cd frontend && pnpm install && pnpm build
```
Expected: build succeeds (exit 0), no new errors. (Note: build may warn about missing env — that is fine; the waitlist route only throws at runtime.)

- [ ] **Step 4: Commit**

```bash
git add frontend/package.json
git commit -m "chore: rename package to orka"
```

---

### Task 2: Create root `VISION.md` with marketing narrative

**Files:**
- Create: `VISION.md`

**Interfaces:**
- Consumes: marketing copy currently in `frontend/README.md` (Product Positioning + Landing Page Features sections)
- Produces: root `VISION.md` holding the long-term narrative; `frontend/README.md` will be slimmed in Task 3

- [ ] **Step 1: Write `VISION.md`**

Create `VISION.md` at repo root with this content:
```markdown
# ORKA — Vision

**ORKA: The Autonomous Financial Operating System for the Global Service Economy.**

ORKA removes the administrative tax of service businesses operating across borders.
Instead of stitching together proposal tools, contract templates, manual escrow,
payment processors, spreadsheets, and accounting workflows, ORKA presents one
connected project finance flow:

- AI-generated proposals, contracts, pricing, and milestone schedules
- Soroban-powered programmable escrow for milestone-based trust
- AI-assisted delivery verification for code, design, content, and project evidence
- Automated payouts, invoices, ledger entries, and reporting workflows
- A familiar Web2 user experience with Stellar infrastructure under the hood

## Positioning

Web2 user experience. AI-driven operations. Stellar/Soroban financial infrastructure
underneath. Stellar runs silently — normal users never touch a seed phrase or gas.
Crypto-native users may bring their own Freighter wallet for self-custody. Both modes
drive the same audited Soroban contract.

See `ROADMAP.md` for the canonical build plan and `docs/USER_FLOW.md` for end-to-end
scenarios.
```

- [ ] **Step 2: Commit**

```bash
git add VISION.md
git commit -m "docs: add VISION.md with marketing narrative"
```

---

### Task 3: Slim `frontend/README.md` to a setup-only doc

**Files:**
- Modify: `frontend/README.md` (full rewrite)

**Interfaces:**
- Consumes: `VISION.md` (Task 2) now holds marketing copy; `frontend/supabase/waitlist.sql` exists
- Produces: setup-only README with correct `pnpm` commands

- [ ] **Step 1: Rewrite `frontend/README.md`**

Replace the entire file with:
```markdown
# ORKA Landing Page

The first production-ready marketing surface for ORKA: a responsive Next.js 16 (App
Router) landing page with a Supabase/Resend-backed waitlist. The long-term product
vision lives in the repository root at `../VISION.md`; the canonical build plan is
`../ROADMAP.md`.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v3
- ESLint with Next.js rules

## Getting Started

Install dependencies (use **pnpm** — the repo ships `pnpm-lock.yaml`):

```bash
pnpm install
```

Start the local development server:

```bash
pnpm dev
```

Open the app at http://localhost:3000.

## Available Scripts

```bash
pnpm dev     # Next.js development server
pnpm build   # optimized production build (also surfaces type errors)
pnpm start   # production server (after build)
pnpm lint    # ESLint across the project
```

## Waitlist Backend Prerequisites

The waitlist form posts to `app/api/waitlist/route.ts` and requires a Supabase
`waitlist` table plus Resend credentials:

1. In the Supabase SQL editor, run `supabase/waitlist.sql` to create the `waitlist` table and RLS policies.
2. Copy `.env.example` to `.env.local` and fill in the Supabase and Resend values.
   - No env vars are needed for the static landing page itself, but the API route throws at runtime without Supabase/Resend values.
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are read server-side (no `NEXT_PUBLIC_` prefix). The service-role key must never reach the browser.

## Deployment

Deploy on Vercel or any platform that supports Next.js. Import the repo, keep default
Next.js build settings, deploy. No environment variables are required for the static
landing page.
```

- [ ] **Step 2: Verify README no longer says `npm install`**

Run:
```bash
grep -n "npm install\|npm run" frontend/README.md
```
Expected: no matches.

- [ ] **Step 3: Commit**

```bash
git add frontend/README.md
git commit -m "docs: slim frontend README to setup-only, fix pnpm"
```

---

### Task 4: Expand `frontend/.env.example` with Phase 0 infra vars

**Files:**
- Modify: `frontend/.env.example` (full rewrite)

**Interfaces:**
- Consumes: existing Supabase + Resend vars in current `.env.example`
- Produces: expanded env template with placeholder Stellar/KMS/operator vars for Phase 1+

- [ ] **Step 1: Rewrite `frontend/.env.example`**

Replace the entire file with:
```bash
# ── Supabase ── get these from https://supabase.com/dashboard/project/_/settings/api
# Server-side only. NO NEXT_PUBLIC_ prefix (lib/supabase.ts reads SUPABASE_URL).
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
# Trusted server-side operations only. NEVER expose to the browser.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── Resend ── get this from https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key
# Sender email — use onboarding@resend.dev on free plan, or a verified domain
RESEND_FROM_EMAIL=ORKA <onboarding@resend.dev>

# ── Stellar (Phase 1+) ── placeholder values, no real secrets
# RPC endpoint for the Stellar network ORKA talks to
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
# "testnet" | "mainnet" | "futurenet"
STELLAR_NETWORK=testnet
# ORKA's funded Stellar account — sponsors zero-gas txns and co-signs multi-sig release
ORKA_OPERATOR_SECRET=replace-with-operator-secret-key-or-kms-ref

# ── KMS (Phase 1+, Mode A key custody) ── endpoint + config for managed Stellar keys
# AWS KMS / GCP KMS / Vault endpoint. JSON or connection string.
KMS_CONFIG=replace-with-kms-endpoint-or-config
```

- [ ] **Step 2: Verify no real secrets, only placeholders**

Run:
```bash
grep -E "sk-[a-zA-Z0-9]{20,}|AKIA[A-Z0-9]{16}|eyJ[a-zA-Z0-9_-]+\." frontend/.env.example
```
Expected: no matches (all values are `replace-with-...` / example refs).

- [ ] **Step 3: Commit**

```bash
git add frontend/.env.example
git commit -m "chore: expand .env.example with Stellar/KMS/operator placeholders"
```

---

### Task 5: Add root `Makefile` with `make dev` and quickstart notes

**Files:**
- Create: `Makefile`

**Interfaces:**
- Consumes: `frontend/` app, `frontend/supabase/waitlist.sql`, `frontend/.env.example`
- Produces: `make dev` / `make lint` / `make build` targets + Supabase/Stellar quickstart docs

- [ ] **Step 1: Write the `Makefile`**

Create `Makefile` at repo root (use tabs for recipe indentation):
```makefile
# ORKA — local dev shortcuts. App lives in frontend/.

.PHONY: dev lint build setup waitlist supabase-note stellar-note

dev:
	cd frontend && pnpm install && pnpm dev

lint:
	cd frontend && pnpm lint

build:
	cd frontend && pnpm build

# One-time local setup of the waitlist backend:
#   1. Create the Supabase `waitlist` table + RLS policies:
#        run frontend/supabase/waitlist.sql in the Supabase SQL editor
#   2. Configure env:
#        cp frontend/.env.example frontend/.env.local
#        then fill in the Supabase + Resend values
setup:
	cp frontend/.env.example frontend/.env.local
	@echo "Edit frontend/.env.local, then run 'make dev'"

# Local Supabase (optional, for a real DB instead of Supabase cloud):
#   Install the Supabase CLI, then:  supabase start
#   Apply schema:                    supabase db reset   (runs frontend/supabase/waitlist.sql if linked)
supabase-note:
	@echo "Supabase CLI quickstart: https://supabase.com/docs/guides/local-development"

# Stellar (Phase 1+): ORKA targets testnet first.
#   Testnet RPC + friendbot faucet: https://soroban.stellar.org/docs/learn/quickstart
stellar-note:
	@echo "Stellar testnet quickstart: https://soroban.stellar.org/docs/learn/quickstart"
```

- [ ] **Step 2: Verify make targets parse**

Run:
```bash
make -n dev && make -n lint && make -n build
```
Expected: prints the commands (`cd frontend && pnpm ...`) without executing, exit 0.

- [ ] **Step 3: Commit**

```bash
git add Makefile
git commit -m "chore: add Makefile with dev/lint/build shortcuts"
```

---

### Task 6: Add CI workflow (lint + build on PR)

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: pnpm scripts (`lint`, `build`) in `frontend/`
- Produces: CI workflow running install + lint + build on PRs to `main`

- [ ] **Step 1: Write the CI workflow**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  frontend:
    name: Frontend lint & build
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          cache-dependency-path: frontend/pnpm-lock.yaml

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Build
        run: pnpm build
```
Note: `cargo test` is intentionally absent — added in Phase 1 when Soroban contracts exist.

- [ ] **Step 2: Validate YAML is well-formed**

Run:
```bash
python -c "import yaml,sys; yaml.safe_load(open('.github/workflows/ci.yml')); print('YAML OK')"
```
Expected: `YAML OK`. (If `python`/`yaml` is unavailable, skip — the structure is standard.)

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add lint + build workflow on PR"
```

---

### Task 7: Final gate verification

**Files:**
- Verify: fresh-clone path works; build + lint clean

**Interfaces:**
- Consumes: all Tasks 1–6 outputs

- [ ] **Step 1: Run lint from a clean state**

Run:
```bash
cd frontend && pnpm lint
```
Expected: no ESLint errors (exit 0).

- [ ] **Step 2: Run build**

Run:
```bash
cd frontend && pnpm build
```
Expected: production build succeeds (exit 0).

- [ ] **Step 3: Confirm the new-contributor gate**

Run:
```bash
ls VISION.md Makefile .github/workflows/ci.yml frontend/.env.example
grep -n '"name": "orka"' frontend/package.json
```
Expected: all four files exist; `package.json` name is `orka`. A new contributor cloning the repo and running `pnpm install && pnpm dev` (or `make dev`) reaches the landing page at http://localhost:3000.

- [ ] **Step 4: Commit any stray fixes**

If Steps 1–3 required edits, commit them:
```bash
git add -A
git commit -m "chore: Phase 0 gate fixes"
```
If nothing changed, no commit needed.

---

## Self-Review Notes (run during writing, already applied)

- Spec coverage: doc hygiene (Tasks 2,3), naming (Task 1), env template (Task 4),
  local dev (Task 5), CI (Task 6), gate (Task 7) — all covered. Out-of-scope items
  (contracts, services, KMS code, containerized stack) correctly excluded.
- No placeholders: every step shows concrete file content or command.
- Type/name consistency: `orka` package name used consistently; `SUPABASE_URL` kept
  (not renamed). No cross-task name drift.
