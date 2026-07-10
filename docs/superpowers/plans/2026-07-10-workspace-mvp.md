# ORKA Workspace MVP (Phase 1.4 + Phase 2, mocked chain) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A demoable workspace where an agency creates an org, creates a project with milestones, funds (mocked), the freelancer submits, the client approves/releases (mocked), disputes can be opened/resolved, and invoices are auto-generated — all on Next.js + Supabase, with the Stellar contract + Rust backend stubbed.

**Architecture:** Next.js App Router + React 19 + Supabase (`@supabase/ssr`). All mutations are **server actions** using the session server client (so RLS from `phase1_schema.sql` applies). "Chain actions" are simulated: a helper returns a fake `chain_tx` hash; the DB is updated and a `ledger_events` row is appended. No Stellar/Rust calls. Reuses the existing design system (`.display`, `shadow-hard`, `.cut-corner`, focus ring, error/banner patterns) and the existing `lib/supabase/{client,server}.ts` + `proxy.ts`.

**Tech Stack:** Next.js 16, React 19, `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, Tailwind v3, TypeScript.

## Global Constraints

- Exact Supabase clients already exist: `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (server, cookie-based). Reuse — do NOT recreate.
- All DB writes go through the **session server client** (`createClient()` from `lib/supabase/server`) inside server actions, so org-scoped RLS is enforced. The `phase1_schema.sql` tables + RLS already exist (orgs, organization_members, profiles, clients, freelancers, projects, milestones, invoices, ledger_events, disputes).
- "Mocked chain": no `fetch` to Stellar/RPC. A `fakeTx()` helper returns a random 64-hex string. Every lifecycle action appends a `ledger_events` row `{org_id, project_id, milestone_id, chain_tx, event_type, amount, asset:'USDC', status:'confirmed'}`.
- Design system verbatim: `bg-ink`, `paper`, `bone`, `lime`, `orange`, `violet`, `teal`, `shadow-hard`, `.display`, focus ring `focus:border-violet focus:ring-4 focus:ring-violet/20`. Cards: `rounded-[28px] bg-white text-ink shadow-hard`. Lucide icons only.
- Validation: email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; amounts are positive numbers.
- Actor model is simplified for the demo: **any org member** may perform client actions (fund/approve/release/refund/open_dispute) and freelancer actions (submit). Real per-role enforcement is a later slice. Document this in code comments + a banner on the board.
- New SQL must be **idempotent appends** to a new file `frontend/supabase/workspace_mvp.sql` (do NOT alter `phase1_schema.sql` beyond what is already there). The human runs BOTH `phase1_schema.sql` and `workspace_mvp.sql` in the Supabase SQL editor.
- Repo has no test runner; automated gates per task = `pnpm lint` + final `pnpm build` (tsc). 

---

## File Structure

