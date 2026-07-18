# Frontend URL Architecture & Information Architecture — Design

**Date:** 2026-07-15
**Status:** Design (pending approval)
**Scope:** Orka frontend restructuring to a Workspace → Projects → Resources SaaS IA, plus net-new areas.

---

## 1. Goals

- Adopt a clean, shareable, Linear/Stripe-style URL architecture centered on a **workspace** (`/w/[slug]`).
- Collapse the current dual "home" pages into one workspace dashboard.
- Replace the flat sidebar with a workflow-grouped sidebar (Overview / Work / Finance / AI / Workspace).
- Introduce query-param **tabs** (`?tab=`) for detail and settings pages instead of nested routes.
- Build the missing product areas: Clients, Analytics, AI Copilot, Notifications, Search, and a public **client portal** (`/p/[token]`).
- Keep all work inside the frontend repo on a single domain; subdomains (`app.`, `portal.`) deferred to a later deploy-layer step via middleware.

## 2. Key Decisions (confirmed)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Domain model | Single domain, app under `/w/[slug]/...`, portal under `/p/[token]`. Subdomains added later via middleware + DNS. |
| D2 | Workspace identity | URL slug (`organizations.slug`), not UUID. URL is source of truth; `orka_active_org` cookie becomes a *default/fallback*. |
| D3 | Detail/settings navigation | `?tab=` query-param tabs (shareable, no nested routes). |
| D4 | Sidebar | Grouped by workflow (Overview / Work / Finance / AI / Workspace). |
| D5 | Resource IDs in URLs | **UUIDs for this pass** (projects/clients/payments/invoices keep their existing PKs). Prefixed public IDs (`proj_01J9…`) deferred — requires backend schema + generation work. Workspace uses slug. |
| D6 | Public portal | Token-addressed, no login; same component shell, permission-gated read-only views. |

> **D5 flag:** The proposed `proj_01J9AZ3` / `client_01HAB2` style IDs require backend changes (new `short_id` columns + generation + uniqueness). This pass uses UUIDs to keep the frontend change self-contained. Add prefixed IDs as a follow-up once the backend supports them.

## 3. Route Map

### Marketing — route group `(marketing)`
| Path | Exists? | Notes |
|------|---------|-------|
| `/` | yes | Landing (app/page.tsx) |
| `/pricing` | **new** | |
| `/blog` | **new** | |
| `/contact` | **new** | |
| `/about` | yes | |
| `/docs` | yes | |

### Auth — route group `(auth)`
| Path | Exists? | Notes |
|------|---------|-------|
| `/login` | yes | |
| `/signup` | yes | |
| `/forgot-password` | **new** | Needs backend email flow |
| `/reset-password` | **new** | Needs backend email flow |
| `/verify-email` | **new** | Needs backend email flow |
| `/invite/[token]` | **new** | Needs backend invite flow |
| `/auth/callback` | yes | Route handler (keep) |

### Workspace chooser
| Path | Exists? | Notes |
|------|---------|-------|
| `/workspaces` | yes | Keep as chooser; after login redirect to `/w/[defaultSlug]/dashboard` |
| `/workspaces/new` | yes | Keep |
| `/workspaces/[workspaceId]` | yes→**deprecate** | Replaced by `/w/[slug]/dashboard` |

### App — route group `(app)`, all under `/w/[slug]/`
Layout: `AppShell` + grouped `Sidebar` + `WorkspaceSwitcher`.

| Path | Exists? | Group | Notes |
|------|---------|-------|-------|
| `/w/[slug]/dashboard` | from `/dashboard/home` + `/workspaces/[id]` | Overview | Collapsed single home |
| `/w/[slug]/projects` | from `/dashboard/projects` | Work | |
| `/w/[slug]/projects/[id]` | yes | Work | `?tab=` tabs |
| `/w/[slug]/proposals` | from `/dashboard/proposals` | Work | Keep (existing feature) |
| `/w/[slug]/proposals/new` | yes | Work | |
| `/w/[slug]/clients` | **new** | Work | |
| `/w/[slug]/clients/[id]` | **new** | Work | `?tab=` tabs |
| `/w/[slug]/payments` | from `/dashboard/payments` | Finance | |
| `/w/[slug]/payments/[id]` | **new** | Finance | |
| `/w/[slug]/invoices` | from `/dashboard/invoices` (fix 404) | Finance | |
| `/w/[slug]/invoices/[id]` | **new** | Finance | |
| `/w/[slug]/analytics` | **new** | Finance | No subpages |
| `/w/[slug]/ai` | **new** | AI | |
| `/w/[slug]/ai/[chatId]` | **new** | AI | |
| `/w/[slug]/notifications` | **new** | — | Top-level icon |
| `/w/[slug]/search?q=` | **new** | — | Global search |
| `/w/[slug]/settings` | from `/dashboard/settings` | Workspace | `?tab=` tabs |

