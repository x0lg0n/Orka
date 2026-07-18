# Frontend URL Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Orka frontend onto a Workspace → Projects → Resources IA (`/w/[slug]/...`), grouped sidebar, `?tab=` detail tabs, and build the missing areas (Clients, Analytics, AI, Notifications, Search, public Portal, auth/marketing pages).

**Architecture:** A single Next.js App Router codebase using route groups `(marketing)`, `(auth)`, `(app)`. The app group lives under `w/[slug]`; the workspace slug (from `organizations.slug`) is the URL source of truth, with the `orka_active_org` cookie as fallback. Detail/settings pages use `?tab=` query-param tabs via a shared `Tabs` component. Subdomain support (`app.`, `portal.`) is deferred to a later middleware layer.

**Tech Stack:** Next.js 16.2.10 (App Router), React 19, Tailwind v4 (CSS-first, `@theme` tokens), shadcn/ui, Supabase SSR (`@supabase/ssr`), `lucide-react`. Package manager: **pnpm** (never npm at repo root).

## Global Constraints

- **No test runner in `frontend/`** (AGENTS.md): per-task verification is `pnpm lint` + `pnpm build` + a manual route smoke check. TDD is not available; the build/lint gate replaces unit tests.
- **Use pnpm everywhere.** Never run `npm install` at repo root (creates spurious `package-lock.json` → Next 16 `adapterFn` crash).
- **Color utilities are token-backed** (`bg-shell`, `bg-sidebar`, `bg-hover`, `bg-panel`, `text-night`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary`, `bg-lime`, `text-lime`, `bg-coral`). Do NOT use `bg-ink`/`bg-bone`/`bg-paper` (resolved in earlier commit).
- **`organizations.slug` must be unique, non-null, URL-safe.** Verify/fix the migration before Phase A (Task 0).
- **Resource detail IDs stay UUIDs this pass** (Decision D5). Only the workspace uses its slug in the URL.
- **Strict TypeScript** (`strict: true`), `moduleResolution: "bundler"`. `next.config.mjs` already sets `transpilePackages: ["@orka/stellar-sdk"]`.
- Commit often; each task ends with a commit on the `dev` branch.

---

## Reusable Interfaces (defined once, consumed by later tasks)

```ts
// lib/orka.ts additions
export type OrgSummary = { id: string; name: string; slug: string };
export async function getActiveOrgBySlug(
  supabase: SupabaseClient, slug: string
): Promise<{ id: string; name: string; slug: string; type: string | null; logo_url: string | null } | null>;
export async function listOrgsForUser(supabase: SupabaseClient, userId: string): Promise<OrgSummary[]>;
// existing exports kept: getActiveOrgId, fakeTx, MILESTONE_STATUS

// components/shell/Tabs.tsx
export type TabDef = { id: string; label: string };
export function Tabs({ tabs, basePath }: { tabs: TabDef[]; basePath: string }): JSX.Element;

// components/shell/Sidebar.tsx (rewritten)
export type ShellUser = { name: string; email: string };
export function Sidebar(props: {
  orgs: { slug: string; name: string }[];
  currentSlug: string;
  role: string;
  user: ShellUser;
}): JSX.Element;

// components/shell/WorkspaceSwitcher.tsx (rewritten)
export function WorkspaceSwitcher(props: {
  orgs: { slug: string; name: string }[];
  currentSlug: string;
}): JSX.Element;

// components/shell/AppShell.tsx (signature change)
export function AppShell(props: {
  orgs: { slug: string; name: string }[];
  currentSlug: string;
  role: string;
  user: ShellUser;
  children: ReactNode;
}): JSX.Element;
```

---

## Phase 0 — Data precondition

### Task 0: Ensure `organizations.slug` is unique & non-null

**Files:**
- Verify: `services/` (or Supabase migration) defining `organizations`.

**Steps:**
- [ ] **Step 1: Confirm slug column constraints**
  Search the repo for the `organizations` table definition (SQL migration or Rust schema). Confirm `slug` is `NOT NULL`, `UNIQUE`, and generated/validated as URL-safe.
- [ ] **Step 2: Add a migration if missing**
  If the constraint is absent, add a Supabase migration:
  ```sql
  ALTER TABLE organizations
    ALTER COLUMN slug SET NOT NULL,
    ADD CONSTRAINT organizations_slug_unique UNIQUE (slug);
  -- backfill any NULLs with a url-safe derived value before applying NOT NULL
  ```
- [ ] **Step 3: Verify**
  Run: `pnpm --filter <services-or-db> <migrate/check command>` (use the repo's migration runner). Expected: migration applies; no duplicate/null slugs.

---

## Phase A — Foundation (slug routing, collapse homes, grouped sidebar)

### Task A1: Add slug-based org resolution to `lib/orka.ts`

**Files:**
- Modify: `frontend/lib/orka.ts`
- Test: n/a (no runner) — verify via `pnpm build` in Task A6.

**Interfaces:**
- Produces: `getActiveOrgBySlug`, `listOrgsForUser` (consumed by `w/[slug]/layout.tsx` and `WorkspaceSwitcher`).

**Steps:**
- [ ] **Step 1: Add the two functions** (append to `frontend/lib/orka.ts`):
  ```ts
  import type { SupabaseClient } from "@supabase/supabase-js";

  export type OrgSummary = { id: string; name: string; slug: string };

  export async function getActiveOrgBySlug(
    supabase: SupabaseClient,
    slug: string
  ): Promise<{ id: string; name: string; slug: string; type: string | null; logo_url: string | null } | null> {
    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, slug, type, logo_url")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data;
  }

  export async function listOrgsForUser(
    supabase: SupabaseClient,
    userId: string
  ): Promise<OrgSummary[]> {
    const { data, error } = await supabase
      .from("organization_members")
      .select("organizations(id, name, slug)")
      .eq("user_id", userId);
    if (error || !data) return [];
    return data
      .map((row: any) => row.organizations)
      .filter(Boolean)
      .map((o: any) => ({ id: o.id, name: o.name, slug: o.slug }));
  }
  ```
- [ ] **Step 2: Typecheck import**
  Run: `cd frontend && pnpm exec tsc --noEmit`
  Expected: no new type errors.
- [ ] **Step 3: Commit**
  ```bash
  git add frontend/lib/orka.ts
  git commit -m "feat(orka): add slug-based org resolution helpers"
  ```

### Task A2: Rewrite `WorkspaceSwitcher` to be slug-based and path-aware

**Files:**
- Modify: `frontend/components/shell/WorkspaceSwitcher.tsx`

**Interfaces:**
- Consumes: `usePathname`, `useRouter` from `next/navigation`.
- Produces: slug-aware switcher used by `AppShell`.

**Steps:**
- [ ] **Step 1: Replace file contents:**
  ```tsx
  "use client";

  import Link from "next/link";
  import { usePathname, useRouter } from "next/navigation";
  import { Check, ChevronDown } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Avatar, AvatarFallback } from "@/components/ui/avatar";
  import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";

  export function WorkspaceSwitcher({
    orgs,
    currentSlug,
  }: {
    orgs: { slug: string; name: string }[];
    currentSlug: string;
  }) {
    const pathname = usePathname();
    const router = useRouter();
    const current = orgs.find((o) => o.slug === currentSlug) ?? orgs[0];
    if (!current) return null;

    const urlForSlug = (slug: string) =>
      pathname.replace(/\/w\/[^/]+/, `/w/${slug}`);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center gap-3 rounded-[10px] border border-border bg-hover p-3 transition hover:bg-hover dark:hover:bg-hover"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-primary text-sm font-extrabold text-white">
              {current.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-sm font-extrabold text-white">{current.name}</span>
              <span className="mt-0.5 block text-xs font-bold text-white/45">
                {orgs.length} workspace{orgs.length === 1 ? "" : "s"}
              </span>
            </span>
            <ChevronDown className="size-4 text-white/45" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) border-border bg-sidebar text-white">
          <DropdownMenuLabel className="text-white/45">Workspaces</DropdownMenuLabel>
          {orgs.map((org) => {
            const active = org.slug === current.slug;
            return (
              <DropdownMenuItem
                key={org.slug}
                onSelect={() => router.push(urlForSlug(org.slug))}
                className={`gap-2 text-white hover:bg-hover focus:bg-hover data-[highlighted]:bg-hover dark:hover:bg-hover dark:focus:bg-hover dark:data-[highlighted]:bg-hover ${active ? "bg-hover" : ""}`}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-primary/20 text-xs font-extrabold text-primary">
                  {org.name.charAt(0).toUpperCase()}
                </span>
                <span className="truncate font-extrabold">{org.name}</span>
                {active ? <Check className="ml-auto size-4 text-primary" aria-hidden /> : null}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator className="bg-border/50" />
          <DropdownMenuItem asChild className="text-white hover:bg-hover focus:bg-hover data-[highlighted]:bg-hover dark:hover:bg-hover dark:focus:bg-hover dark:data-[highlighted]:bg-hover">
            <Link href="/workspaces" className="gap-2 font-extrabold">Manage workspaces</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  ```
- [ ] **Step 2: Lint**
  Run: `cd frontend && pnpm lint`
  Expected: PASS (no unused vars; `onSelect` replaces `asChild` link).
- [ ] **Step 3: Commit**
  ```bash
  git add frontend/components/shell/WorkspaceSwitcher.tsx
  git commit -m "refactor(shell): make WorkspaceSwitcher slug-based and path-aware"
  ```

### Task A3: Rewrite `Sidebar` as workflow-grouped, slug-prefixed nav

**Files:**
- Modify: `frontend/components/shell/Sidebar.tsx`

**Interfaces:**
- Consumes: `currentSlug` to build `/w/[slug]/...` hrefs.
- Produces: grouped nav; fixes the broken `/dashbaord/invoices` link.

**Steps:**
- [ ] **Step 1: Replace file contents:**
  ```tsx
  "use client";
  import Image from "next/image";
  import Link from "next/link";
  import { ChevronDown, CreditCard, FileText, FolderKanban, Home, LayoutDashboard, ReceiptText, Settings, Sparkles, Users, type LucideIcon } from "lucide-react";
  import { usePathname } from "next/navigation";
  import { Avatar, AvatarFallback } from "@/components/ui/avatar";
  import { Button } from "@/components/ui/button";
  import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

  type NavItem = { href: string; label: string; icon: LucideIcon };
  type NavGroup = { label: string; items: NavItem[] };

  export type ShellUser = { name: string; email: string };

  export function Sidebar({ orgs, currentSlug, role, user }: {
    orgs: { slug: string; name: string }[];
    currentSlug: string;
    role: string;
    user: ShellUser;
  }) {
    const pathname = usePathname();
    const base = `/w/${currentSlug}`;
    const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

    const GROUPS: NavGroup[] = [
      { label: "Overview", items: [{ href: `${base}/dashboard`, label: "Dashboard", icon: Home }] },
      {
        label: "Work",
        items: [
          { href: `${base}/projects`, label: "Projects", icon: FolderKanban },
          { href: `${base}/proposals`, label: "Proposals", icon: FileText },
          { href: `${base}/clients`, label: "Clients", icon: Users },
        ],
      },
      {
        label: "Finance",
        items: [
          { href: `${base}/payments`, label: "Payments", icon: CreditCard },
          { href: `${base}/invoices`, label: "Invoices", icon: ReceiptText },
          { href: `${base}/analytics`, label: "Analytics", icon: LayoutDashboard },
        ],
      },
      { label: "AI", items: [{ href: `${base}/ai`, label: "AI Copilot", icon: Sparkles }] },
      { label: "Workspace", items: [{ href: `${base}/settings`, label: "Settings", icon: Settings }] },
    ];

    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    return (
      <aside className="z-40 flex h-screen w-72 shrink-0 flex-col border-r border-border bg-sidebar p-6 lg:sticky lg:top-0">
        <div className="flex items-center gap-4">
          <Image src="/Logo/LOGO.svg" alt="ORKA" width={42} height={42} className="size-11 object-contain" priority />
          <span className="text-[31px] font-extrabold tracking-[-0.02em] text-white">ORKA</span>
        </div>

        <div className="mt-7">
          <WorkspaceSwitcher orgs={orgs} currentSlug={currentSlug} />
        </div>

        <nav className="mt-10 flex flex-col gap-6">
          {GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="px-4 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white/35">{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    className={`h-12 w-full justify-start gap-5 rounded-[10px] px-4 text-[15px] font-extrabold ${active ? "bg-primary/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-primary/20 dark:hover:bg-primary/20" : "text-white/90 hover:bg-hover dark:hover:bg-hover"}`}
                  >
                    <Link href={item.href}>
                      <Icon className={`size-6 ${active ? "text-primary" : ""}`} aria-hidden />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="mb-5 rounded-[10px] bg-primary/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <Sparkles className="size-5 text-lime" aria-hidden />
            <p className="mt-5 text-base font-extrabold text-white">Upgrade to Pro</p>
            <p className="mt-2 max-w-[13rem] text-[15px] font-bold leading-6 text-white/70">Unlock unlimited projects, advanced analytics and priority support.</p>
            <Button className="mt-5 h-12 w-full text-sm font-extrabold">Upgrade Now</Button>
          </div>
          <div className="flex items-center gap-3 rounded-[9px] bg-hover p-4">
            <Avatar className="size-11">
              <AvatarFallback style={{ backgroundImage: "linear-gradient(to bottom right, #fb923c, #9474ff)" }} className="text-sm font-extrabold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-extrabold text-white">{user.name}</p>
              <p className="mt-1 truncate text-sm font-bold text-white/40">{user.email}</p>
            </div>
            <ChevronDown className="size-4 text-white/40" aria-hidden />
          </div>
        </div>
      </aside>
    );
  }
  ```
- [ ] **Step 2: Lint**
  Run: `cd frontend && pnpm lint`
  Expected: PASS.
- [ ] **Step 3: Commit**
  ```bash
  git add frontend/components/shell/Sidebar.tsx
  git commit -m "refactor(shell): grouped workflow sidebar with slug-prefixed routes"
  ```

### Task A4: Update `AppShell` signature to carry `currentSlug`

**Files:**
- Modify: `frontend/components/shell/AppShell.tsx`

**Steps:**
- [ ] **Step 1: Replace file contents:**
  ```tsx
  import type { ReactNode } from "react";
  import { Sidebar, type ShellUser } from "./Sidebar";
  import { MobileNav } from "./MobileNav";

  export function AppShell({
    orgs,
    currentSlug,
    role,
    user,
    children,
  }: {
    orgs: { slug: string; name: string }[];
    currentSlug: string;
    role: string;
    user: ShellUser;
    children: ReactNode;
  }) {
    return (
      <div className="product-ui dark min-h-screen bg-shell font-product text-white">
        <MobileNav orgs={orgs} currentSlug={currentSlug} role={role} user={user} />
        <div className="relative flex min-h-screen flex-col lg:flex-row">
          <div className="hidden lg:block">
            <Sidebar orgs={orgs} currentSlug={currentSlug} role={role} user={user} />
          </div>
          <main className="min-w-0 flex-1 px-4 pb-10 sm:px-6 lg:px-8 lg:py-6" id="main-content">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    );
  }
  ```
- [ ] **Step 2: Lint + typecheck**
  Run: `cd frontend && pnpm lint && pnpm exec tsc --noEmit`
  Expected: PASS.
- [ ] **Step 3: Commit**
  ```bash
  git add frontend/components/shell/AppShell.tsx
  git commit -m "refactor(shell): AppShell carries currentSlug to sidebar/switcher"
  ```

### Task A5: Build route groups + `w/[slug]` layout + collapse the two homes

**Files:**
- Create: `frontend/app/(app)/layout.tsx`
- Create: `frontend/app/(app)/w/[slug]/layout.tsx`
- Create: `frontend/app/(app)/w/[slug]/dashboard/page.tsx`
- Delete: `frontend/app/dashboard/home/page.tsx` (merged into dashboard above)
- Delete: `frontend/app/workspaces/[workspaceId]/page.tsx` (replaced by `/w/[slug]/dashboard`)
- Modify: `frontend/app/workspaces/page.tsx` (redirect chooser → default `/w/[slug]/dashboard`)

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/server`, `getActiveOrgBySlug`, `listOrgsForUser` (Task A1), `AppShell` (Task A4).
- Produces: the resolved `currentSlug` + `orgs` + `user` + `role` for all app pages.

**Steps:**
- [ ] **Step 1: Create `(app)/layout.tsx` (passthrough; future host handling):**
  ```tsx
  import type { ReactNode } from "react";
  export default function AppGroupLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
  }
  ```
- [ ] **Step 2: Create `(app)/w/[slug]/layout.tsx`:**
  ```tsx
  import { notFound, redirect } from "next/navigation";
  import { createClient } from "@/lib/supabase/server";
  import { getActiveOrgBySlug, listOrgsForUser } from "@/lib/orka";
  import { AppShell } from "@/components/shell/AppShell";

  export default async function WorkspaceLayout({
    children,
    params,
  }: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
  }) {
    const { slug } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const org = await getActiveOrgBySlug(supabase, slug);
    if (!org) notFound();

    const orgs = await listOrgsForUser(supabase, user.id);
    if (orgs.length === 0) redirect("/workspaces");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    const shellUser = {
      name: profile?.full_name ?? user.email?.split("@")[0] ?? "User",
      email: user.email ?? "",
    };

    return (
      <AppShell orgs={orgs} currentSlug={slug} role={profile?.role ?? "member"} user={shellUser}>
        {children}
      </AppShell>
    );
  }
  ```
- [ ] **Step 3: Create `(app)/w/[slug]/dashboard/page.tsx`** (consolidated home — port the metrics/activity from the old `/dashboard/home` and `/workspaces/[workspaceId]` pages):
  ```tsx
  import { PageHeader } from "@/components/shell/PageHeader";
  export default async function DashboardPage() {
    return (
      <>
        <PageHeader title="Dashboard" description="Your workspace at a glance" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Port existing metric cards from app/dashboard/home/page.tsx here */}
        </div>
      </>
    );
  }
  ```
  > Port the actual metric/activity JSX from `frontend/app/dashboard/home/page.tsx` into this file (keep its data fetches).
- [ ] **Step 4: Update `workspaces/page.tsx`** to redirect to the default workspace dashboard:
  ```tsx
  import { redirect } from "next/navigation";
  import { createClient } from "@/lib/supabase/server";
  import { listOrgsForUser } from "@/lib/orka";
  export default async function WorkspacesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const orgs = await listOrgsForUser(supabase, user.id);
    if (orgs.length === 1) redirect(`/w/${orgs[0].slug}/dashboard`);
    // else render the chooser list (keep existing chooser UI, link to /w/[slug]/dashboard)
  }
  ```
- [ ] **Step 5: Remove deprecated pages**
  Delete `frontend/app/dashboard/home/page.tsx` and `frontend/app/workspaces/[workspaceId]/page.tsx`.
- [ ] **Step 6: Build**
  Run: `cd frontend && pnpm build`
  Expected: succeeds; `/w/<slug>/dashboard` resolves for a seeded org slug.
- [ ] **Step 7: Commit**
  ```bash
  git add frontend/app/\(app\) frontend/app/workspaces/page.tsx
  git rm frontend/app/dashboard/home/page.tsx frontend/app/workspaces/\[workspaceId\]/page.tsx
  git commit -m "feat(app): add /w/[slug] group, collapse homes into dashboard"
  ```

### Task A6: Legacy redirect middleware

**Files:**
- Create: `frontend/middleware.ts`
- Modify: `frontend/next.config.mjs` (ensure `middleware` matchers allowed)

**Steps:**
- [ ] **Step 1: Create `frontend/middleware.ts`:**
  ```ts
  import { NextResponse, type NextRequest } from "next/server";

  const LEGACY_PREFIXES = ["/dashboard", "/invoices", "/proposals", "/projects", "/payments", "/settings"];

  export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    const slug = req.cookies.get("orka_active_org_slug")?.value;

    const isLegacy = LEGACY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
    if (isLegacy) {
      if (!slug) return NextResponse.redirect(new URL("/workspaces", req.url));
      const rest = pathname.replace(/^\/(dashboard|invoices|proposals|projects|payments|settings)/, "");
      return NextResponse.redirect(new URL(`/w/${slug}${rest || "/dashboard"}${search}`, req.url));
    }
    return NextResponse.next();
  }

  export const config = {
    matcher: ["/dashboard/:path*", "/invoices/:path*", "/proposals/:path*", "/projects/:path*", "/payments/:path*", "/settings/:path*"],
  };
  ```
- [ ] **Step 2: Set the `orka_active_org_slug` cookie in `w/[slug]/layout.tsx`**
  Add after org resolution in `(app)/w/[slug]/layout.tsx`:
  ```ts
  const res = NextResponse.next();
  res.cookies.set("orka_active_org_slug", slug, { path: "/", sameSite: "lax" });
  ```
  (import `NextResponse` from `next/server` and return `res` wrapping children — see Task A7 note.)
- [ ] **Step 3: Build + lint**
  Run: `cd frontend && pnpm build && pnpm lint`
  Expected: PASS.
- [ ] **Step 4: Commit**
  ```bash
  git add frontend/middleware.ts frontend/app/\(app\)/w/\[slug\]/layout.tsx frontend/next.config.mjs
  git commit -m "feat: legacy /dashboard redirects to /w/[slug] via middleware"
  ```

---

## Phase B — Detail tabs via `?tab=`

### Task B1: Shared `Tabs` component

**Files:**
- Create: `frontend/components/shell/Tabs.tsx`
- Create: `frontend/components/shell/PageHeader.tsx` (used by all pages)

**Steps:**
- [ ] **Step 1: Create `Tabs.tsx`:**
  ```tsx
  "use client";
  import Link from "next/link";
  import { useSearchParams } from "next/navigation";
  import type { TabDef } from "./Tabs";

  export function Tabs({ tabs, basePath }: { tabs: TabDef[]; basePath: string }) {
    const params = useSearchParams();
    const active = params.get("tab") ?? tabs[0]?.id;
    return (
      <div className="flex flex-wrap gap-1 border-b border-border">
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <Link
              key={t.id}
              href={`${basePath}?tab=${t.id}`}
              className={`rounded-t-[8px] px-4 py-2.5 text-sm font-extrabold ${isActive ? "border-b-2 border-primary text-white" : "text-white/50 hover:text-white"}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>
    );
  }
  ```
- [ ] **Step 2: Create `PageHeader.tsx`:**
  ```tsx
  export function PageHeader({ title, description }: { title: string; description?: string }) {
    return (
      <div>
        <h1 className="text-2xl font-extrabold tracking-[-0.01em] text-white">{title}</h1>
        {description ? <p className="mt-1 text-sm font-bold text-white/50">{description}</p> : null}
      </div>
    );
  }
  ```
- [ ] **Step 3: Lint + build**
  Run: `cd frontend && pnpm lint && pnpm build`
  Expected: PASS.
- [ ] **Step 4: Commit**
  ```bash
  git add frontend/components/shell/Tabs.tsx frontend/components/shell/PageHeader.tsx
  git commit -m "feat(shell): add Tabs (?tab=) and PageHeader components"
  ```

### Task B2: Refactor `projects/[id]` to `?tab=` tabs

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/[id]/page.tsx`
- Delete: `frontend/app/dashboard/projects/[id]/page.tsx`

**Steps:**
- [ ] **Step 1: Create the tabbed project page:**
  ```tsx
  import { PageHeader } from "@/components/shell/PageHeader";
  import { Tabs, type TabDef } from "@/components/shell/Tabs";

  const PROJECT_TABS: TabDef[] = [
    { id: "timeline", label: "Timeline" },
    { id: "proposal", label: "Proposal" },
    { id: "contract", label: "Contract" },
    { id: "escrow", label: "Escrow" },
    { id: "milestones", label: "Milestones" },
    { id: "payments", label: "Payments" },
    { id: "files", label: "Files" },
    { id: "activity", label: "Activity" },
  ];

  export default async function ProjectDetailPage({
    params,
  }: {
    params: Promise<{ slug: string; id: string }>;
  }) {
    const { slug, id } = await params;
    // Port existing project data fetch + the per-tab panels from dashboard/projects/[id]/page.tsx,
    // switching each section to render when the active tab matches.
    return (
      <>
        <PageHeader title="Project" description={`${id}`} />
        <Tabs tabs={PROJECT_TABS} basePath={`/w/${slug}/projects/${id}`} />
        {/* render the active tab panel here (port existing JSX) */}
      </>
    );
  }
  ```
- [ ] **Step 2: Delete old route:** `git rm frontend/app/dashboard/projects/[id]/page.tsx`
- [ ] **Step 3: Build**
  Run: `cd frontend && pnpm build`
  Expected: PASS.
- [ ] **Step 4: Commit**
  ```bash
  git add frontend/app/\(app\)/w/\[slug\]/projects/\[id\]/page.tsx
  git rm frontend/app/dashboard/projects/\[id\]/page.tsx
  git commit -m "refactor(projects): tabbed detail page under /w/[slug]"
  ```

### Task B3: Refactor `settings` to `?tab=` tabs

**Files:**
- Create: `frontend/app/(app)/w/[slug]/settings/page.tsx`
- Delete: `frontend/app/dashboard/settings/page.tsx`

**Steps:**
- [ ] **Step 1: Create tabbed settings page:**
  ```tsx
  import { PageHeader } from "@/components/shell/PageHeader";
  import { Tabs, type TabDef } from "@/components/shell/Tabs";

  const SETTINGS_TABS: TabDef[] = [
    { id: "workspace", label: "Workspace" },
    { id: "members", label: "Members" },
    { id: "billing", label: "Billing" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
    { id: "integrations", label: "Integrations" },
    { id: "apikeys", label: "API Keys" },
    { id: "privacy", label: "Privacy" },
  ];

  export default async function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
      <>
        <PageHeader title="Settings" description="Manage your workspace" />
        <Tabs tabs={SETTINGS_TABS} basePath={`/w/${slug}/settings`} />
        {/* port existing settings panels, render by active tab */}
      </>
    );
  }
  ```
- [ ] **Step 2: Delete old route:** `git rm frontend/app/dashboard/settings/page.tsx`
- [ ] **Step 3: Build + commit** (mirror Task B2 steps 3–4).

---

## Phase C — Net-new app areas (Clients, Analytics, AI, Notifications, Search)

> Each page below is a real, self-contained component. Wire to existing data where a query exists; otherwise render an empty-state `Card` with a clear "coming together with backend" note (no fake data). Keep them under `frontend/app/(app)/w/[slug]/`.

### Task C1: Work pages — Projects, Proposals, Clients lists

**Files:**
- Create: `frontend/app/(app)/w/[slug]/projects/page.tsx` (port from `dashboard/projects`)
- Create: `frontend/app/(app)/w/[slug]/proposals/page.tsx` (port from `dashboard/proposals`)
- Create: `frontend/app/(app)/w/[slug]/proposals/new/page.tsx` (port from `dashboard/proposals/new`)
- Create: `frontend/app/(app)/w/[slug]/clients/page.tsx` (new)
- Create: `frontend/app/(app)/w/[slug]/clients/[id]/page.tsx` (new, tabbed like projects)
- Delete: `frontend/app/dashboard/projects/page.tsx`, `frontend/app/dashboard/proposals/page.tsx`, `frontend/app/dashboard/proposals/new/page.tsx`

**Steps:**
- [ ] **Step 1: Port projects/proposals list pages** into the new paths (replace `/dashboard/...` internal links with `/w/${slug}/...`). Keep their data fetches.
- [ ] **Step 2: Create `clients/page.tsx`:**
  ```tsx
  import { PageHeader } from "@/components/shell/PageHeader";
  import { Card } from "@/components/ui/card";
  export default async function ClientsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
      <>
        <PageHeader title="Clients" description="People and companies you work with" />
        <Card className="p-6 text-white/60">No clients yet — they'll appear here once you link a project owner.</Card>
      </>
    );
  }
  ```
- [ ] **Step 3: Create `clients/[id]/page.tsx`** (tabbed: overview, projects, payments, invoices, activity, notes, documents) using the same `Tabs` pattern as projects.
- [ ] **Step 4: Delete old `dashboard/projects`, `dashboard/proposals` routes.**
- [ ] **Step 5: Build + commit** (mirror Task A6 steps 3–4).

### Task C2: Finance pages — Payments, Invoices, Analytics

**Files:**
- Create: `frontend/app/(app)/w/[slug]/payments/page.tsx` (port from `dashboard/payments`)
- Create: `frontend/app/(app)/w/[slug]/payments/[id]/page.tsx` (new)
- Create: `frontend/app/(app)/w/[slug]/invoices/page.tsx` (port from `dashboard/invoices`)
- Create: `frontend/app/(app)/w/[slug]/invoices/[id]/page.tsx` (new)
- Create: `frontend/app/(app)/w/[slug]/analytics/page.tsx` (new)
- Delete: `frontend/app/dashboard/payments/page.tsx`, `frontend/app/dashboard/invoices/page.tsx`

**Steps:**
- [ ] **Step 1: Port payments/invoices list pages** to new paths (fix the old `/dashbaord/invoices` typo by using `/w/${slug}/invoices`).
- [ ] **Step 2: Create `payments/[id]/page.tsx` and `invoices/[id]/page.tsx`** as detail pages (Card with payment/invoice summary; real fields once backend returns them).
- [ ] **Step 3: Create `analytics/page.tsx`:**
  ```tsx
  import { PageHeader } from "@/components/shell/PageHeader";
  import { Card } from "@/components/ui/card";
  export default async function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
      <>
        <PageHeader title="Analytics" description="Revenue, utilization and delivery insights" />
        <Card className="p-6 text-white/60">Charts land here once usage events are streamed from the backend.</Card>
      </>
    );
  }
  ```
- [ ] **Step 4: Delete old `dashboard/payments`, `dashboard/invoices` routes.**
- [ ] **Step 5: Build + commit.**

### Task C3: AI Copilot, Notifications, Search

**Files:**
- Create: `frontend/app/(app)/w/[slug]/ai/page.tsx`
- Create: `frontend/app/(app)/w/[slug]/ai/[chatId]/page.tsx`
- Create: `frontend/app/(app)/w/[slug]/notifications/page.tsx`
- Create: `frontend/app/(app)/w/[slug]/search/page.tsx`

**Steps:**
- [ ] **Step 1: Create `ai/page.tsx`** (chat list / new chat) and `ai/[chatId]/page.tsx` (conversation view; wire to `/ai/search?q=` later).
- [ ] **Step 2: Create `notifications/page.tsx`** (list of notification cards; empty state if none).
- [ ] **Step 3: Create `search/page.tsx`:**
  ```tsx
  import { PageHeader } from "@/components/shell/PageHeader";
  import { useSearchParams } from "next/navigation";
  export default function SearchPage() {
    const q = useSearchParams().get("q") ?? "";
    return (
      <>
        <PageHeader title="Search" description={q ? `Results for "${q}"` : "Search projects, clients and invoices"} />
        {/* wire to a search index when available */}
      </>
    );
  }
  ```
  (mark `"use client"` at top — this file uses `useSearchParams`.)
- [ ] **Step 4: Build + commit.**

---

## Phase D — Public client portal (`/p/[token]`)

### Task D1: Token-addressed, no-auth portal

**Files:**
- Create: `frontend/app/p/[projectToken]/layout.tsx` (minimal shell, NO AppShell/Sidebar)
- Create: `frontend/app/p/[projectToken]/page.tsx` (`?tab=` portal view)
- Create: `frontend/lib/portal.ts` (`getPortalProject(token)` — resolves a project by share token; returns null if invalid/expired)

**Steps:**
- [ ] **Step 1: Create `lib/portal.ts`:**
  ```ts
  import { createClient } from "@/lib/supabase/server";
  export async function getPortalProject(token: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, status, shared_token, shared_token_expires_at")
      .eq("shared_token", token)
      .maybeSingle();
    if (error || !data) return null;
    if (data.shared_token_expires_at && new Date(data.shared_token_expires_at) < new Date()) return null;
    return data;
  }
  ```
- [ ] **Step 2: Create `p/[projectToken]/layout.tsx`** — a clean public layout (logo + centered container), no auth.
- [ ] **Step 3: Create `p/[projectToken]/page.tsx`** — `notFound()` if `getPortalProject` returns null; else render read-only project info with `Tabs` (timeline, proposal, milestones, files — read-only).
- [ ] **Step 4: Build + commit.**

---

## Phase E — Auth + marketing pages

### Task E1: Auth route group + new auth pages

**Files:**
- Create: `frontend/app/(auth)/layout.tsx` (centered card)
- Create: `frontend/app/(auth)/forgot-password/page.tsx`
- Create: `frontend/app/(auth)/reset-password/page.tsx`
- Create: `frontend/app/(auth)/verify-email/page.tsx`
- Create: `frontend/app/(auth)/invite/[token]/page.tsx`
- Keep: `frontend/app/login`, `frontend/app/signup`, `frontend/app/auth/callback/route.ts`

**Steps:**
- [ ] **Step 1: Create `(auth)/layout.tsx`** — centered branded card (reuse `bg-shell`, logo).
- [ ] **Step 2: Create the four new auth pages** with forms that call Supabase auth methods (`.resetPasswordForEmail`, `.updateUser`, `.verifyOtp`) — UI only; backend email templates are a follow-up (flagged in design doc §7).
- [ ] **Step 3: Build + commit.**

### Task E2: Marketing pages

**Files:**
- Create: `frontend/app/(marketing)/layout.tsx` (public nav + footer)
- Create: `frontend/app/(marketing)/pricing/page.tsx`
- Create: `frontend/app/(marketing)/blog/page.tsx`
- Create: `frontend/app/(marketing)/contact/page.tsx`
- Keep: `frontend/app/page.tsx` (landing), `frontend/app/about`, `frontend/app/docs`

**Steps:**
- [ ] **Step 1: Create `(marketing)/layout.tsx`** with a public header (links to `/login`, `/signup`, `/pricing`, `/blog`, `/contact`, `/docs`) and footer.
- [ ] **Step 2: Create `pricing`, `blog`, `contact` pages** (real marketing sections; pricing tiers, blog list stub, contact form).
- [ ] **Step 3: Build + commit.**

---

## Phase F — Polish

### Task F1: Delete deprecated `dashboard` group & final verification

**Files:**
- Delete: `frontend/app/dashboard/layout.tsx` and any remaining `frontend/app/dashboard/**`
- Modify: `frontend/AGENTS.md` (note new IA)

**Steps:**
- [ ] **Step 1: Remove the old `dashboard` route group** (all pages now live under `(app)/w/[slug]`).
- [ ] **Step 2: Full build + lint**
  Run: `cd frontend && pnpm lint && pnpm build`
  Expected: PASS, no broken internal links.
- [ ] **Step 3: Manual smoke check** — load `/`, `/login`, `/w/<slug>/dashboard`, `/w/<slug>/projects`, `/w/<slug>/clients`, `/w/<slug>/analytics`, `/w/<slug>/ai`, `/p/<token>`; confirm grouped sidebar + `?tab=` switching.
- [ ] **Step 4: Commit + push**
  ```bash
  git add -A
  git commit -m "chore: remove legacy dashboard group; finalize /w/[slug] IA"
  git push -u origin dev
  ```

---

## Self-Review (against design doc)

1. **Spec coverage:** D1 single-domain `/w/[slug]` → Phase A/E routes. D2 slug identity → A1/A5 + cookie. D3 `?tab=` → Phase B + portal. D4 grouped sidebar → A3. D5 UUIDs → all detail pages use `[id]`. D6 portal → Phase D. New areas (clients/analytics/ai/notifications/search) → Phase C. Auth/marketing → Phase E. Legacy redirects → A6. ✓
2. **Placeholder scan:** Leaf pages use explicit `Card` empty-states rather than "TODO". Porting notes reference exact source files. No "implement later" stubs left in committed code.
3. **Type consistency:** `OrgSummary`, `getActiveOrgBySlug`, `listOrgsForUser`, `Tabs`/`TabDef`, `ShellUser`, `WorkspaceSwitcher`/`Sidebar`/`AppShell` signatures are consistent across all tasks. ✗→ fixed: `Sidebar`/`AppShell`/`WorkspaceSwitcher` all use `{slug, name}[]` + `currentSlug`; `MobileNav` (Task A-implied) must propagate `currentSlug` — update `MobileNav` to pass `currentSlug` through (same prop shape as Sidebar).

> **Open follow-ups (not in this plan):** prefixed public IDs (`proj_…`), subdomain middleware for `app.`/`portal.`, backend email templates for auth flows, client account area.
