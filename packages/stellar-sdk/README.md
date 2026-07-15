# @orka/stellar-sdk

TypeScript client SDK for ORKA escrow operations. The frontend talks to the **ORKA services backend** through this client rather than touching Stellar/Soroban directly — it forwards custody-mode intent and receives either a submitted transaction hash or a signed XDR to hand to a wallet.

## Install

This is a workspace package consumed by `frontend/` (no published registry package yet):

```jsonc
// frontend/package.json
"@orka/stellar-sdk": "file:../packages/stellar-sdk"
```

## Usage

```ts
import { createOrkaClient } from '@orka/stellar-sdk';

const client = createOrkaClient({
  baseUrl: 'http://localhost:3000', // ORKA services base URL
  mode: 'orka',                     // or 'freighter'
});

// Fund a set of milestones on an escrow contract
const funded = await client.fundEscrow({ contractId, milestoneIds });

// Release a single milestone
const released = await client.releaseMilestone({ contractId, milestoneId });

// Read raw on-chain contract state
const state = await client.getContractState({ contractId });
```

## API

- **`createOrkaClient(opts): OrkaClient`**
  - `opts.baseUrl` — ORKA services base URL.
  - `opts.mode` — `'orka' | 'freighter'` (see Custody Model below).
- **`fundEscrow(args): Promise<FundResult>`** — `args: { contractId, milestoneIds }`.
- **`releaseMilestone(args): Promise<FundResult>`** — `args: { contractId, milestoneId }`.
- **`getContractState(args): Promise<unknown>`** — `args: { contractId }` (raw contract state).

`FundResult` is `{ txHash }` in `orka` mode and `{ txXdr }` in `freighter` mode.

## Custody Model (per root `ROADMAP.md` §Auth & Custody)

- **Mode A — `orka`**: the backend signs with the ORKA operator key; the route returns a transaction hash once submitted (`{ txHash }`).
- **Mode B — `freighter`**: the backend returns a signed transaction XDR that the browser hands to the Freighter wallet for the user to sign/broadcast (`{ txXdr }`).

The client **never holds `ORKA_OPERATOR_SECRET`** — it only forwards `mode`; signing happens server-side (`orka`) or inside Freighter (`freighter`).

## Scripts

```bash
pnpm install
pnpm test    # vitest run
pnpm build   # tsc -p tsconfig.json
```

## Structure

```text
src/
  index.ts        # public exports
  client.ts       # createOrkaClient + escrow helpers
  types.ts        # option / result types (CustodyMode, FundArgs, ReleaseArgs, ...)
  client.test.ts  # vitest specs
```
