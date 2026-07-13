# Contributing to ORKA

Thanks for your interest in contributing to ORKA — escrow-as-infrastructure for
the global service economy. This guide covers how to set up your environment,
the conventions we follow, and how to get changes merged.

By participating, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Ground rules

- **`master` is protected and always demoable.** Never push to it directly — all
  changes arrive via reviewed PRs. Never merge something that breaks the build.
- **On-chain = money truth. Off-chain = everything else.** Do not move
  enforcement-critical money state off-chain, and do not duplicate it on-chain.
- **One sync bridge.** Milestone status derived from chain events is written only
  by `apply_chain_event()` in `services/src/bridge.rs`. Never write
  `milestones.status` from anywhere else.
- **Never commit secrets.** The Supabase service-role key, `ORKA_OPERATOR_SECRET`,
  and any KMS material must never reach the browser or the repo.

---

## Project layout

| Path | Stack | Test command |
|---|---|---|
| `frontend/` | Next.js 16, React 19, TS, Tailwind v3 | `pnpm lint`, `pnpm build` |
| `contracts/` | Rust / Soroban | `cargo test` |
| `services/` | Rust / Axum | `cargo test` |
| `packages/stellar-sdk/` | TypeScript (vitest) | `pnpm test` |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for how the pieces fit together.

---

## Getting started

### Prerequisites

- **Node.js 20+** and **pnpm 9** (the repo ships `pnpm-lock.yaml` — do **not** use npm/yarn)
- **Rust** stable toolchain (for `contracts/` and `services/`)
- A **Supabase** project (for the waitlist + dashboard data)

### Setup

```bash
# Frontend
cd frontend
pnpm install
cp .env.example .env.local     # fill in Supabase + Resend values
pnpm dev                       # http://localhost:3000

# From the repo root, the Makefile wraps common tasks:
make dev      # install + run frontend
make setup    # scaffold frontend/.env.local
make lint     # pnpm lint
make build    # pnpm build
```

Before the waitlist API works, run `frontend/supabase/waitlist.sql` in the
Supabase SQL editor. For dashboard data, apply `phase1_schema.sql` and
`workspace_mvp.sql`.

```bash
# Contracts & backend
cd contracts && cargo test
cd services  && cargo test
```

---

## Branching strategy

ORKA uses a two-tier trunk model with short-lived topic branches.

```
                    (protected, always demoable, tagged releases)
  master  ●───────────────────●───────────────────────●──────►
           \                 ▲                        ▲
            \   PR (release)  │        PR (release)   │
             ▼               /                        /
  dev     ●──●──●──●──●──●──●──●──●──●──●──●──●──●──●──●────►  (integration branch)
              ▲     ▲            ▲
              │ PR  │ PR         │ PR
       feat/… ─┘    │            │
        fix/… ──────┘            │
       chore/… ─────────────────┘
```

### The two long-lived branches

| Branch | Purpose | Who can push | Merges from |
|---|---|---|---|
| **`master`** | Protected production line. Always demoable. Every commit is release-worthy and may be tagged. | **Nobody directly** — PR + review only | `dev` (releases), `hotfix/*` |
| **`dev`** | Default integration branch where day-to-day work lands. | PR + review (no direct pushes) | topic branches (`feat/*`, `fix/*`, …) |

> `master` is the default GitHub branch, but **you branch off `dev` and open PRs
> into `dev`** for normal work. Only release and hotfix PRs target `master`.

### Topic (short-lived) branches

Always branch from up-to-date `dev`. Use a `type/short-description` name in
`kebab-case`:

| Prefix | Use for | Example |
|---|---|---|
| `feat/` | New feature | `feat/milestone-board` |
| `fix/` | Bug fix | `fix/fund-status-desync` |
| `docs/` | Documentation only | `docs/architecture-diagram` |
| `chore/` | Tooling, deps, config | `chore/bump-axum` |
| `refactor/` | Code change, no behavior change | `refactor/stellar-strkey` |
| `test/` | Tests only | `test/escrow-dispute-split` |
| `hotfix/` | Urgent fix branched from **`master`** | `hotfix/release-multisig` |