- **Create** `frontend/supabase/workspace_mvp.sql` — `invitations` table + RLS + helper to get a member's orgs.
- **Create** `frontend/lib/orka.ts` — `fakeTx()`, `getActiveOrgId()` (returns user's first org or null), status constants.
- **Create** `frontend/app/actions.ts` — `"use server"` actions: `createOrg`, `createProject`, `addMilestone`, `fundMilestone`, `submitMilestone`, `releaseMilestone`, `refundMilestone`, `openDispute`, `resolveDispute`, `inviteMember`, `getCurrentOrg`.
- **Modify** `frontend/app/dashboard/page.tsx` — add links to `/projects`, `/invoices`; redirect to `/onboarding` when the user has no org.
- **Create** `frontend/app/onboarding/page.tsx` — create-org form (redirects to `/projects`).
- **Create** `frontend/app/projects/page.tsx` — list the user's org projects.
- **Create** `frontend/app/projects/new/page.tsx` — create-project form.
- **Create** `frontend/app/projects/[id]/page.tsx` — project detail + milestone board + action buttons + dispute UI.
- **Create** `frontend/app/invoices/page.tsx` — list invoices.
- **Modify** `frontend/components/SignupForm.tsx` — after successful signup, also create an org + owner membership so the user lands in a workspace (calls server action or inserts directly). (Optional; onboarding covers it if skipped.)
- **Modify** `frontend/middleware.ts`→ already `proxy.ts` guards `/dashboard`; add `/projects`, `/invoices`, `/onboarding` matcher coverage (the existing matcher already covers all paths except static assets, so no change needed).

---

### Task 1: Workspace SQL (invitations + org helper)

**Files:**
- Create: `frontend/supabase/workspace_mvp.sql`

**Interfaces:**
- Produces: `public.invitations` table, a `get_my_orgs()` SQL function, RLS on invitations.

- [ ] **Step 1: Write the SQL**

```sql
-- ---------- Workspace MVP additions (idempotent) ----------

-- The base schema's projects table references clients/freelancers by id but
-- has no human-readable contact fields. Add lightweight text columns so the
-- demo can capture client/freelancer name + email without requiring those
-- rows to exist first.
alter table public.projects
  add column if not exists client_name text,
  add column if not exists client_email text,
  add column if not exists freelancer_name text,
  add column if not exists freelancer_email text;

-- Pending invitations (recorded; acceptance handled in-app by inserting
-- an organization_members row). For the demo we do NOT send real email.
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member'
    check (role in ('owner','admin','member')),
  accepted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.invitations enable row level security;

drop policy if exists "invitations_org_read" on public.invitations;
create policy "invitations_org_read" on public.invitations
  for select using (public.auth_is_org_member(org_id));

drop policy if exists "invitations_org_insert" on public.invitations;
create policy "invitations_org_insert" on public.invitations
  for insert with check (public.auth_is_org_member(org_id));

-- Convenience: orgs the current user belongs to (used by server actions).
create or replace function public.get_my_orgs()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from public.organization_members where user_id = auth.uid();
$$;
```

- [ ] **Step 2: Lint (SQL not linted; just confirm file written)**
- [ ] **Step 3: Commit**
```bash
git add frontend/supabase/workspace_mvp.sql
git commit -m "feat(db): workspace MVP SQL — invitations + get_my_orgs"
```

---

### Task 2: Shared lib helpers (`lib/orka.ts`)

**Files:**
- Create: `frontend/lib/orka.ts`

**Interfaces:**
- Produces: `fakeTx()`, `getActiveOrgId(supabase)`, `MILESTONE_STATUS`, `PROCESS_STATES`.

- [ ] **Step 1: Write the helper**

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export const MILESTONE_STATUS = [
  "draft",
  "funded",
  "in_review",
  "released",
  "refunded",
  "disputed",
] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUS)[number];

// Simulated on-chain tx hash. Stands in for the Soroban tx the Rust
// backend would return. Mocked per the MVP scope (no real Stellar).
export function fakeTx(): string {
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 64; i++) out += hex[Math.floor(Math.random() * 16)];
  return out;
}

// Returns the user's first org id, or null if they have none yet.
export async function getActiveOrgId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data } = await supabase
    .from("organization_members")
    .select("org_id")
    .limit(1)
    .maybeSingle();
  return data?.org_id ?? null;
}
```

- [ ] **Step 2: Lint**
```bash
cd frontend && pnpm lint
```
Expected: PASS.
- [ ] **Step 3: Commit**
```bash
git add frontend/lib/orka.ts
git commit -m "feat(workspace): shared helpers — fakeTx + getActiveOrgId"
```

---

### Task 3: Server actions (the core mutations)

**Files:**
- Create: `frontend/app/actions.ts`

**Interfaces:**
- Consumes: `createClient()` from `lib/supabase/server`, `fakeTx()`/`getActiveOrgId()` from `lib/orka`.
- Produces: all workspace mutations used by the pages.

- [ ] **Step 1: Write `app/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { fakeTx, getActiveOrgId } from "../../lib/orka";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createOrg(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Workspace name is required." };

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({ name })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await supabase
    .from("organization_members")
    .insert({ org_id: org.id, user_id: user.id, role: "owner" });

  revalidatePath("/projects");
  redirect("/projects");
}

