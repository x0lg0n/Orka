# Workspace App Shell + Settings (edit/delete) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every workspace its own in-app home (`/workspaces/[id]`) with a left sidebar (Dashboard, Team, Integrations, Usage, Billing, Settings) where the owner can edit details and delete the workspace; the main `/dashboard` stays untouched and separate.

**Architecture:** A new Next route segment `app/workspaces/[workspaceId]` owns a `WorkspaceSidebar` shell (reusing the shadcn `WorkspaceSwitcher`) and renders a Workspace Dashboard index + a fully-built Settings page (edit form + typed-confirm delete dialog). Owner-only enforcement is dual: a new RLS function/policy (`auth_is_org_owner`, tighten update, add delete) AND server-side checks inside new `updateOrg`/`deleteOrg` actions. Team/Integrations/Usage/Billing are stub `Card` placeholders.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), shadcn/ui (Radix + `class-variance-authority` + `clsx` + `tailwind-merge`), lucide-react, Supabase Postgres + Storage (service-role client for writes).

## Global Constraints

- Path alias `@/*` → frontend root (from `tsconfig.json`). Use `@/components/...`, `@/lib/...`.
- shadcn primitives live in `@/components/ui/*` (kebab-case). Custom components in `@/components/*`.
- Server actions live in `frontend/app/actions.ts` (already has `"use server"` at top). Import server clients via:
  - authed: `createClient` from `@/lib/supabase/server`
  - service-role: `getSupabase` from `@/lib/supabase`
- Dark theme throughout; ORKA tokens: `bg-shell`, `bg-sidebar`, `bg-panel`, `bg-hover`, `border-border`, `text-white`, `text-primary`, `danger`.
- **No unit-test framework in this repo.** Verification per task = `pnpm build` (runs `tsc` strict + ESLint). Integration tasks add a `pnpm dev` + `curl` smoke check. There is no separate `typecheck` script.
- Ownership is enforced BOTH in RLS (run `frontend/supabase/workspace_owner_rls.sql` in Supabase) AND in the actions — never trust the UI alone.
- Workspace `type` values MUST match `createOrg`: `freelancer | agency | studio | consultancy | startup` (keep them in sync).
- `organizations` columns available: `id, name, slug, created_by, created_at, updated_at, type, logo_url`. `slug` is `unique` but nullable.
- Every task ends with a commit. Keep commits atomic.

---

### Task 1: Owner-only RLS (SQL migration)

**Files:**
- Create: `frontend/supabase/workspace_owner_rls.sql`

**Interfaces:**
- Produces: `auth_is_org_owner(org uuid)` SQL function; owner-only UPDATE + DELETE policies on `organizations`. Consumed by Task 2 actions (defense-in-depth) and by the live DB.

- [ ] **Step 1: Write `frontend/supabase/workspace_owner_rls.sql`**

```sql
-- Owner-only enforcement for organizations (edit + delete).
-- Run in Supabase SQL Editor. Idempotent.

create or replace function public.auth_is_org_owner(org uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  return exists (
    select 1 from public.organization_members m
    where m.org_id = org
      and m.user_id = auth.uid()
      and m.role = 'owner'
  );
end;
$$;

-- Tighten UPDATE to owners only (was any member via auth_is_org_member).
drop policy if exists "org_members_update" on public.organizations;
create policy "org_members_update" on public.organizations
  for update using (public.auth_is_org_owner(id));

-- Add owner-only DELETE (no delete policy exists today, so delete is denied by RLS).
drop policy if exists "org_owner_delete" on public.organizations;
create policy "org_owner_delete" on public.organizations
  for delete using (public.auth_is_org_owner(id));
```

- [ ] **Step 2: Run it in Supabase**

Run: paste `frontend/supabase/workspace_owner_rls.sql` into the Supabase SQL Editor and execute.
Expected: "Success" / no errors. `auth_is_org_owner` function exists; `organization_members` read/insert policies unchanged.

- [ ] **Step 3: Commit**

```bash
git add frontend/supabase/workspace_owner_rls.sql
git commit -m "feat(db): owner-only RLS for organizations (update + delete)"
```

---

### Task 2: `updateOrg` + `deleteOrg` server actions

**Files:**
- Modify: `frontend/app/actions.ts` (append two exports)

