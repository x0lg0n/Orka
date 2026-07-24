# XLM Deployment Cost Estimate — ORKA Soroban Smart Contracts

> **Date:** July 24, 2026
> **XLM Price Reference:** ~$0.18 per XLM (as of July 24, 2026)
> **Network:** Stellar Mainnet (Soroban Protocol 20+)

---

## 1. Why Does Deploying Cost XLM?

Stellar requires a minimum balance (base reserve) and ledger rent for every piece of data on the network. Smart contracts store their code (WASM) and data (Config, Milestones, etc.) on the ledger, so they require:

- **Ledger entry rent** — pre-paid for ~4096 ledgers (~28 hours) when the entry is created
- **Transaction resource fees** — CPU instructions, memory, ledger reads/writes
- **Account minimum balance** — 2 × base reserve (currently 1 XLM total)

Rent is refundable if the entry is deleted, and you can extend TTL instead of re-paying.

---

## 2. Our Smart Contracts

| Contract | Crate | Purpose | Lines of Rust | Est. WASM Size |
|----------|-------|---------|---------------|-----------------|
| `orka-escrow` | `contracts/escrow/` | Per-deal escrow — fund, submit, approve, release, refund, dispute, resolve | ~285 | ~50 KB |
| `orka-escrow-factory` | `contracts/escrow-factory/` | Deploys new escrow instances from uploaded WASM | ~65 | ~25 KB |

### `orka-escrow` — Public Functions
- `initialize` — set up Config (org, client, freelancer, asset, operator, dispute_rules)
- `fund` — client locks funds into a milestone
- `submit` — freelancer marks milestone as submitted
- `reject` — client rejects submission
- `approve` — client approves milestone (intent only, no transfer)
- `refund` — client refunds a funded milestone
- `open_dispute` — client or freelancer starts a dispute
- `release_funds` — multi-sig (client + operator) releases payment to freelancer
- `resolve_dispute` — operator resolves dispute with split percentage

### `orka-escrow-factory` — Public Functions
- `initialize` — set operator address and escrow WASM hash
- `create_escrow` — deploys a new `orka-escrow` instance from the stored WASM

---

## 3. Cost Breakdown (Mainnet)

### 3.1 Account Prerequisite

| Item | XLM | Notes |
|------|-----|-------|
| Account minimum balance | 1.0 | 2 × base reserve (0.5 XLM each) — must always be in the account |

### 3.2 One-Time Infrastructure (deployed once)

| Contract | Operation | Est. XLM | Details |
|----------|-----------|----------|---------|
| `orka-escrow-factory` | WASM upload (~25 KB) | 1.5 | Transaction fee + ~4000-ledger rent for the WASM blob |
| `orka-escrow-factory` | Instance + data entries | 2.0 | ContractInstance + 2 ContractData entries (Operator, Wasm hash) |
| **Factory total** | | **3.5** | |

### 3.3 Per Escrow Instance (via factory)

| Item | Est. XLM | Details |
|------|----------|---------|
| Deploy from stored WASM | 0.5 | Resource fee + ContractInstance creation |
| Config + Milestones data entries | 1.5 | 2 ContractData entries rent |
| **Per escrow total** | **2.0** | |

### 3.4 Alternative: Direct Deployment (without factory)

| Item | Est. XLM | Details |
|------|----------|---------|
| `orka-escrow` WASM upload (~50 KB) | 3.0 | Larger WASM = higher rent — one-time only |
| Instance + data entries | 2.0 | Same as factory path |
| **First escrow direct** | **5.0** | Subsequent escrows: ~2.0 XLM each (WASM already on ledger) |

---

## 4. Scenario Estimates

### Minimum Viable Launch (factory + 10 escrows)

| Item | XLM |
|------|-----|
| Account reserve | 1.0 |
| Factory upload + deploy | 3.5 |
| 10 escrows × 2 XLM | 20.0 |
| Buffer (20%) | 5.0 |
| **Total** | **~30 XLM (~$5.40)** |

### Production Launch (factory + 100 escrows)

| Item | XLM |
|------|-----|
| Account reserve | 1.0 |
| Factory upload + deploy | 3.5 |
| 100 escrows × 2 XLM | 200.0 |
| Buffer (20%) | 41.0 |
| **Total** | **~245 XLM (~$44)** |

### Full Scale (factory + 1000 escrows)

| Item | XLM |
|------|-----|
| Account reserve | 1.0 |
| Factory upload + deploy | 3.5 |
| 1000 escrows × 2 XLM | 2000.0 |
| Buffer (20%) | 401.0 |
| **Total** | **~2405 XLM (~$433)** |

---

## 5. Ongoing Costs (Rent)

Each contract's data entries need TTL extension every ~4096 ledgers (~28 hours).

| Scale | Rent per ~28 hours | Per year (USD) |
|-------|---------------------|-----------------|
| 10 escrows | ~5 XLM (80.90) | ~$11 |
| 100 escrows | ~41 XLM (~$7.40) | ~$89 |
| 1000 escrows | ~401 XLM (~$72) | ~$864 |

**Mitigation:** Rent is batched — extend TTL for all entries in a single transaction. Each extension covers ~28 hours, not 1 day.

---

## 6. Recommended Ask

You have **50 waitlist users** ready to try the product on launch. Each needs an escrow slot, so the realistic ask is:

```
Account reserve       1.0 XLM
Factory deployment    4.0 XLM
50 escrows × 2      100.0 XLM
Buffer (20%)         21.0 XLM
─────────────────────────────
Total:             ~126 XLM  (~$22.68 USD)
```

| Stage | Users / Projects | XLM Needed | USD |
|-------|-----------------|------------|-----|
| Launch | 50 (your waitlist) | ~126 | ~$22.68 |
| Growth | +50 more | +100 | +$18.00 |
| Scale | +100 more | +200 | +$36.00 |

**Formula:** `Total XLM = 5 + (number of escrow projects × 2)`
- The "5" covers the one-time factory deploy + account reserve
- Each new escrow project costs ~2 XLM as it's created (paid from operational revenue)

> **Important:** The 100/1000 escrow scenarios in this doc are future reference — you don't ask for them upfront. You only pay for what you need at launch.

---

## 7. Caveats

1. **WASM sizes are estimated** — Rust → WASM compilation produces ~45-55 KB for orka-escrow and ~20-30 KB for the factory. Build with `cargo build -p orka-escrow --target wasm32v1-none --release` to get exact sizes, then run `stellar contract deploy --wasm <file>` for a precise simulated fee.

2. **Network congestion** — during surge pricing, the inclusion fee multiplier can increase costs 2-10×. Deploy during low-traffic periods.

3. **Fee parameters may change** — validators can vote to change the base reserve (currently 0.5 XLM) and fee structure.

4. **Contract upgrades** — if `orka-escrow` logic is updated, you upload a new WASM and update the factory's stored hash (~2 XLM for the update).

5. **No build environment available** — these estimates use conservative sizes from similar Soroban projects. Verify with an actual build before finalizing the budget.

---

## 8. Summary

| Contract | One-Time Cost | Per Instance |
|----------|---------------|--------------|
| `orka-escrow-factory` | ~4 XLM | — |
| `orka-escrow` | — | ~2 XLM |

**Formula:** Total = 5 + (2 × escrows) XLM (includes account reserve + factory)