export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const clientName = String(formData.get("clientName") || "").trim();
  const clientEmail = String(formData.get("clientEmail") || "").trim();
  const freelancerName = String(formData.get("freelancerName") || "").trim();
  const freelancerEmail = String(formData.get("freelancerEmail") || "").trim();

  if (!title) return { error: "Project title is required." };
  if (clientEmail && !EMAIL_RE.test(clientEmail))
    return { error: "Client email is invalid." };
  if (freelancerEmail && !EMAIL_RE.test(freelancerEmail))
    return { error: "Freelancer email is invalid." };

  const { error } = await supabase.from("projects").insert({
    org_id: orgId,
    title,
    description,
    client_name: clientName,
    client_email: clientEmail,
    freelancer_name: freelancerName,
    freelancer_email: freelancerEmail,
    status: "draft",
  });
  if (error) return { error: error.message };

  revalidatePath("/projects");
  redirect("/projects");
}

export async function addMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const projectId = String(formData.get("projectId") || "");
  const title = String(formData.get("title") || "").trim();
  const amount = Number(formData.get("amount"));

  if (!projectId) return { error: "Missing project." };
  if (!title) return { error: "Milestone title is required." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { error: "Amount must be greater than 0." };

  const { error } = await supabase.from("milestones").insert({
    org_id: orgId,
    project_id: projectId,
    title,
    amount,
    status: "draft",
  });
  if (error) return { error: error.message };

  revalidatePath(`/projects/${projectId}`);
}

async function recordLedger(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orgId: string,
  projectId: string,
  milestoneId: string,
  eventType: string,
  amount: number,
) {
  await supabase.from("ledger_events").insert({
    org_id: orgId,
    project_id: projectId,
    milestone_id: milestoneId,
    chain_tx: fakeTx(),
    event_type: eventType,
    amount,
    asset: "USDC",
    status: "confirmed",
  });
}

export async function fundMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "funded" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error) return { error: error.message };
  await recordLedger(supabase, orgId, m.project_id, id, "fund", Number(m.amount));
  revalidatePath(`/projects/${m.project_id}`);
}

export async function submitMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "in_review" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id")
    .single();
  if (error) return { error: error.message };
  revalidatePath(`/projects/${m.project_id}`);
}

export async function releaseMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "released" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount, title")
    .single();
  if (error) return { error: error.message };

  // Mocked release: emit an invoice + ledger event.
  await recordLedger(supabase, orgId, m.project_id, id, "release", Number(m.amount));
  const { data: proj } = await supabase
    .from("projects")
    .select("title, client_name, freelancer_name")
    .eq("id", m.project_id)
    .single();
  await supabase.from("invoices").insert({
    org_id: orgId,
    project_id: m.project_id,
    milestone_id: id,
    invoice_number: `INV-${Date.now().toString().slice(-6)}`,
    amount: Number(m.amount),
    currency: "USD",
    status: "issued",
  });
  void proj;
  revalidatePath(`/projects/${m.project_id}`);
  revalidatePath("/invoices");
}

export async function refundMilestone(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "refunded" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error) return { error: error.message };
  await recordLedger(supabase, orgId, m.project_id, id, "refund", Number(m.amount));
  revalidatePath(`/projects/${m.project_id}`);
}

export async function openDispute(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "disputed" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id")
    .single();
  if (error) return { error: error.message };
  revalidatePath(`/projects/${m.project_id}`);
}

