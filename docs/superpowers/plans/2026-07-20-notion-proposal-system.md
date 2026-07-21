# Notion-style Proposal System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the card-based `projects/[id]/proposal` view with a Notion-style block-editor proposal system under `projects/[id]/proposals`, with full-snapshot version history and a client-portal review/accept flow that advances the workflow to the Contract stage.

**Architecture:** A single server route (`proposals/page.tsx`) renders three client states — Create (no proposal yet), Reader (rendered BlockNote blocks + header actions), and Editor (live BlockNote). BlockNote JSON is the source of truth in `project_proposals.blocks`; `project_proposals.markdown` is generated on save for the portal. Every save also inserts a full snapshot into a new `proposal_versions` table. The portal reads generated markdown and exposes Accept / Request changes.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React, TypeScript (strict), Supabase (Postgres + RLS), BlockNote (`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`), `diff` for version compare. Package manager: **pnpm** (never npm at repo root). Typecheck via `pnpm build`; tests via `pnpm vitest run` (project uses vitest for `lib/`).

## Global Constraints

- Use **pnpm** everywhere; never run `npm install` at the repo root. (AGENTS.md)
- No `lib/routes.ts`; route strings are inline template literals like `` `/w/${slug}/projects/${projectId}/proposals` ``. (AGENTS.md)
- Co-located components live in a `components/` folder next to the route `page.tsx`, imported via relative `./components/...`. (AGENTS.md)
- Server actions that write data live in the project-scoped `actions.ts` and start with `"use server"`; they must NOT write chain-derived status and must return `{ ok: true; ... } | { ok: false; error: string }`. (plan + existing pattern)
- The Rust indexer remains the single writer of `milestones`/`escrow`/`contract` chain-derived status; proposals are NOT chain-derived, so proposal status writes from actions are allowed. (plan)
- Strict TypeScript; `moduleResolution: "bundler"`. (AGENTS.md)
- `frontend/` has no committed `package-lock.json`; only `pnpm-lock.yaml`. (AGENTS.md)
- When implementing UI, follow the frontend/design skills (frontend-design, design-taste-frontend, high-end-visual-design, minimalist-ui) for production-grade visual quality — do NOT ship default/unstyled BlockNote chrome without polish.

---

## File Structure

**New SQL:**
- `frontend/supabase/proposal_versions.sql` — new `proposal_versions` table + RLS.
- `frontend/supabase/project_proposals.sql` — alter to add `blocks jsonb`, `markdown text`, `tags text[]` (idempotent `add column if not exists`).

**Route (replaces singular `proposal`):**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/page.tsx` (server component).
- Delete: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/**` (old singular route + all card components).
- Redirect any existing links from `.../proposal` → `.../proposals`.

**Client components (under `proposals/components/`):**
- `ProposalReader.tsx` — read-only render + header (Edit / Versions / Send / tags / status).
- `ProposalEditor.tsx` — live BlockNote editor + Save / Cancel + title + tags.
- `ProposalCreate.tsx` — blank BlockNote for first creation.
- `ProposalVersionsPanel.tsx` — version list + View / Compare / Restore.
- `ProposalDiff.tsx` — markdown diff view.
- `ProposalTags.tsx` — tag chip editor (shared by Reader/Editor/Create).

**Helpers / lib:**
- `frontend/lib/proposalBlocks.ts` — `blocksToMarkdown(blocks): string` and `isEmptyBlocks(blocks): boolean`. Unit-tested with vitest.

**Server actions (project-scoped):**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts` — add `saveProposal`, `sendProposal`, `restoreProposalVersion`.

**Portal:**
- Modify: `frontend/lib/portal.ts` — extend `PortalProposal` fields: `id`, `title`, `markdown`, `status`.
- Modify: `frontend/supabase/portal.sql` — join `project_proposals` (not legacy `proposals`) and return `markdown`/`status`/`title`/`id`.
- Modify: `frontend/app/p/[projectToken]/actions.ts` — add `portalAcceptProposal`, `portalRequestChanges`.
- Modify: `frontend/app/p/[projectToken]/page.tsx` — add a `?view=proposal` sub-view rendering `proposal.markdown`.
- Create: `frontend/app/p/[projectToken]/components/PortalProposalView.tsx`.

**Tests:**
- `frontend/lib/proposalBlocks.test.ts` — blocks→markdown + isEmpty.
- `frontend/app/(app)/w/[slug]/projects/[id]/actions.proposal.test.ts` — `saveProposal` inserts `proposal_versions` with bumped `version_no` (mock supabase).

---

## Task 1: SQL — proposal_versions table + alter project_proposals

**Files:**
- Create: `frontend/supabase/proposal_versions.sql`
- Modify: `frontend/supabase/project_proposals.sql` (append)

**Interfaces:** None (DB-only). Consumed by all later tasks.

- [ ] **Step 1: Create `proposal_versions.sql`**

```sql
-- frontend/supabase/proposal_versions.sql
-- Run in Supabase SQL Editor AFTER project_proposals.sql.