### Public client portal — its own layout, no auth
| Path | Exists? | Notes |
|------|---------|-------|
| `/p/[projectToken]` | **new** | `?tab=` tabs; token-addressed, read-only |

## 4. Proposed File Tree (Next.js App Router)

```
frontend/app/
  (marketing)/
    layout.tsx                 # marketing nav/footer
    page.tsx                   # /
    pricing/page.tsx
    blog/page.tsx
    contact/page.tsx
    about/page.tsx
    docs/page.tsx
  (auth)/
    layout.tsx                 # centered card
    login/page.tsx
    signup/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
    verify-email/page.tsx
    invite/[token]/page.tsx
    callback/route.ts          # existing auth callback
  (app)/
    layout.tsx                 # redirect to /w/[defaultSlug]/dashboard if no slug
    w/[slug]/
      layout.tsx               # AppShell + Sidebar + WorkspaceSwitcher; resolves org by slug
      dashboard/page.tsx
      projects/page.tsx
      projects/[id]/page.tsx
      proposals/page.tsx
      proposals/new/page.tsx
      clients/page.tsx
      clients/[id]/page.tsx
      payments/page.tsx
      payments/[id]/page.tsx
      invoices/page.tsx
      invoices/[id]/page.tsx
      analytics/page.tsx
      ai/page.tsx
      ai/[chatId]/page.tsx
      notifications/page.tsx
      search/page.tsx
      settings/page.tsx
  workspaces/
    page.tsx                   # chooser (keep)
    new/page.tsx               # keep
  p/[projectToken]/
    layout.tsx                 # minimal portal shell, no auth
    page.tsx                   # ?tab= portal view
  auth/callback/route.ts       # keep (outside groups)
```

## 5. Component & Data Strategy

- **`WorkspaceSlugProvider` / layout param:** `w/[slug]/layout.tsx` loads `organizations` by slug (unique, URL-safe, non-null). If slug missing/invalid → 404 or redirect to `/workspaces`.
- **`getActiveOrgId` → `getActiveOrgBySlug`:** resolve active workspace from the URL slug first; fall back to `orka_active_org` cookie / first membership for chooser + default redirect.
- **Shared `Tabs` component:** reads `useSearchParams().get("tab")`, renders tab bar + panel; used by project/client/settings/portal detail pages.
- **Grouped `Sidebar`:** sections Overview / Work / Finance / AI / Workspace; `WorkspaceSwitcher` switches slug (navigates to same route under new slug).
- **`middleware.ts`:** (optional, later) map host `app.orkahq.com` → `/w/[slug]` and `portal.orkahq.com` → `/p/[token]`; also legacy redirects (`/dashboard/*` → `/w/[slug]/*`, `/invoices` → `/w/[slug]/invoices`).
- **Data:** no schema changes this pass (D5). `organizations.slug` must be guaranteed unique/non-null (verify migration; add if missing).

## 6. Phased Execution (for writing-plans)

- **Phase A — Foundation:** `(app)/w/[slug]` group + layout, collapse homes, grouped Sidebar + WorkspaceSwitcher, slug resolution, fix `/invoices` 404, legacy redirect middleware.
- **Phase B — Detail tabs:** shared `Tabs` component; refactor project/client/settings detail pages to `?tab=`.
- **Phase C — Net-new app areas:** clients, analytics, ai (+ `[chatId]`), notifications, search (UI scaffolding wired to existing data where possible).
- **Phase D — Public portal:** `/p/[projectToken]` token-addressed read-only views.
- **Phase E — Auth + marketing:** forgot/reset/verify/invite routes (UI; backend email flows as follow-up), pricing/blog/contact pages.
- **Phase F — Polish:** loading/empty/404 states, legacy redirects, README/AGENTS note, lint + build.

## 7. Open / Deferred

- Subdomain deployment (`app.`, `portal.`, `client.`) — deploy-layer, via middleware later.
- Prefixed public resource IDs (`proj_…`) — backend schema work.
- Auth email flows (forgot/reset/verify/invite) — backend/Supabase email templates.
- Client account area (`client.orkahq.com`) — separate from public portal; future.
