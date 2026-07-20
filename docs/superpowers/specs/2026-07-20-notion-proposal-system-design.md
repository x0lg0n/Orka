# Notion-style Proposal System — Design Spec

**Date:** 2026-07-20
**Status:** Approved (design)
**Scope:** Replace the card-based `projects/[id]/proposal` view with a Notion-style, block-editor proposal system under `projects/[id]/proposals`, with version history and a client-portal review/accept flow.

---

## 1. Goals

- Agencies create and edit proposals as **Notion-style pages**: block-based editing, tags (client, project detail, etc.), beautiful rendered output.
- Markdown is the portable format: generated on save, consumed by the client portal.
- Full **version history** (snapshot per save) with view / compare / restore.
- Proposal lifecycle connects to the existing workflow state machine: `draft → sent → viewed → accepted → rejected`, where client **accept** advances the project to the **Contract** stage.
- Project-first model: a `projects` row must exist; proposals are children of a project (no schema change to `project_proposals.project_id NOT NULL`).

## 2. Non-goals

- No raw-markdown-text editing (source of truth is BlockNote JSON, not a markdown string).
- No git-style delta storage (full snapshots only).
- No client-side block editing in the portal (portal is read-only markdown + decision buttons).

## 3. Decisions (from brainstorming)

| Topic | Choice |
|-------|--------|
| Ordering | A — project first; proposal is a child of a project |
| Editor | B — true Notion-style block editor (BlockNote) |
| Storage | A — BlockNote JSON source of truth; markdown generated for portal |
| Versions | A — full snapshot per save |

## 4. Data model

Reuses `public.project_proposals` (already exists, keyed by `project_id`). Changes:

- `project_proposals.content` (text) → replaced/extended by **`blocks jsonb`** storing `PartialBlock[]` (BlockNote source of truth).
- **`project_proposals.markdown text`** (new) — generated markdown render, refreshed on every save; used by the portal.
- **`project_proposals.tags text[]`** (new) — agency tags, e.g. `client: Acme`, `type: fixed-price`.
- `status` unchanged: `draft | sent | viewed | accepted | rejected | expired | archived`.
- `accepted_at`, `title`, `summary` already present.

**New table `public.proposal_versions`** (full-snapshot versioning, Option A):

```
id uuid pk default gen_random_uuid()
proposal_id uuid not null references public.project_proposals(id) on delete cascade
org_id uuid not null references public.organizations(id) on delete cascade
version_no int not null
title text not null
blocks jsonb not null          -- full BlockNote snapshot
markdown text not null         -- full markdown snapshot
summary text                   -- optional "what changed" note
created_by uuid references auth.users(id)
created_at timestamptz not null default now()
```

Every save of the proposal:
1. writes `blocks` + `markdown` to `project_proposals`,
2. inserts a new `proposal_versions` row with `version_no = (max+1)`,
3. keeps `project_proposals` mirroring the latest version.

**SQL deliverables:**
- `frontend/supabase/proposal_versions.sql` — new table + RLS policy (`proposal_versions_org`, scoped via `proposal_id → project_proposals.org_id`).
- Alter `project_proposals` to add `blocks jsonb`, `markdown text`, `tags text[]` (migration appended to `project_proposals.sql`).

## 5. Editor & Reader (BlockNote)

**Library:** `@blocknote/core`, `@blocknote/react`, `@blocknote/mantine` (default styled UI). React + TS-native, serializes to `PartialBlock[]`.

**Single route, mode-driven** (`projects/[id]/proposals`):

1. **Create** (`ProposalCreate`, client) — when no `project_proposals` row exists: blank BlockNote page with an "Untitled proposal" title field and empty block. First **Save** inserts the row + version 1.
2. **Reader** (`ProposalReader`, client, non-editable BlockNoteView) — "main page shows current proposal": large H1 title, tag chips, status badge, top bar with **Edit**, **Versions**, **Send to client**.
3. **Edit** (`ProposalEditor`, client, live BlockNote) — mounted on **Edit** click, pre-loaded with current `blocks`. **Save** → `saveProposal` server action. **Cancel** → discards, back to reader.
4. **Tags** — chip editor in header; add/remove `client:`, `type:`, free tags; saved with the proposal.

**Markdown generation:** at save time convert `blocks` → markdown (BlockNote `getMarkdown` / serialization helper); store in `proposal.markdown`. Portal reads `markdown` only (no BlockNote bundle on public route).

## 6. Versions panel & diff

**Versions** button opens a side panel listing every `proposal_versions` snapshot: version_no, timestamp, author, optional summary. Actions:

- **View** — renders that version's `blocks` read-only.
- **Compare** — diffs two versions' `markdown` text (line/word diff) using `diff` (or `react-diff-viewer-continued`). Reliable because full snapshots need no reconstruction.
- **Restore** — copies a past snapshot's `blocks`/`markdown` into a new current save (new version; history preserved).

## 7. Client portal flow (send → review → accept/reject)

1. **Send to client** (agency) → `status = 'sent'`; ensures a `shared_token` exists so the client opens `/p/[token]/proposal`.
2. **Portal proposal view** (`/p/[token]/proposal`) — renders `proposal.markdown` read-only + **Accept** / **Request changes** / **Add comment**.
   - **Accept** → `status = 'accepted'`, `accepted_at = now` → advances workflow to **Contract** stage (`deriveWorkflowState` already gates on proposal acceptance).
   - **Request changes** → `status = 'changes_requested'` (soft) + note; agency edits and re-sends.
3. Portal is read-only for the client (no block editor).

## 8. Routing & files

- New: `app/(app)/w/[slug]/projects/[id]/proposals/page.tsx` (server) — loads current proposal + version list + tags; renders create/reader.
- Client components: `ProposalReader`, `ProposalEditor`, `ProposalCreate`, `ProposalVersionsPanel`, `ProposalDiff`.
- Server actions (project-scoped `actions.ts`, `"use server"`, no chain-status writes): `saveProposal`, `sendProposal`, `restoreProposalVersion`.
- Portal: `portal/actions.ts` → `portalAcceptProposal`, `portalRequestChanges`; `portal/page.tsx` adds `/proposal` sub-view rendering `proposal.markdown`.
- Deprecate/remove the old singular `projects/[id]/proposal` route and its card components (`ProposalDetailView` et al.); redirect links to `proposals`.
- SQL: `proposal_versions.sql` + `project_proposals.sql` alter.

## 9. Error handling

- BlockNote save failure → inline toast/error; no partial write.
- Invalid/missing project → `notFound()`.
- Versions panel handles empty + single-version states.
- Supabase errors in server actions return `{ ok: false; error }` (consistent with existing action pattern).

## 10. Testing

- Vitest: `blocks → markdown` serialization helper (round-trip sanity on known blocks).
- Vitest: `saveProposal` inserts `proposal_versions` with bumped `version_no` (mock supabase).
- Manual E2E: create → edit → save (v2) → compare v1/v2 → restore → send → portal accept → workflow advances to Contract.

## 11. Dependencies to add

- `@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`
- `diff` (or `react-diff-viewer-continued`) for version compare
- (markdown generation via BlockNote's built-in serializer — no separate md lib required)