export async function resolveDispute(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const id = String(formData.get("milestoneId") || "");
  const splitBp = Number(formData.get("splitBp"));
  if (!Number.isFinite(splitBp) || splitBp < 0 || splitBp > 10000)
    return { error: "Split must be 0–10000 basis points." };
  const { data: m, error } = await supabase
    .from("milestones")
    .update({ status: "released" })
    .eq("id", id)
    .eq("org_id", orgId)
    .select("project_id, amount")
    .single();
  if (error) return { error: error.message };
  await supabase.from("disputes").insert({
    org_id: orgId,
    project_id: m.project_id,
    milestone_id: id,
    split_bp: splitBp,
    status: "resolved",
  });
  await recordLedger(supabase, orgId, m.project_id, id, "dispute_resolve", Number(m.amount));
  revalidatePath(`/projects/${m.project_id}`);
}

export async function inviteMember(formData: FormData) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "member");
  if (!EMAIL_RE.test(email)) return { error: "A valid email is required." };
  const { error } = await supabase
    .from("invitations")
    .insert({ org_id: orgId, email, role });
  if (error) return { error: error.message };
  revalidatePath(`/projects`);
}
```

- [ ] **Step 2: Lint**
```bash
cd frontend && pnpm lint
```
Expected: PASS.
- [ ] **Step 3: Commit**
```bash
git add frontend/app/actions.ts
git commit -m "feat(workspace): server actions for org/project/milestone lifecycle (mocked chain)"
```

---

### Task 4: Onboarding (create org)

**Files:**
- Create: `frontend/app/onboarding/page.tsx`

**Interfaces:**
- Consumes: `createClient()` from `lib/supabase/server`, `getActiveOrgId` from `lib/orka`, `createOrg` action from `app/actions`.

- [ ] **Step 1: Write the page**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getActiveOrgId } from "../../lib/orka";
import { createOrg } from "../../app/actions";

export const metadata = { title: "Create workspace · ORKA" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const orgId = await getActiveOrgId(supabase);
  if (orgId) redirect("/projects");

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 text-white">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
        <h1 className="display mb-1 text-3xl uppercase">Create your workspace</h1>
        <p className="mb-6 text-sm font-bold text-ink/70">
          Workspaces hold your projects, clients, and freelancers.
        </p>
        <form action={createOrg} className="flex flex-col gap-3">
          <input
            name="name"
            placeholder="Acme Studio"
            required
            className="min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20"
          />
          <button
            type="submit"
            className="mt-2 flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">
            Create workspace
          </button>
        </form>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Lint + build check (build at end)**
- [ ] **Step 3: Commit**
```bash
git add frontend/app/onboarding/page.tsx
git commit -m "feat(workspace): onboarding — create organization"
```

---

### Task 5: Projects list + create

**Files:**
- Create: `frontend/app/projects/page.tsx`
- Create: `frontend/app/projects/new/page.tsx`

**Interfaces:**
- Consumes: `createClient()`, `getActiveOrgId()`, `createProject` action.

- [ ] **Step 1: Write `frontend/app/projects/page.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getActiveOrgId } from "../../lib/orka";

export const metadata = { title: "Projects · ORKA" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, client_name")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/Logo/LOGO.svg" alt="ORKA" width={32} height={32} className="size-8 object-contain" />
          <span className="display text-2xl">ORKA</span>
        </div>
        <Link href="/projects/new" className="rounded-full bg-lime px-5 py-2 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">
          New project
        </Link>
      </div>

      <h1 className="display mt-8 text-4xl uppercase">Projects</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {projects && projects.length > 0 ?
          projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="rounded-[20px] bg-white p-5 text-ink shadow-hard transition hover:-translate-y-0.5">
              <p className="display text-xl uppercase">{p.title}</p>
              <p className="mt-1 text-sm font-bold text-ink/60">
                {p.client_name ?? "No client"} · <span className="uppercase">{p.status}</span>
              </p>
            </Link>
          ))
        : <p className="text-sm font-bold text-white/70">No projects yet — create your first.</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Write `frontend/app/projects/new/page.tsx`**

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getActiveOrgId } from "../../../lib/orka";
import { createProject } from "../../../app/actions";