**Interfaces:**
- Consumes: `createClient` (`@/lib/supabase/server`), `getSupabase` (`@/lib/supabase`), `cookies` (next/headers), `redirect` (next/navigation), `revalidatePath` (next/cache). Mirrors the existing `createOrg` shape (lines ~101-163).
- Produces: `updateOrg(formData: FormData)` and `deleteOrg(formData: FormData)`, both owner-gated. Used by Task 6 client forms.

- [ ] **Step 1: Append the two actions to `frontend/app/actions.ts`**

Add at the end of the file (it already starts with `"use server"`):

```ts
export async function updateOrg(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const id = String(formData.get("orgId") || "").trim();
  if (!id) redirect("/workspaces?error=Missing workspace.");

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (member?.role !== "owner") {
    redirect(`/workspaces/${id}/settings?error=Only the owner can edit this workspace.`);
  }

  const name = String(formData.get("name") || "").trim();
  if (!name) redirect(`/workspaces/${id}/settings?error=Workspace name is required.`);

  const rawType = String(formData.get("type") || "").trim();
  const type = ["freelancer", "agency", "studio", "consultancy", "startup"].includes(rawType)
    ? rawType
    : null;

  const rawSlug = String(formData.get("slug") || "").trim();
  const slug =
    (rawSlug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || undefined;

  const admin = getSupabase();
  const update: Record<string, unknown> = { name, slug, type };
  await admin.from("organizations").update(update).eq("id", id);

  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    const ext = (logoFile.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await admin.storage
      .from("workspace-logos")
      .upload(path, logoFile, { upsert: true, contentType: logoFile.type || "image/png" });
    if (!upErr) {
      const { data: urlData } = admin.storage.from("workspace-logos").getPublicUrl(path);
      await admin.from("organizations").update({ logo_url: urlData.publicUrl }).eq("id", id);
    }
  }

  revalidatePath("/workspaces");
  revalidatePath(`/workspaces/${id}`);
  revalidatePath(`/workspaces/${id}/settings`);
  redirect(`/workspaces/${id}/settings?updated=1`);
}

export async function deleteOrg(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const id = String(formData.get("orgId") || "").trim();
  if (!id) redirect("/workspaces");

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (member?.role !== "owner") redirect("/workspaces");

  const admin = getSupabase();
  const { error } = await admin.from("organizations").delete().eq("id", id);
  if (error) redirect(`/workspaces/${id}/settings?error=${encodeURIComponent(error.message)}`);

  const cookieStore = await cookies();
  if (cookieStore.get("orka_active_org")?.value === id) {
    cookieStore.delete("orka_active_org");
  }

  revalidatePath("/workspaces");
  redirect("/workspaces");
}
```

- [ ] **Step 2: Build to confirm types compile**

Run: `cd frontend && pnpm build`
Expected: PASS (actions file compiles; no unresolved imports).

- [ ] **Step 3: Commit**

```bash
git add frontend/app/actions.ts
git commit -m "feat: add owner-gated updateOrg + deleteOrg server actions"
```

---

### Task 3: `WorkspaceSidebar` component (desktop + mobile)

**Files:**
- Create: `frontend/components/workspace/WorkspaceSidebar.tsx`
- Modify: `frontend/components/shell/WorkspaceSwitcher.tsx` (point "Manage workspaces" to `/workspaces`)

**Interfaces:**
- Consumes: `WorkspaceSwitcher` (`@/components/shell/WorkspaceSwitcher`), shadcn `Button`, `Avatar`, `SignOutButton` (`@/components/SignOutButton`), `Sheet` (for mobile). Needs `orgs: {id,name}[]` + `currentOrgId` as props.
- Produces: `WorkspaceSidebar` used by the layout in Task 4.

- [ ] **Step 1: Point "Manage workspaces" to `/workspaces` in `WorkspaceSwitcher.tsx`**

In `frontend/components/shell/WorkspaceSwitcher.tsx`, change the "Manage workspaces" `Link` href from `/onboarding` to `/workspaces`:

```tsx
          <Link href="/workspaces" className="gap-2 font-extrabold">
            Manage workspaces
          </Link>
```

