---
phase: 01-rust-backend-services
plan: 06
type: execute
status: complete
verified: true
---

# 01-06 — packages/stellar-sdk (thin TS client)

## What was built

A standalone, buildable, tested TypeScript package `@orka/stellar-sdk` that the
frontend imports to call `services/`. Satisfies PH1-06.

- `package.json` — ESM, strict, no runtime deps (uses native `fetch`); `build`
  (tsc) + `test` (vitest) scripts.
- `tsconfig.json` — `strict`, `module: ESNext`, `moduleResolution: bundler`,
  `target: ES2022`, `declaration: true`, `lib: [ES2022, DOM]`.
- `src/types.ts` — `CustodyMode`, `FundResult` (`{txHash}` | `{txXdr}`),
  `OrkaClientOptions`, `FundArgs`, `ReleaseArgs`.
- `src/client.ts` — `createOrkaClient({ baseUrl, mode })` exposing
  `fundEscrow`, `releaseMilestone`, `getContractState`. All requests forward
  `mode`; the client NEVER imports/sends `ORKA_OPERATOR_SECRET`.
- `src/index.ts` — re-exports the public API.
- `src/client.test.ts` — vitest with mocked `fetch`: Mode A → `txHash` +
  `mode:"orka"`, Mode B → `txXdr` + `mode:"freighter"`, `getContractState`
  → `GET /escrow/state?contract_id=...`.
- `.gitignore` — ignores `dist/`, `node_modules/`, tsbuildinfo.

## Verification

- `pnpm install` ✅
- `pnpm build` (strict tsc) ✅ 0 errors
- `pnpm test` ✅ 4/4 passing

## Notes

- Endpoint paths match `services/src/stellar.rs`: `/escrow/fund`,
  `/escrow/release`, `/escrow/state`. The current backend returns `tx_xdr`
  for both modes (Mode A multi-sig is a documented seam); the client maps
  Mode A → `txHash`, Mode B → `txXdr` per the contract. Phase 2 wiring
  (`lib/orka.ts`) will reconcile the actual response shape.
- This package only defines the client contract for now; Phase 2 wires the
  frontend to it (replacing `fakeTx`).

## Next

Phase 1 (Rust Backend Services) is complete: 6/6 plans done.
Phase 2 (Wire Frontend to Real Backend) begins with 02-01.