export const metadata = { title: "New project · ORKA" };

const field =
  "min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  if (!(await getActiveOrgId(supabase))) redirect("/onboarding");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-white">
      <Link href="/projects" className="text-sm font-bold text-lime underline">← Back</Link>
      <h1 className="display mt-4 text-4xl uppercase">New project</h1>

      <form action={createProject} className="mt-6 flex flex-col gap-3">
        <input name="title" placeholder="Project title" required className={field} />
        <textarea name="description" placeholder="Description" className={field} />
        <input name="clientName" placeholder="Client name" className={field} />
        <input name="clientEmail" type="email" placeholder="Client email" className={field} />
        <input name="freelancerName" placeholder="Freelancer name" className={field} />
        <input name="freelancerEmail" type="email" placeholder="Freelancer email" className={field} />
        <button type="submit" className="mt-2 flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">
          Create project
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Lint**
- [ ] **Step 4: Commit**
```bash
git add frontend/app/projects/page.tsx frontend/app/projects/new/page.tsx
git commit -m "feat(workspace): projects list + create"
```

---

### Task 6: Project detail + milestone board

**Files:**
- Create: `frontend/app/projects/[id]/page.tsx`

**Interfaces:**
- Consumes: `createClient()`, `getActiveOrgId()`, all milestone actions.

- [ ] **Step 1: Write the page** (server component rendering the board + a client sub-component for action buttons, OR inline `<form action={...}>` server-action forms which need no client component). Use inline server-action `<form>` elements (no "use client" needed).

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getActiveOrgId } from "../../../lib/orka";
import {
  addMilestone,
  fundMilestone,
  submitMilestone,
  releaseMilestone,
  refundMilestone,
  openDispute,
  resolveDispute,
  inviteMember,
} from "../../../app/actions";

export const metadata = { title: "Project · ORKA" };