- [ ] **Step 2: Create `frontend/components/workspace/WorkspaceSidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Building2, Users, Plug, BarChart3, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { WorkspaceSwitcher } from "@/components/shell/WorkspaceSwitcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/SignOutButton";

type NavItem = {
  href: (id: string) => string;
  label: string;
  icon: typeof Building2;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: (id) => `/workspaces/${id}`, label: "Dashboard", icon: Building2, exact: true },
  { href: (id) => `/workspaces/${id}/team`, label: "Team", icon: Users },
  { href: (id) => `/workspaces/${id}/integrations`, label: "Integrations", icon: Plug },
  { href: (id) => `/workspaces/${id}/usage`, label: "Usage", icon: BarChart3 },
  { href: (id) => `/workspaces/${id}/billing`, label: "Billing", icon: CreditCard },
  { href: (id) => `/workspaces/${id}/settings`, label: "Settings", icon: SettingsIcon },
];

export function WorkspaceSidebar({
  orgs,
  currentOrgId,
}: {
  orgs: { id: string; name: string }[];
  currentOrgId: string;
}) {
  const pathname = usePathname();
  const base = `/workspaces/${currentOrgId}`;

  const NavLinks = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const href = item.href(currentOrgId);
        const active = item.exact ? pathname === href : pathname.startsWith(href);
        const Icon = item.icon;
        return (
          <Button
            key={href}
            asChild
            variant={active ? "secondary" : "ghost"}
            className={`justify-start gap-3 ${active ? "" : "text-white/70"}`}
          >
            <Link href={href}>
              <Icon className="size-4" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="p-3">
          <WorkspaceSwitcher orgs={orgs} currentOrgId={currentOrgId} />
        </div>
        <div className="flex-1 p-3">{NavLinks}</div>
        <div className="m-3 flex items-center gap-2 rounded-[10px] border border-border bg-hover p-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/20 text-xs font-extrabold text-primary">U</AvatarFallback>
          </Avatar>
          <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-white">Account</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 lg:hidden">
        <WorkspaceSwitcher orgs={orgs} currentOrgId={currentOrgId} />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-border bg-sidebar p-3 text-white">
            <div className="flex flex-col gap-3">
              {NavLinks}
              <div className="mt-2 border-t border-border pt-3">
                <SignOutButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Build**

Run: `cd frontend && pnpm build`
Expected: PASS (component compiles standalone; it is imported in Task 4).

- [ ] **Step 4: Commit**

```bash
git add frontend/components/workspace/WorkspaceSidebar.tsx frontend/components/shell/WorkspaceSwitcher.tsx
git commit -m "feat: add WorkspaceSidebar (desktop rail + mobile Sheet)"
```

---

### Task 4: Workspace app layout (membership gate + shell)

**Files:**
- Create: `frontend/app/workspaces/[workspaceId]/layout.tsx`

**Interfaces:**
- Consumes: `createClient` (`@/lib/supabase/server`), `cookies` (next/headers), `redirect` (next/navigation), `WorkspaceSidebar` (Task 3).
- Produces: the workspace shell that wraps all `/workspaces/[workspaceId]/*` pages; sets the active-org cookie; redirects non-members to `/workspaces`.

- [ ] **Step 1: Write `frontend/app/workspaces/[workspaceId]/layout.tsx`**

```tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";

export default async function WorkspaceAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { data: member } = await supabase
    .from("organization_members")
    .select("org_id")
    .eq("org_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) redirect("/workspaces");

  (await cookies()).set("orka_active_org", workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  const { data: members } = await supabase
    .from("organization_members")
    .select("organizations(id, name)")
    .eq("user_id", user.id);

  const orgs = (members ?? [])
    .map((m) => (Array.isArray(m.organizations) ? m.organizations[0] : m.organizations))
    .filter((o): o is { id: string; name: string } => Boolean(o))
    .map((o) => ({ id: o.id, name: o.name }));

  return (
    <div className="product-ui dark flex min-h-screen bg-shell text-white">
      <WorkspaceSidebar orgs={orgs} currentOrgId={workspaceId} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `cd frontend && pnpm build`
Expected: PASS; the layout wraps the existing (still-loading) `[workspaceId]/page.tsx` without errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/workspaces/[workspaceId]/layout.tsx
git commit -m "feat: workspace app layout (membership gate + sidebar shell)"
```

---

### Task 5: Workspace Dashboard index page

**Files:**
- Modify: `frontend/app/workspaces/[workspaceId]/page.tsx` (replace the loading screen with a real dashboard)
- Delete: `frontend/app/workspaces/[workspaceId]/_components/WorkspaceLoading.tsx` (do this in Task 8 to keep build green meanwhile)

**Interfaces:**
- Consumes: `createClient` (`@/lib/supabase/server`), `redirect`, shadcn `Avatar`, `Badge`, `Card`.
- Produces: the `/workspaces/[id]` index = Workspace Dashboard (distinct from `/dashboard/home`).

- [ ] **Step 1: Replace `frontend/app/workspaces/[workspaceId]/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const TYPE_LABEL: Record<string, string> = {
  freelancer: "Freelancer",
  agency: "Agency",
  studio: "Studio",
  consultancy: "Consultancy",
  startup: "Startup",
};

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  const { data: orgRow } = await supabase
    .from("organizations")
    .select("id, name, slug, type, logo_url")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!orgRow) redirect("/workspaces");

  const [projects, clients, roster] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("org_id", workspaceId),
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("org_id", workspaceId),
    supabase
      .from("organization_members")
      .select("user_id", { count: "exact", head: true })
      .eq("org_id", workspaceId),
  ]);

  return (
    <main className="flex-1 px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            {orgRow.logo_url ? (
              <AvatarImage src={orgRow.logo_url} alt={orgRow.name} />
            ) : null}
            <AvatarFallback className="bg-primary/20 text-lg font-extrabold text-primary">
              {orgRow.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em]">{orgRow.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              {orgRow.type ? (
                <Badge className="bg-white/10 text-white/70">
                  {TYPE_LABEL[orgRow.type] ?? orgRow.type}
                </Badge>
              ) : null}
              {orgRow.slug ? (
                <span className="text-sm font-bold text-white/40">/{orgRow.slug}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-border bg-panel p-5">
            <p className="text-sm font-bold text-white/50">Projects</p>
            <p className="mt-1 text-3xl font-extrabold">{projects.count ?? 0}</p>
          </Card>
          <Card className="border-border bg-panel p-5">
            <p className="text-sm font-bold text-white/50">Clients</p>
            <p className="mt-1 text-3xl font-extrabold">{clients.count ?? 0}</p>
          </Card>
          <Card className="border-border bg-panel p-5">
            <p className="text-sm font-bold text-white/50">Members</p>
            <p className="mt-1 text-3xl font-extrabold">{roster.count ?? 0}</p>
          </Card>
        </div>

        <p className="mt-10 text-sm font-bold text-white/40">
          Team, projects and settings live in the sidebar.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Build**

Run: `cd frontend && pnpm build`
Expected: PASS. (WorkspaceLoading.tsx is still present but now unused — removed in Task 8.)

- [ ] **Step 3: Commit**

```bash
git add frontend/app/workspaces/[workspaceId]/page.tsx
git commit -m "feat: workspace dashboard index (header + stat cards)"
```

---

### Task 6: Settings page (edit form + delete dialog)

**Files:**
- Create: `frontend/app/workspaces/[workspaceId]/settings/page.tsx`
- Create: `frontend/app/workspaces/[workspaceId]/settings/_components/EditWorkspaceForm.tsx`
- Create: `frontend/app/workspaces/[workspaceId]/settings/_components/DeleteWorkspaceDialog.tsx`

**Interfaces:**
- Consumes: `createClient` (`@/lib/supabase/server`), `redirect`, shadcn `Card`, `Button`, `Input`, `Label`, `Avatar`, `DropdownMenu*`, `Dialog*`; `updateOrg`/`deleteOrg` (Task 2). `defaultValues` shape: `{ name, slug, type, logoUrl }`.
- Produces: owner-only editable Settings; non-owners get a read-only view.

- [ ] **Step 1: Write `EditWorkspaceForm.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateOrg } from "@/app/actions";

const TYPES = [
  { value: "freelancer", label: "Freelancer" },
  { value: "agency", label: "Agency" },
  { value: "studio", label: "Studio" },
  { value: "consultancy", label: "Consultancy" },
  { value: "startup", label: "Startup" },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function EditWorkspaceForm({
  id,
  defaultValues,
}: {
  id: string;
  defaultValues: { name: string; slug: string | null; type: string | null; logoUrl: string | null };
}) {
  const [name, setName] = useState(defaultValues.name);
  const [slug, setSlug] = useState(defaultValues.slug ?? "");
  const [type, setType] = useState(defaultValues.type ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(defaultValues.logoUrl);

  return (
    <Card className="border-border bg-panel p-6">
      <form action={updateOrg} className="flex flex-col gap-5">
        <input type="hidden" name="orgId" value={id} />

        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            {logoPreview ? <AvatarImage src={logoPreview} alt={name} /> : null}
            <AvatarFallback className="bg-primary/20 text-xl font-extrabold text-primary">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Label htmlFor="logo" className="block text-sm font-bold text-white/70">Logo</Label>
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              className="mt-1"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setLogoPreview(URL.createObjectURL(f));
              }}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="name" className="block text-sm font-bold text-white/70">Workspace name</Label>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(slugify(e.target.value));
            }}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="slug" className="block text-sm font-bold text-white/70">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="block text-sm font-bold text-white/70">Type</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="mt-1 w-full justify-between">
                {TYPES.find((t) => t.value === type)?.label ?? "Select type"}
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-border bg-sidebar text-white">
              {TYPES.map((t) => (
                <DropdownMenuItem
                  key={t.value}
                  onSelect={() => setType(t.value)}
                  className="gap-2 text-white hover:bg-hover focus:bg-hover data-[highlighted]:bg-hover"
                >
                  {t.label}
                  {type === t.value ? <Check className="ml-auto size-4 text-primary" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <input type="hidden" name="type" value={type} />
        </div>

        <Button type="submit" className="w-fit">Save changes</Button>
      </form>
    </Card>
  );
}
```

- [ ] **Step 2: Write `DeleteWorkspaceDialog.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteOrg } from "@/app/actions";

export function DeleteWorkspaceDialog({ id, name }: { id: string; name: string }) {
  const [confirm, setConfirm] = useState("");
  const matched = confirm === name;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-fit gap-2">
          <Trash2 className="size-4" />
          Delete workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-sidebar text-white">
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{name}&rdquo;?</DialogTitle>
          <DialogDescription className="text-white/60">
            This permanently deletes the workspace and ALL its projects, payments, and history. Type{" "}
            <span className="font-extrabold text-white">{name}</span> to confirm.
          </DialogDescription>
        </DialogHeader>
        <form action={deleteOrg} className="flex flex-col gap-4">
          <input type="hidden" name="orgId" value={id} />
          <Input
            name="confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={name}
            autoFocus
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={!matched}>
              Delete permanently
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Write `settings/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { EditWorkspaceForm } from "./_components/EditWorkspaceForm";
import { DeleteWorkspaceDialog } from "./_components/DeleteWorkspaceDialog";

export default async function WorkspaceSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { workspaceId } = await params;
  const { updated, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { data: orgRow } = await supabase
    .from("organizations")
    .select("id, name, slug, type, logo_url")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!orgRow) redirect("/workspaces");

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  const isOwner = member?.role === "owner";

  return (
    <main className="flex-1 px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[760px]">
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em]">Workspace settings</h1>

        {updated ? (
          <p className="mt-4 rounded-[10px] border border-orka-success/35 bg-orka-success/10 px-4 py-3 text-sm font-bold text-green-100">
            Workspace updated.
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-[10px] border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-bold text-red-100">
            {error}
          </p>
        ) : null}

        {isOwner ? (
          <>
            <p className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-white/40">Details</p>
            <EditWorkspaceForm
              id={orgRow.id}
              defaultValues={{
                name: orgRow.name,
                slug: (orgRow.slug as string | null) ?? null,
                type: (orgRow.type as string | null) ?? null,
                logoUrl: (orgRow.logo_url as string | null) ?? null,
              }}
            />

            <p className="mb-3 mt-10 text-sm font-bold uppercase tracking-wide text-white/40">Danger zone</p>
            <Card className="border-danger/30 bg-panel p-6">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-extrabold text-white">Delete this workspace</p>
                  <p className="mt-1 text-sm font-bold text-white/50">
                    Permanently remove the workspace and all of its data. This cannot be undone.
                  </p>
                </div>
                <DeleteWorkspaceDialog id={orgRow.id} name={orgRow.name} />
              </div>
            </Card>
          </>
        ) : (
          <Card className="mt-6 border-border bg-panel p-6">
            <p className="text-sm font-bold text-white/70">
              Only the workspace owner can edit these settings.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-bold text-white/40">Name</dt>
                <dd className="font-extrabold text-white">{orgRow.name}</dd>
              </div>
              <div>
                <dt className="font-bold text-white/40">Slug</dt>
                <dd className="font-extrabold text-white">{orgRow.slug ?? "—"}</dd>
              </div>
            </dl>
          </Card>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Build**

Run: `cd frontend && pnpm build`
Expected: PASS; Settings page + forms compile; `updateOrg`/`deleteOrg` imports resolve.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/workspaces/[workspaceId]/settings
git commit -m "feat: workspace settings page (owner edit form + delete dialog)"
```

---

### Task 7: Stub sections (team / integrations / usage / billing)

**Files:**
- Create: `frontend/app/workspaces/[workspaceId]/team/page.tsx`
- Create: `frontend/app/workspaces/[workspaceId]/integrations/page.tsx`
- Create: `frontend/app/workspaces/[workspaceId]/usage/page.tsx`
- Create: `frontend/app/workspaces/[workspaceId]/billing/page.tsx`

**Interfaces:**
- Consumes: shadcn `Card`. No data fetching (intentionally inert this pass).
- Produces: complete sidebar nav targets so none 404.

- [ ] **Step 1: Write the four stub pages**

Each page has the same shape (only the `<h1>`/copy differs). Example for `team/page.tsx`:

```tsx
import { Card } from "@/components/ui/card";

export default function WorkspaceTeamPage() {
  return (
    <main className="flex-1 px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[760px]">
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em]">Team</h1>
        <Card className="mt-6 border-border bg-panel p-8 text-center">
          <p className="text-sm font-bold text-white/50">Team management is coming soon.</p>
        </Card>
      </div>
    </main>
  );
}
```

Repeat for `integrations/page.tsx` (title "Integrations", copy "Integrations are coming soon."), `usage/page.tsx` (title "Usage", copy "Usage metrics are coming soon."), `billing/page.tsx` (title "Billing", copy "Billing is coming soon.").

- [ ] **Step 2: Build**

Run: `cd frontend && pnpm build`
Expected: PASS; all four routes compile and are reachable from the sidebar.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/workspaces/[workspaceId]/team frontend/app/workspaces/[workspaceId]/integrations frontend/app/workspaces/[workspaceId]/usage frontend/app/workspaces/[workspaceId]/billing
git commit -m "feat: stub workspace sections (team, integrations, usage, billing)"
```

---

### Task 8: Remove obsolete loading component

**Files:**
- Delete: `frontend/app/workspaces/[workspaceId]/_components/WorkspaceLoading.tsx`

**Interfaces:**
- Consumes: nothing (cleanup). The index page was replaced in Task 5, so this file is now unreferenced.

- [ ] **Step 1: Confirm no references remain**

Run: `cd frontend && rg -n "WorkspaceLoading" app`
Expected: no matches (Task 5 replaced the only importer).

- [ ] **Step 2: Delete the file**

```bash
rm "frontend/app/workspaces/[workspaceId]/_components/WorkspaceLoading.tsx"
```

(If `rg` reported further references, fix them before deleting; otherwise proceed.)

- [ ] **Step 3: Build**

Run: `cd frontend && pnpm build`
Expected: PASS; no unresolved import for `WorkspaceLoading`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove obsolete workspace loading component"
```

---

### Task 9: Final verification

**Files:** none changed.

- [ ] **Step 1: Full build + lint**

Run: `cd frontend && pnpm build && pnpm lint`
Expected: PASS with zero type/lint errors.

- [ ] **Step 2: Dev smoke — routes serve**

Run (in one shell): `cd frontend && pnpm dev`
Then (another shell), with a signed-in session cookie present (or after logging in via the UI):

```bash
for p in "/workspaces" "/workspaces/<id>" "/workspaces/<id>/settings" "/workspaces/<id>/team" "/workspaces/<id>/integrations" "/workspaces/<id>/usage" "/workspaces/<id>/billing"; do
  echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' -L http://localhost:3000$p)"
done
```

Expected: `/workspaces` 200; `<id>` (dashboard) 200; settings 200; stub sections 200. A non-member hitting `<id>` redirects to `/workspaces` (307).

- [ ] **Step 3: Owner edit + delete (manual, in browser)**

Log in as the workspace owner:
1. Open `/workspaces/<id>/settings`, change name/type/logo/slug, Save → redirected back with "Workspace updated."; `/workspaces` reflects the new name/logo.
2. Open Settings → Danger zone → type the workspace name → Delete permanently → lands on `/workspaces`; the workspace is gone (verified in Supabase `organizations` + cascaded children).
3. As a non-owner, Settings shows the read-only view with no edit/delete controls; a direct POST to `updateOrg`/`deleteOrg` is rejected server-side (redirect, no change).

- [ ] **Step 4: Main dashboard unaffected**

Open `/dashboard/home` → still renders the main dashboard (separate from the workspace dashboard).

- [ ] **Step 5: Commit only if follow-up tweaks were needed**

```bash
git add -A && git commit -m "fix: post-verification tweaks for workspace shell"
```

(Only if Steps 1-4 required edits; otherwise no commit.)