> Prefer `fix/` for bug branches (it matches CI and existing branches such as
> `fix/contracts-cargo-test`). If you like `bug/`, keep it consistent across the
> team — pick one and stick to it.

### The flow

```bash
# 1. Start from the latest dev
git checkout dev
git pull origin dev

# 2. Create your topic branch
git checkout -b feat/short-description

# 3. Commit focused changes, then push
git push -u origin feat/short-description

# 4. Open a PR into dev (fill out the template). After review + green CI, squash-merge.

# 5. Releasing: open a PR from dev -> master, tag the release on master.
```

**Hotfixes** (production is broken):

```bash
git checkout master && git pull
git checkout -b hotfix/short-description
# fix, PR into master, then also merge master back into dev so dev stays current
```

Keep branches short-lived and rebase/merge `dev` in often to avoid drift. Delete
topic branches after merge.

---

## Development workflow

1. **Open an issue first** for non-trivial changes so we can align on approach.
2. **Branch off `dev`** (see [Branching strategy](#branching-strategy)):
   `git checkout dev && git pull && git checkout -b feat/short-description`.
3. Make focused changes with clear, atomic commits.
4. **Run the checks locally** for every area you touched (see below).
5. Open a Pull Request **into `dev`** and fill out the PR template. Release PRs go
   `dev → master`.

### Required checks before you push

| You changed… | Run |
|---|---|
| `frontend/` | `pnpm lint` **and** `pnpm build` (type errors surface during build) |
| `contracts/` | `cargo test` (must be green — this is enforced) |
| `services/` | `cargo test` |
| `packages/stellar-sdk/` | `pnpm test` |

> There is **no** standalone `pnpm typecheck` for the frontend — TypeScript errors
> are caught by `pnpm build` (`tsc` via Next).

CI (`.github/workflows/ci.yml`) runs frontend lint + build and contracts
`cargo test` on every PR to `master` and `dev`. **Contracts merge only with green
`cargo test`; the app merges only with green lint + build.**

---

## Coding conventions

### General
- Match the style of the file you're editing. Prefer small, reviewable diffs.
- Use existing libraries and patterns already present in the codebase — don't add
  a dependency without discussion.
- Keep security in mind: no secrets in code, no service-role keys in the browser.

### Frontend (`frontend/`)
- TypeScript `strict: true`, `moduleResolution: "bundler"`.
- Tailwind **v3** (not v4). Config in `tailwind.config.ts` / `postcss.config.mjs`.
- Server-side Supabase reads `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
  (no `NEXT_PUBLIC_` prefix). The service-role key must never reach the browser.
- App Router conventions; server actions in `app/actions.ts`.

### Rust (`contracts/`, `services/`)
- Keep contract state minimal — only enforcement-critical money truth.
- Every escrow state transition must enforce the correct `require_auth` and emit
  its `orka` event.
- `release_funds` is multi-sig (client + operator) — never weaken this.
- New chain event handling flows through `apply_chain_event()` only.
- Prefer typed errors (`EscrowError`, `StellarError`, `BridgeError`) over panics
  in request paths.

### SDK (`packages/stellar-sdk/`)
- The client must **never** hold `ORKA_OPERATOR_SECRET` — it only forwards `mode`.
- Preserve the Mode A (`txHash`) vs Mode B (`txXdr`) return contract.

---

## Commit & PR guidelines

- Write clear commit messages in the imperative mood
  (e.g. `fix(escrow): reject double init`). Conventional-commit prefixes
  (`feat`, `fix`, `docs`, `chore`, `refactor`, `test`) are appreciated.
- Reference related issues (`Closes #123`).
- Keep PRs scoped to one logical change.
- Include tests for new behavior and update docs (`ARCHITECTURE.md`, READMEs)
  when you change how something works.
- Do not commit generated artifacts (`target/`, `dist/`, `node_modules/`).

---

## Reporting bugs & requesting features

Use the GitHub issue templates. For **security vulnerabilities**, do **not** open a
public issue — follow [SECURITY.md](./SECURITY.md).

---

## Questions

Open a [discussion or issue](https://github.com/x0lg0n/Orka/issues). Thanks for
helping build ORKA! 🐋
