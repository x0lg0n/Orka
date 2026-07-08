# Testing Patterns

**Analysis Date:** 2026-07-08

## Test Framework

**Runner:**
- **None configured.** The repository has no test runner installed (no `jest`, `vitest`, `mocha`, or Playwright in `frontend/package.json` dependencies or devDependencies).

**Assertion Library:**
- **None.** No assertion library present.

**Run Commands:**
- `pnpm lint` runs ESLint only (`eslint .`) — this is a static-analysis/lint step, NOT a test.
- `pnpm build` runs `next build`, which compiles TypeScript and can surface type errors, but runs no test suite.
- No `test`, `test:watch`, or `coverage` script exists in `frontend/package.json`.

```bash
# Lint only (no tests):
pnpm lint

# Type-check via build (no tests):
pnpm build
```

## Test File Organization

**Location:**
- No test files exist anywhere in the repository. Grep for `describe(`, `expect(`, `it(`, `test` across `.ts/.tsx/.js/.json` found only `String.test()` email-validation calls in `frontend/app/page.tsx:84` and `frontend/app/api/waitlist/route.ts:50` — these are NOT test framework invocations.

**Naming:**
- No established convention (no tests present).

**Structure:**
- No established convention (no tests present).

## Test Structure

**Suite Organization:**
- N/A — no tests.

**Patterns:**
- N/A — no tests.

## Mocking

**Framework:** None.

**Patterns:**
- N/A — no tests and no mocks. If tests were added, the natural mocking targets would be:
  - `getSupabase()` / `getResend()` lazy singletons in `frontend/lib/supabase.ts` and `frontend/lib/resend.ts` (would need injection or module mocking).
  - `fetch("/api/waitlist", ...)` calls in `frontend/app/page.tsx` (would need `jest.fn()` / `vi.fn()` or a fetch mock).
  - `NextResponse` and `request.json()` in `frontend/app/api/waitlist/route.ts` (App Router route handlers are unit-testable by passing a mock `Request`).

## Fixtures and Factories

**Test Data:** None.

**Location:** N/A.

## Coverage

**Requirements:** None enforced. No coverage tool (`nyc`, `codelcov`, `vitest --coverage`) is configured.

**View Coverage:** Not available.

## Test Types

**Unit Tests:** None. The most testable units if added would be:
- `EMAIL_PATTERN` email validation (`frontend/app/api/waitlist/route.ts:5`)
- `escapeHtml()` sanitization (`frontend/app/api/waitlist/route.ts:7`)
- `getFriendlyError()` mapping (`frontend/app/page.tsx:59`)
- The `POST` route handler logic in `frontend/app/api/waitlist/route.ts` (input validation, duplicate handling, error paths)

**Integration Tests:** None.

**E2E Tests:** None. No Playwright / Cypress / browser-testing tooling.

## Common Patterns

**Async Testing:** N/A.

**Error Testing:** N/A.

## Gaps / Recommendations

The codebase currently has **zero automated tests**. Given the existing code, the highest-value first tests would be:

1. **Route handler unit tests** for `frontend/app/api/waitlist/route.ts` — cover: malformed JSON (400), missing email (400), invalid email pattern (400), Supabase config failure (503), duplicate email `23505` (success), and DB insert success. Mock the lazy `getSupabase()` / `getResend()` singletons.
2. **Unit tests for `escapeHtml()`** at `frontend/app/api/waitlist/route.ts:7` — verify injection characters are neutralized.
3. **Client validation tests** for `getFriendlyError()` at `frontend/app/page.tsx:59` and the inline email regex at `frontend/app/page.tsx:84`.

To enable testing, add a runner (Vitest is the lightest fit for Next App Router TS) and wire `pnpm test` in `frontend/package.json`. No coverage thresholds are currently set.

---

*Testing analysis: 2026-07-08*