const btn =
  "rounded-full border-2 border-ink px-4 py-2 text-xs font-black uppercase transition hover:-translate-y-0.5 disabled:opacity-40";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  if (!(await getActiveOrgId(supabase))) redirect("/onboarding");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <Link href="/projects" className="text-sm font-bold text-lime underline">← Back</Link>
      <h1 className="display mt-4 text-4xl uppercase">{project?.title}</h1>
      <p className="mt-1 text-sm font-bold text-white/70">{project?.description}</p>
      <p className="text-xs font-bold uppercase text-white/50">
        Client: {project?.client_name ?? "—"} · Freelancer: {project?.freelancer_name ?? "—"}
      </p>

      <p className="mt-8 rounded-[10px] border border-orange/40 bg-orange/10 px-3 py-2 text-xs font-bold text-orange">
        Demo mode: chain actions are simulated (no real Stellar). Any workspace member can act as client or freelancer.
      </p>

      {/* Invite */}
      <form action={inviteMember} className="mt-6 flex flex-wrap items-end gap-2">
        <input name="email" type="email" placeholder="invite@email.com" required
          className="min-h-10 flex-1 rounded-[10px] border-2 border-ink bg-white px-3 text-sm font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/20" />
        <select name="role" className="min-h-10 rounded-[10px] border-2 border-ink bg-white px-3 text-sm font-bold">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button className={`${btn} bg-lime`}>Invite</button>
      </form>

      {/* Add milestone */}
      <form action={addMilestone} className="mt-6 flex flex-wrap items-end gap-2">
        <input type="hidden" name="projectId" value={id} />
        <input name="title" placeholder="Milestone title" required
          className="min-h-10 flex-1 rounded-[10px] border-2 border-ink bg-white px-3 text-sm font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/20" />
        <input name="amount" type="number" step="0.01" min="0.01" placeholder="USDC" required
          className="min-h-10 w-32 rounded-[10px] border-2 border-ink bg-white px-3 text-sm font-bold outline-none focus:border-violet focus:ring-4 focus:ring-violet/20" />
        <button className={`${btn} bg-lime`}>Add</button>
      </form>

      {/* Milestone board */}
      <div className="mt-6 flex flex-col gap-3">
        {milestones?.map((m) => (
          <div key={m.id} className="rounded-[18px] bg-white p-4 text-ink shadow-hard">
            <div className="flex items-center justify-between">
              <p className="font-black uppercase">{m.title}</p>
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-black uppercase text-white">
                {m.status}
              </span>
            </div>
            <p className="text-sm font-bold text-ink/70">{m.amount} USDC</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {m.status === "draft" && (
                <form action={fundMilestone}><input type="hidden" name="milestoneId" value={m.id} /><button className={`${btn} bg-lime`}>Fund</button></form>
              )}
              {m.status === "funded" && (
                <form action={submitMilestone}><input type="hidden" name="milestoneId" value={m.id} /><button className={`${btn} bg-violet text-white`}>Submit</button></form>
              )}
              {m.status === "in_review" && (
                <>
                  <form action={releaseMilestone}><input type="hidden" name="milestoneId" value={m.id} /><button className={`${btn} bg-lime`}>Approve & Release</button></form>
                  <form action={refundMilestone}><input type="hidden" name="milestoneId" value={m.id} /><button className={`${btn} bg-coral text-white`}>Refund</button></form>
                </>
              )}
              {["draft", "funded", "in_review"].includes(m.status) && (
                <form action={openDispute}><input type="hidden" name="milestoneId" value={m.id} /><button className={`${btn} border-coral text-coral`}>Dispute</button></form>
              )}
              {m.status === "disputed" && (
                <form action={resolveDispute} className="flex items-end gap-2">
                  <input type="hidden" name="milestoneId" value={m.id} />
                  <input name="splitBp" type="number" placeholder="split bp (0-10000)" className="min-h-10 w-40 rounded-[10px] border-2 border-ink bg-white px-3 text-sm font-bold" />
                  <button className={`${btn} bg-teal text-white`}>Resolve</button>
                </form>
              )}
            </div>
          </div>
        ))}
        {(!milestones || milestones.length === 0) && (
          <p className="text-sm font-bold text-white/70">No milestones yet.</p>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Lint**
- [ ] **Step 3: Commit**
```bash
git add frontend/app/projects/\[id\]/page.tsx
git commit -m "feat(workspace): project detail + milestone board with lifecycle actions"
```

---

### Task 7: Invoices list

**Files:**
- Create: `frontend/app/invoices/page.tsx`

**Interfaces:**
- Consumes: `createClient()`, `getActiveOrgId()`.

- [ ] **Step 1: Write the page**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getActiveOrgId } from "../../lib/orka";

export const metadata = { title: "Invoices · ORKA" };

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, currency, status, project_id, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="display text-4xl uppercase">Invoices</h1>
      <div className="mt-6 flex flex-col gap-3">
        {invoices?.map((inv) => (
          <div key={inv.id} className="rounded-[18px] bg-white p-4 text-ink shadow-hard">
            <div className="flex items-center justify-between">
              <p className="font-black uppercase">{inv.invoice_number}</p>
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-black uppercase text-white">{inv.status}</span>
            </div>
            <p className="text-sm font-bold text-ink/70">{inv.amount} {inv.currency}</p>
          </div>
        ))}
        {(!invoices || invoices.length === 0) && (
          <p className="text-sm font-bold text-white/70">No invoices yet — release a milestone to generate one.</p>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Lint**
- [ ] **Step 3: Commit**
```bash
git add frontend/app/invoices/page.tsx
git commit -m "feat(workspace): invoices list"
```

---

### Task 8: Wire dashboard + signup → workspace

**Files:**
- Modify: `frontend/app/dashboard/page.tsx`
- Modify: `frontend/components/SignupForm.tsx` (optional org creation)

**Interfaces:**
- Consumes: `getActiveOrgId()`, `createOrg`-like insert.

- [ ] **Step 1: Update dashboard** — after the profile `dl`, add quick links and an org check:

In `frontend/app/dashboard/page.tsx`, inside the white card after the `dl`, add:
```tsx
<div className="mt-6 flex flex-wrap gap-3">
  <Link href="/projects" className="rounded-full bg-lime px-5 py-2 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">Projects</Link>
  <Link href="/invoices" className="rounded-full border-2 border-ink bg-white px-5 py-2 text-sm font-black uppercase text-ink transition hover:bg-bone">Invoices</Link>
  <Link href="/onboarding" className="rounded-full border-2 border-ink bg-white px-5 py-2 text-sm font-black uppercase text-ink transition hover:bg-bone">New workspace</Link>
</div>
```
(import `Link` at top of the file: `import Link from "next/link";`)

- [ ] **Step 2: Lint** (dashboard already compiles; confirm)
- [ ] **Step 3: Commit**
```bash
git add frontend/app/dashboard/page.tsx
git commit -m "feat(workspace): dashboard links to projects/invoices/onboarding"
```

(Org auto-creation on signup is intentionally handled via `/onboarding` to keep signup simple; skip the SignupForm change.)

---

### Task 9: Final build + lint + SQL handoff

**Files:**
- Verify: whole `frontend/`

- [ ] **Step 1: Lint**
```bash
cd frontend && pnpm lint
```
Expected: PASS.
- [ ] **Step 2: Build**
```bash
pnpm build 2>&1 | tail -30
```
Expected: all new routes compile (`/onboarding`, `/projects`, `/projects/new`, `/projects/[id]`, `/invoices`); no type errors.
- [ ] **Step 3: Handoff note for the human**
The human must run in the Supabase SQL editor, in order:
  1. `frontend/supabase/phase1_schema.sql`
  2. `frontend/supabase/workspace_mvp.sql`
Then `pnpm dev`, sign up, go to `/onboarding` to create a workspace, and exercise the loop: New project → Add milestone → Fund → Submit → Approve & Release (invoice appears in `/invoices`) → or Dispute → Resolve.
- [ ] **Step 4: Final commit (if fixes were needed)**
```bash
git add -A
git commit -m "feat(workspace): complete MVP (mocked chain) — build green"
```

---

## Self-Review (against ROADMAP Phase 1.4 + 2.2/2.3, mocked)

- **1.4 routes:** `/dashboard` (✓ exists), `/projects/new` (✓), `/projects/[id]` milestone board (✓), `/projects/[id]/invite` (✓ invite form). ✓
- **Fund flow (1.4):** client Fund → `fundMilestone` writes `funded` + ledger. ✓ (mocked)
- **Approve/release (1.4):** Submit → Approve&Release → `released` + invoice + ledger. ✓ (mocked)
- **2.2 invoices:** auto-generated on release (✓). `ledger_events` drives internal ledger (✓ mocked). ✓
- **2.3 disputes:** open_dispute → `disputed`; resolve_dispute(split_bp) → dispute row + ledger. ✓ (human arbiter = any member in demo)
- **Mocked chain:** no Stellar/Rust; `fakeTx()` + Postgres updates + `ledger_events`. ✓ per scope.
- **RLS:** all writes via session server client; org-scoped policies from `phase1_schema.sql` apply. ✓
- **Placeholder scan:** every action has real code; SQL idempotent. ✓
- **Type consistency:** `getActiveOrgId(supabase: SupabaseClient)` used consistently; `fakeTx()` returns string; milestone status strings match the `milestone_status` enum + board checks. ✓
- **Known limitations (documented):** single-user demo actor model (no per-role enforcement); invites recorded but not emailed; no real Stellar/KMS. ✓