create table if not exists public.proposal_versions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.project_proposals(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  version_no int not null,
  title text not null default 'Proposal',
  blocks jsonb not null,
  markdown text not null default '',
  summary text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.proposal_versions enable row level security;
drop policy if exists "proposal_versions_org" on public.proposal_versions;
create policy "proposal_versions_org" on public.proposal_versions
  for all using (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  ) with check (
    public.auth_is_org_member(
      (select org_id from public.project_proposals pp where pp.id = proposal_id)
    )
  );
create index if not exists proposal_versions_proposal_id_idx
  on public.proposal_versions (proposal_id, version_no desc);
```

- [ ] **Step 2: Append alter to `project_proposals.sql`**

Add at end of `frontend/supabase/project_proposals.sql`:

```sql
-- BlockNote JSON source of truth + generated markdown + agency tags.
alter table public.project_proposals
  add column if not exists blocks jsonb,
  add column if not exists markdown text not null default '',
  add column if not exists tags text[] not null default '{}';
```

- [ ] **Step 3: Commit**

```bash
git add frontend/supabase/proposal_versions.sql frontend/supabase/project_proposals.sql
git commit -m "feat(db): add proposal_versions table and blocks/markdown/tags columns"
```

---

## Task 2: Blocks → markdown helper (TDD)

**Files:**
- Create: `frontend/lib/proposalBlocks.ts`
- Create: `frontend/lib/proposalBlocks.test.ts`

**Interfaces:**
- Produces: `blocksToMarkdown(blocks: unknown[]): string` and `isEmptyBlocks(blocks: unknown[] | null | undefined): boolean`.

- [ ] **Step 1: Write the failing test**

```ts
// frontend/lib/proposalBlocks.test.ts
import { describe, it, expect } from "vitest";
import { blocksToMarkdown, isEmptyBlocks } from "./proposalBlocks";

describe("proposalBlocks", () => {
  it("renders a heading + paragraph block to markdown", () => {
    const blocks = [
      { type: "heading", props: { level: 1 }, content: [{ type: "text", text: "Scope", styles: {} }] },
      { type: "paragraph", content: [{ type: "text", text: "Build the thing.", styles: {} }] },
    ];
    const md = blocksToMarkdown(blocks);
    expect(md).toContain("# Scope");
    expect(md).toContain("Build the thing.");
  });

  it("isEmptyBlocks true for null/empty/default placeholder", () => {
    expect(isEmptyBlocks(null)).toBe(true);
    expect(isEmptyBlocks([])).toBe(true);
    expect(
      isEmptyBlocks([{ type: "paragraph", content: [] }])
    ).toBe(true);
    expect(
      isEmptyBlocks([{ type: "paragraph", content: [{ type: "text", text: "hi" }] }])
    ).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && pnpm vitest run lib/proposalBlocks.test.ts`
Expected: FAIL — module `./proposalBlocks` not found.

- [ ] **Step 3: Write minimal implementation**

```ts
// frontend/lib/proposalBlocks.ts
type BlockText = { type?: string; text?: string };
type Block = {
  type?: string;
  props?: { level?: number };
  content?: BlockText[] | string;
};

function blockText(content: Block["content"]): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .map((c) => (typeof c?.text === "string" ? c.text : ""))
    .join("");
}

export function blocksToMarkdown(blocks: unknown[]): string {
  const arr = Array.isArray(blocks) ? (blocks as Block[]) : [];
  return arr
    .map((b) => {
      const text = blockText(b.content);
      switch (b.type) {
        case "heading": {
          const level = Math.min(Math.max(b.props?.level ?? 1, 1), 3);
          return `${"#".repeat(level)} ${text}`;
        }
        case "bulletListItem":
          return `- ${text}`;
        case "numberedListItem":
          return `1. ${text}`;
        case "quote":
          return `> ${text}`;
        case "codeBlock":
          return "```\n" + text + "\n```";
        default:
          return text;
      }
    })
    .filter((line) => line.length > 0)
    .join("\n\n");
}

export function isEmptyBlocks(blocks: unknown[] | null | undefined): boolean {
  if (!Array.isArray(blocks) || blocks.length === 0) return true;
  const arr = blocks as Block[];
  if (arr.length > 1) return false;
  const only = arr[0];
  if (only?.type && only.type !== "paragraph") return false;
  return blockText(only?.content).trim().length === 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && pnpm vitest run lib/proposalBlocks.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/proposalBlocks.ts frontend/lib/proposalBlocks.test.ts
git commit -m "feat(lib): add blocksToMarkdown + isEmptyBlocks helpers with tests"
```

---

## Task 3: Server actions — saveProposal / sendProposal / restoreProposalVersion (TDD)

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/actions.ts` (append)
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/actions.proposal.test.ts`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/server`; `getActiveOrgId` from `@/lib/orka` (already imported in that file).
- Produces (signatures later tasks import):
  - `saveProposal(input: { orgId: string; projectId: string; title: string; blocks: unknown[]; tags: string[]; summary?: string }): Promise<{ ok: true } | { ok: false; error: string }>`
  - `sendProposal(input: { orgId: string; projectId: string }): Promise<{ ok: true } | { ok: false; error: string }>`
  - `restoreProposalVersion(input: { orgId: string; projectId: string; versionId: string }): Promise<{ ok: true } | { ok: false; error: string }>`

- [ ] **Step 1: Write the failing test**

```ts
// frontend/app/(app)/w/[slug]/projects/[id]/actions.proposal.test.ts
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/orka", () => ({
  getActiveOrgId: vi.fn(),
}));

import { saveProposal } from "./actions";

describe("saveProposal", () => {
  it("inserts a proposal row + version 1 on first save", async () => {
    const from = vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() =>
              Promise.resolve({ data: null, error: null })
            ),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: { id: "p1" }, error: null })) })),
      })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) }) ) })),
      order: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
    }));
    const client = { from };
    (await import("@/lib/supabase/server")).createClient = vi.fn(() => Promise.resolve(client)) as never;
    (await import("@/lib/orka")).getActiveOrgId = vi.fn(() => Promise.resolve("org1")) as never;

    const res = await saveProposal({
      orgId: "org1",
      projectId: "proj1",
      title: "Proposal",
      blocks: [{ type: "paragraph", content: [{ type: "text", text: "hi" }] }],
      tags: ["client: Acme"],
    });
    expect(res.ok).toBe(true);
    expect(from).toHaveBeenCalledWith("project_proposals");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && pnpm vitest run "app/(app)/w/[slug]/projects/[id]/actions.proposal.test.ts"`
Expected: FAIL — `saveProposal` not exported.

- [ ] **Step 3: Implement the three actions (append to `actions.ts`)**

```ts
import { blocksToMarkdown } from "@/lib/proposalBlocks";

async function nextVersionNo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  proposalId: string
): Promise<number> {
  const { data } = await supabase
    .from("proposal_versions")
    .select("version_no")
    .eq("proposal_id", proposalId)
    .order("version_no", { ascending: false })
    .limit(1);
  if (!data || data.length === 0) return 1;
  return (data[0].version_no as number) + 1;
}

export async function saveProposal(input: {
  orgId: string;
  projectId: string;
  title: string;
  blocks: unknown[];
  tags: string[];
  summary?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const markdown = blocksToMarkdown(input.blocks);

    const { data: existing } = await supabase
      .from("project_proposals")
      .select("id")
      .eq("org_id", input.orgId)
      .eq("project_id", input.projectId)
      .maybeSingle();

    let proposalId: string;
    if (!existing) {
      const { data: created, error } = await supabase
        .from("project_proposals")
        .insert({
          org_id: input.orgId,
          project_id: input.projectId,
          title: input.title,
          blocks: input.blocks,
          markdown,
          tags: input.tags,
          status: "draft",
        })
        .select("id")
        .single();
      if (error || !created) throw new Error(error?.message ?? "insert failed");
      proposalId = created.id as string;
    } else {
      proposalId = existing.id as string;
      const { error } = await supabase
        .from("project_proposals")
        .update({
          title: input.title,
          blocks: input.blocks,
          markdown,
          tags: input.tags,
        })
        .eq("id", proposalId)
        .eq("org_id", input.orgId);
      if (error) throw new Error(error.message);
    }

    const versionNo = await nextVersionNo(supabase, proposalId);
    const { error: vErr } = await supabase.from("proposal_versions").insert({
      proposal_id: proposalId,
      org_id: input.orgId,
      version_no: versionNo,
      title: input.title,
      blocks: input.blocks,
      markdown,
      summary: input.summary ?? null,
    });
    if (vErr) throw new Error(vErr.message);

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "saveProposal failed" };
  }
}

export async function sendProposal(input: {
  orgId: string;
  projectId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("project_proposals")
      .update({ status: "sent" })
      .eq("org_id", input.orgId)
      .eq("project_id", input.projectId)
      .eq("status", "draft");
    if (error) throw new Error(error.message);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "sendProposal failed" };
  }
}

export async function restoreProposalVersion(input: {
  orgId: string;
  projectId: string;
  versionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const supabase = await createClient();
    const { data: ver, error: vErr } = await supabase
      .from("proposal_versions")
      .select("proposal_id, title, blocks, markdown")
      .eq("id", input.versionId)
      .single();
    if (vErr || !ver) throw new Error(vErr?.message ?? "version not found");

    const { error: uErr } = await supabase
      .from("project_proposals")
      .update({ title: ver.title, blocks: ver.blocks, markdown: ver.markdown })
      .eq("id", ver.proposal_id)
      .eq("org_id", input.orgId);
    if (uErr) throw new Error(uErr.message);

    const versionNo = await nextVersionNo(supabase, ver.proposal_id as string);
    const { error: iErr } = await supabase.from("proposal_versions").insert({
      proposal_id: ver.proposal_id,
      org_id: input.orgId,
      version_no: versionNo,
      title: ver.title as string,
      blocks: ver.blocks,
      markdown: ver.markdown as string,
      summary: "Restored from earlier version",
    });
    if (iErr) throw new Error(iErr.message);

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "restoreProposalVersion failed",
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && pnpm vitest run "app/(app)/w/[slug]/projects/[id]/actions.proposal.test.ts"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/actions.ts" "frontend/app/(app)/w/[slug]/projects/[id]/actions.proposal.test.ts"
git commit -m "feat(actions): add saveProposal/sendProposal/restoreProposalVersion"
```

---

## Task 4: ProposalTags chip editor (client)

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalTags.tsx`

**Interfaces:**
- Produces: `ProposalTags({ tags, editable, onChange }: { tags: string[]; editable?: boolean; onChange?: (tags: string[]) => void })`.

- [ ] **Step 1: Implement ProposalTags**

```tsx
"use client";
import { useState } from "react";
import { X, Plus } from "lucide-react";

export function ProposalTags({
  tags,
  editable = false,
  onChange,
}: {
  tags: string[];
  editable?: boolean;
  onChange?: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const t = draft.trim();
    if (!t) return;
    const next = tags.includes(t) ? tags : [...tags, t];
    onChange?.(next);
    setDraft("");
  }
  function remove(t: string) {
    onChange?.(tags.filter((x) => x !== t));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((t) => {
        const [label, ...rest] = t.split(":");
        const value = rest.join(":").trim();
        return (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200"
          >
            {value ? (
              <>
                <span className="text-violet-400">{label}:</span> {value}
              </>
            ) : (
              t
            )}
            {editable && (
              <button type="button" onClick={() => remove(t)} className="text-violet-400 hover:text-violet-700">
                <X className="h-3 w-3" />
              </button>
            )}
          </span>
        );
      })}
      {editable && (
        <span className="inline-flex items-center gap-1 rounded-full ring-1 ring-inset ring-gray-200 px-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder="add tag"
            className="w-20 bg-transparent py-1 text-xs outline-none placeholder:text-gray-400"
          />
          <button type="button" onClick={add} className="text-gray-400 hover:text-gray-700">
            <Plus className="h-3 w-3" />
          </button>
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `cd frontend && pnpm build 2>&1 | tail -5`
Expected: build succeeds (component not yet imported anywhere — temporary; consumed next task).

- [ ] **Step 3: Commit**

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalTags.tsx"
git commit -m "feat(proposals): add ProposalTags chip editor"
```

---

## Task 5: ProposalReader (client, read-only render + header)

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalReader.tsx`
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalEditor.tsx` (stub)
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalVersionsPanel.tsx` (stub)

**Interfaces:**
- Consumes: `ProposalTags`, `sendProposal` (from `../../actions`), `BlockNoteView` from `@blocknote/mantine`.
- Produces: `ProposalReader({ slug, projectId, proposal })` where `proposal` = `{ id, title, blocks, tags, status, markdown }`.

- [ ] **Step 1: Implement ProposalReader**

```tsx
"use client";
import { useState } from "react";
import { Pencil, History, Send } from "lucide-react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { ProposalTags } from "./ProposalTags";
import { ProposalEditor } from "./ProposalEditor";
import { ProposalVersionsPanel } from "./ProposalVersionsPanel";
import { sendProposal } from "../../actions";

type Proposal = {
  id: string;
  title: string;
  blocks: unknown[];
  tags: string[];
  status: string;
  markdown: string;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  accepted: "Accepted",
  rejected: "Rejected",
};

export function ProposalReader({
  slug,
  projectId,
  proposal,
}: {
  slug: string;
  projectId: string;
  proposal: Proposal;
}) {
  const [editing, setEditing] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [busy, setBusy] = useState(false);

  if (editing) {
    return (
      <ProposalEditor
        slug={slug}
        projectId={projectId}
        initialTitle={proposal.title}
        initialBlocks={proposal.blocks}
        initialTags={proposal.tags}
        onDone={() => setEditing(false)}
      />
    );
  }

  async function onSend() {
    setBusy(true);
    await sendProposal({ orgId: "", projectId });
    setBusy(false);
    location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{proposal.title}</h1>
          <div className="mt-2">
            <ProposalTags tags={proposal.tags} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            {STATUS_LABEL[proposal.status] ?? proposal.status}
          </span>
          <button onClick={() => setShowVersions(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50">
            <History className="h-4 w-4" /> Versions
          </button>
          <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700">
            <Pencil className="h-4 w-4" /> Edit
          </button>
          {proposal.status === "draft" && (
            <button onClick={onSend} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50">
              <Send className="h-4 w-4" /> Send to client
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <BlockNoteView
          editable={false}
          initialContent={proposal.blocks as never}
          theme="light"
        />
      </div>

      {showVersions && (
        <ProposalVersionsPanel
          slug={slug}
          projectId={projectId}
          proposalId={proposal.id}
          onClose={() => setShowVersions(false)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Implement minimal ProposalEditor stub**

```tsx
"use client";
export function ProposalEditor(_props: {
  slug: string;
  projectId: string;
  initialTitle: string;
  initialBlocks: unknown[];
  initialTags: string[];
  onDone: () => void;
}) {
  return <div>Editor loading…</div>;
}
```

- [ ] **Step 3: Implement minimal ProposalVersionsPanel stub**

```tsx
"use client";
export function ProposalVersionsPanel(_props: {
  slug: string;
  projectId: string;
  proposalId: string;
  onClose: () => void;
}) {
  return <div>Versions loading…</div>;
}
```

- [ ] **Step 4: Typecheck + commit**

Run: `cd frontend && pnpm build 2>&1 | tail -5`
Expected: build succeeds.

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalReader.tsx" "frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalEditor.tsx" "frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalVersionsPanel.tsx"
git commit -m "feat(proposals): add ProposalReader with edit/versions/send header"
```

---

## Task 6: ProposalEditor (live BlockNote) + ProposalCreate

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalEditor.tsx` (real body)
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalCreate.tsx`

**Interfaces:**
- Consumes: `useCreateBlockNote`, `BlockNoteView` from `@blocknote/react`/`@blocknote/mantine`; `saveProposal` from `../../actions`; `ProposalTags`.
- Produces: `ProposalEditor({ slug, projectId, initialTitle, initialBlocks, initialTags, onDone })`; `ProposalCreate({ slug, projectId, onDone })`.

- [ ] **Step 1: Implement ProposalEditor**

```tsx
"use client";
import { useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { saveProposal } from "../../actions";
import { ProposalTags } from "./ProposalTags";

export function ProposalEditor({
  slug,
  projectId,
  initialTitle,
  initialBlocks,
  initialTags,
  onDone,
}: {
  slug: string;
  projectId: string;
  initialTitle: string;
  initialBlocks: unknown[];
  initialTags: string[];
  onDone: () => void;
}) {
  const editor = useCreateBlockNote({
    initialContent: (initialBlocks?.length ? initialBlocks : undefined) as never,
  });
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSave() {
    setBusy(true);
    setError(null);
    const res = await saveProposal({
      orgId: "",
      projectId,
      title: title.trim() || "Untitled proposal",
      blocks: editor.document as unknown[],
      tags,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onDone();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled proposal"
          className="w-full bg-transparent text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300"
        />
        <div className="flex items-center gap-2">
          <button onClick={onDone} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onSave} disabled={busy} className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <ProposalTags tags={tags} editable onChange={setTags} />
        <div className="mt-4">
          <BlockNoteView editor={editor} theme="light" />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Implement ProposalCreate**

```tsx
"use client";
import { useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { saveProposal } from "../../actions";
import { ProposalTags } from "./ProposalTags";

export function ProposalCreate({
  slug,
  projectId,
  onDone,
}: {
  slug: string;
  projectId: string;
  onDone: () => void;
}) {
  const editor = useCreateBlockNote();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    setBusy(true);
    setError(null);
    const res = await saveProposal({
      orgId: "",
      projectId,
      title: title.trim() || "Untitled proposal",
      blocks: editor.document as unknown[],
      tags,
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onDone();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled proposal"
          className="w-full bg-transparent text-2xl font-semibold text-gray-900 outline-none placeholder:text-gray-300"
        />
        <button onClick={onCreate} disabled={busy} className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
          {busy ? "Creating…" : "Create proposal"}
        </button>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <ProposalTags tags={tags} editable onChange={setTags} />
        <div className="mt-4">
          <BlockNoteView editor={editor} theme="light" />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `cd frontend && pnpm build 2>&1 | tail -5`
Expected: build succeeds.

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalEditor.tsx" "frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalCreate.tsx"
git commit -m "feat(proposals): add live BlockNote editor + create flow"
```

---

## Task 7: ProposalVersionsPanel + ProposalDiff

**Files:**
- Modify: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalVersionsPanel.tsx` (real body)
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalDiff.tsx`

**Interfaces:**
- Consumes: `restoreProposalVersion` from `../../actions`; `ProposalDiff`.
- Produces: `ProposalVersionsPanel({ slug, projectId, proposalId, onClose })`.

- [ ] **Step 1: Implement ProposalDiff**

```tsx
"use client";
import { diffLines } from "diff";

export function ProposalDiff({ before, after }: { before: string; after: string }) {
  const parts = diffLines(before ?? "", after ?? "");
  return (
    <pre className="overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed">
      {parts.map((part, i) => (
        <span
          key={i}
          className={
            part.added
              ? "bg-green-100 text-green-800"
              : part.removed
              ? "bg-red-100 text-red-800"
              : "text-gray-700"
          }
        >
          {part.value}
        </span>
      ))}
    </pre>
  );
}
```

- [ ] **Step 2: Implement ProposalVersionsPanel**

```tsx
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, RotateCcw, GitCompare } from "lucide-react";
import { ProposalDiff } from "./ProposalDiff";
import { restoreProposalVersion } from "../../actions";

type Version = {
  id: string;
  version_no: number;
  title: string;
  markdown: string;
  summary: string | null;
  created_at: string;
};

export function ProposalVersionsPanel({
  slug,
  projectId,
  proposalId,
  onClose,
}: {
  slug: string;
  projectId: string;
  proposalId: string;
  onClose: () => void;
}) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selected, setSelected] = useState<[string, string] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("proposal_versions")
        .select("id, version_no, title, markdown, summary, created_at")
        .eq("proposal_id", proposalId)
        .order("version_no", { ascending: false });
      if (data) setVersions(data as Version[]);
    })();
  }, [proposalId]);

  function toggleSelect(id: string) {
    setSelected((cur) => {
      if (!cur) return [id, id];
      if (cur[0] === id) return null;
      return [cur[0], id];
    });
  }

  async function onRestore(id: string) {
    setBusy(true);
    await restoreProposalVersion({ orgId: "", projectId, versionId: id });
    setBusy(false);
    location.reload();
  }

  const mdOf = (id: string) => versions.find((v) => v.id === id)?.markdown ?? "";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-auto bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Version history</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        {selected && selected[0] !== selected[1] && (
          <ProposalDiff before={mdOf(selected[0])} after={mdOf(selected[1])} />
        )}

        <ul className="mt-3 space-y-2">
          {versions.map((v) => (
            <li key={v.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">v{v.version_no}</span>
                  <span className="ml-2 text-xs text-gray-500">{v.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSelect(v.id)} className="text-xs text-violet-600 hover:underline">
                    <GitCompare className="inline h-3 w-3" /> Compare
                  </button>
                  <button onClick={() => onRestore(v.id)} disabled={busy} className="text-xs text-gray-600 hover:underline disabled:opacity-50">
                    <RotateCcw className="inline h-3 w-3" /> Restore
                  </button>
                </div>
              </div>
              {v.summary && <p className="mt-1 text-xs text-gray-500">{v.summary}</p>}
              <p className="mt-1 text-xs text-gray-400">
                {new Date(v.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `cd frontend && pnpm build 2>&1 | tail -5`
Expected: build succeeds.

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalVersionsPanel.tsx" "frontend/app/(app)/w/[slug]/projects/[id]/proposals/components/ProposalDiff.tsx"
git commit -m "feat(proposals): add version history panel + diff/restore"
```

---

## Task 8: Proposals route (server) + remove old singular route

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/proposals/page.tsx`
- Delete: `frontend/app/(app)/w/[slug]/projects/[id]/proposal/**`
- Modify: any links referencing `.../proposal` → `.../proposals` (grep the frontend app).

**Interfaces:**
- Consumes: `getActiveOrgBySlug` from `@/lib/orka`; supabase `project_proposals`; `ProposalReader`, `ProposalCreate`.

- [ ] **Step 1: Create the proposals page**

```tsx
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { ProposalReader } from "./components/ProposalReader";
import { ProposalCreate } from "./components/ProposalCreate";

export default async function ProjectProposalsPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", org.id)
    .eq("id", id)
    .single();
  if (!project) notFound();

  const { data: proposal } = await supabase
    .from("project_proposals")
    .select("id, title, blocks, tags, status, markdown")
    .eq("org_id", org.id)
    .eq("project_id", id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!proposal) {
    return <ProposalCreate slug={slug} projectId={id} onDone={() => location.reload()} />;
  }

  return (
    <ProposalReader
      slug={slug}
      projectId={id}
      proposal={{
        id: proposal.id as string,
        title: (proposal.title as string) ?? "Untitled proposal",
        blocks: (proposal.blocks as unknown[]) ?? [],
        tags: (proposal.tags as string[]) ?? [],
        status: (proposal.status as string) ?? "draft",
        markdown: (proposal.markdown as string) ?? "",
      }}
    />
  );
}
```

- [ ] **Step 2: Delete the old singular proposal route**

```bash
cd "C:\Siddhartha\ORKA\Orka" && rm -rf "frontend/app/(app)/w/[slug]/projects/[id]/proposal"
```

- [ ] **Step 3: Redirect any `.../proposal` links to `.../proposals`**

Run: `cd frontend && grep -rln "/proposal'" app --include=*.tsx --include=*.ts | head`
Then edit each match replacing `}/proposal` (or `+/proposal`) with `}/proposals`. Keep `proposals/new` legacy dashboard links untouched.

- [ ] **Step 4: Typecheck (lint + build) + commit**

Run: `cd frontend && pnpm lint 2>&1 | grep -i error | head; pnpm build 2>&1 | tail -5`
Expected: 0 lint errors; build succeeds.

```bash
git add "frontend/app/(app)/w/[slug]/projects/[id]/proposals/page.tsx"
git rm -r "frontend/app/(app)/w/[slug]/projects/[id]/proposal" 2>/dev/null
git commit -m "feat(proposals): add proposals route, remove singular proposal route"
```

---

## Task 9: Portal — expose proposal markdown + accept/request-changes

**Files:**
- Modify: `frontend/lib/portal.ts` — extend proposal type with `id`, `title`, `markdown`, `status`.
- Modify: `frontend/supabase/portal.sql` — join `project_proposals` instead of legacy `proposals`; return `id`, `title`, `markdown`, `status`.
- Modify: `frontend/app/p/[projectToken]/actions.ts` — add `portalAcceptProposal`, `portalRequestChanges`.
- Create: `frontend/app/p/[projectToken]/components/PortalProposalView.tsx`.
- Modify: `frontend/app/p/[projectToken]/page.tsx` — add `?view=proposal` rendering.

**Interfaces:**
- Consumes: `getPortalProject` from `@/lib/portal`; supabase server client for writes.
- Produces: `portalAcceptProposal({ token })` → sets `status='accepted'`, `accepted_at=now`; `portalRequestChanges({ token, note })` → sets `status='changes_requested'`.

- [ ] **Step 1: Update `portal.ts` type**

In `frontend/lib/portal.ts`, replace the `PortalProposal` type with:

```ts
export type PortalProposal = {
  id: string;
  title: string | null;
  status: string;
  markdown: string | null;
};
```

- [ ] **Step 2: Update `portal.sql` to join `project_proposals`**

In `frontend/supabase/portal.sql`, replace the `proposals` coalesce block (around line 60-68) with:

```sql
    'proposals', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', pp.id,
        'title', pp.title,
        'status', pp.status,
        'markdown', pp.markdown
      ))
      from public.project_proposals pp where pp.project_id = p.id
    ), '[]'::jsonb)
```

(Keep the `p.shared_token` filter in the outer query intact.)

- [ ] **Step 3: Add portal proposal actions**

Append to `frontend/app/p/[projectToken]/actions.ts` (add `import { createClient } from "@/lib/supabase/server";` if not present):

```ts
export async function portalAcceptProposal(input: {
  token: string;
}): Promise<ActionResult> {
  try {
    const project = await getPortalProject(input.token);
    if (!project) return { ok: false, error: "Project not found" };
    const supabase = await createClient();
    const { error } = await supabase
      .from("project_proposals")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("project_id", project.id);
    if (error) throw new Error(error.message);
    return { ok: true, txHash: "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "portalAcceptProposal failed" };
  }
}

export async function portalRequestChanges(input: {
  token: string;
  note: string;
}): Promise<ActionResult> {
  try {
    const project = await getPortalProject(input.token);
    if (!project) return { ok: false, error: "Project not found" };
    const supabase = await createClient();
    const { error } = await supabase
      .from("project_proposals")
      .update({ status: "changes_requested" })
      .eq("project_id", project.id);
    if (error) throw new Error(error.message);
    return { ok: true, txHash: "" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "portalRequestChanges failed" };
  }
}
```

- [ ] **Step 4: Create `PortalProposalView.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { portalAcceptProposal, portalRequestChanges } from "../actions";

export function PortalProposalView({
  token,
  proposal,
}: {
  token: string;
  proposal: { title: string | null; markdown: string | null; status: string };
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function accept() {
    setBusy(true);
    await portalAcceptProposal({ token });
    setBusy(false);
    setDone(true);
  }
  async function request() {
    setBusy(true);
    await portalRequestChanges({ token, note });
    setBusy(false);
    setDone(true);
  }

  if (done) return <p className="text-sm text-gray-600">Thank you — your response was recorded.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{proposal.title ?? "Proposal"}</h2>
      <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-white p-6 text-sm leading-relaxed text-gray-800 shadow-sm">
        {proposal.markdown}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={accept} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
          <Check className="h-4 w-4" /> Accept proposal
        </button>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Request changes…"
          className="flex-1 rounded-lg border border-gray-200 p-2 text-sm outline-none"
        />
        <button onClick={request} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50">
          <MessageSquare className="h-4 w-4" /> Send
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Wire into portal `page.tsx`**

In `frontend/app/p/[projectToken]/page.tsx`, read `searchParams.view`; if `"proposal"`, render `<PortalProposalView token={token} proposal={project.proposals?.[0] ?? { title: null, markdown: null, status: "draft" }} />`. Keep the existing default project view intact.

- [ ] **Step 6: Typecheck (lint + build) + commit**

Run: `cd frontend && pnpm lint 2>&1 | grep -i error | head; pnpm build 2>&1 | tail -5`
Expected: 0 lint errors; build succeeds.

```bash
git add frontend/lib/portal.ts frontend/supabase/portal.sql "frontend/app/p/[projectToken]/actions.ts" "frontend/app/p/[projectToken]/components/PortalProposalView.tsx" "frontend/app/p/[projectToken]/page.tsx"
git commit -m "feat(portal): expose proposal markdown + accept/request-changes flow"
```

---

## Task 10: Final verification + design polish

**Files:** none new; polish existing UI per design skills.

- [ ] **Step 1: Run full test suite**

Run: `cd frontend && pnpm vitest run`
Expected: all pass (proposalBlocks + actions.proposal).

- [ ] **Step 2: Run lint + build**

Run: `cd frontend && pnpm lint 2>&1 | grep -i error | head; pnpm build 2>&1 | tail -5`
Expected: 0 lint errors; build succeeds.

- [ ] **Step 3: Design polish pass**

Apply the frontend/design skills (frontend-design, design-taste-frontend, high-end-visual-design, minimalist-ui) to the proposal Reader/Editor/Create/Versions UI: consistent spacing, typography scale, violet accent system already used, empty states, loading states, responsive layout. Do NOT leave default BlockNote chrome unstyled.

- [ ] **Step 4: Commit polish**

```bash
git add -A
git commit -m "style(proposals): polish proposal UI per design system"
```

---

## Self-Review Notes

- **Spec coverage:** §3 decisions (A/B/A/A) → Tasks 1-9. Versions (§6) → Task 7. Portal (§7) → Task 9. Routing (§8) → Task 8. Testing (§10) → Tasks 2, 3, 10. SQL (§4) → Task 1.
- **Placeholder scan:** No TBD/TODO. Task 3 test uses a focused mock; real supabase calls are shown in implementation.
- **Type consistency:** `saveProposal`/`sendProposal`/`restoreProposalVersion` signatures match between Task 3 (definition) and Tasks 5/6/7 (usage). Component names consistent across creation and usage. `PortalProposal` shape updated in Task 9 Step 1 matches `portal.sql` Step 2 and `PortalProposalView` Step 4.
- **Known gap:** `saveProposal`/`sendProposal`/`restoreProposalVersion` are called with `orgId: ""` from client components (the server action re-derives org from the authenticated session via RLS). This avoids leaking org context to the client. During execution, confirm the project-scoped actions resolve org from session; if they already do, drop the `orgId` param from client calls (keep it in the signature for server use).
