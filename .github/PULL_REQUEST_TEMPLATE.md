<!--
Thanks for contributing to ORKA! Please fill out this template.
Read CONTRIBUTING.md before opening a PR.
-->

# Summary

<!-- What does this PR do and why? -->

Closes #

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that changes existing behavior)
- [ ] Documentation
- [ ] Chore / refactor / tooling

## Affected area(s)

- [ ] `frontend/` (Next.js)
- [ ] `contracts/` (Soroban)
- [ ] `services/` (Rust/Axum)
- [ ] `packages/stellar-sdk/`
- [ ] `docs/` / other

## Checklist

- [ ] Targets `dev` (not `master`) unless this is a release/hotfix PR
- [ ] `master`/`dev` stays demoable after this change
- [ ] Frontend: `pnpm lint` and `pnpm build` pass (if `frontend/` changed)
- [ ] Contracts: `cargo test` passes (if `contracts/` changed) — **required, enforced**
- [ ] Services: `cargo test` passes (if `services/` changed)
- [ ] SDK: `pnpm test` passes (if `packages/stellar-sdk/` changed)
- [ ] No secrets committed (service-role key, `ORKA_OPERATOR_SECRET`, KMS material)
- [ ] Milestone status changes still flow only through `apply_chain_event()`
- [ ] `release_funds` multi-sig (client + operator) is preserved
- [ ] Docs updated (`ARCHITECTURE.md` / READMEs) where behavior changed
- [ ] Tests added/updated for new behavior

## How was this tested?

<!-- Describe the tests you ran, network (testnet/mainnet), and custody mode. -->

## Screenshots / tx hashes (if applicable)

<!-- Paste UI screenshots or Stellar transaction hashes. -->
