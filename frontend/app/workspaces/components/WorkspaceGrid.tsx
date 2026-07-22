"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Plus,
  Search,
  Users,
  UsersRound,
  BriefcaseBusiness,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import Link from "next/link";

export type Workspace = {
  id: string;
  name: string;
  slug: string | null;
  type: string | null;
  logoUrl: string | null;
  role: string;
  projects: number;
  clients: number;
  members: number;
  lastActive: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  freelancer: "Freelancer",
  agency: "Agency",
  studio: "Studio",
  consultancy: "Consultancy",
  startup: "Startup",
};

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

function formatLastActive(iso: string | null): string {
  if (!iso) return "—";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function WorkspaceGrid({ workspaces }: { workspaces: Workspace[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    if (!term) return workspaces;
    return workspaces.filter(
      (w) =>
        w.name.toLowerCase().includes(term) ||
        (w.type && TYPE_LABEL[w.type]?.toLowerCase().includes(term)) ||
        ROLE_LABEL[w.role]?.toLowerCase().includes(term),
    );
  }, [workspaces, q]);

  return (
    <div className="mt-8 flex flex-col gap-6">
      {workspaces.length > 0 ? (
        <div className="flex flex-col gap-4 rounded-[14px] bg-muted/40 px-0 py-0 sm:flex-row sm:items-center sm:px-5 sm:py-3">
          <div className="relative w-full sm:max-w-[460px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search workspaces..."
              className="pl-12"
            />
          </div>
          <Button asChild size="sm" className="shrink-0 sm:ml-auto">
            <Link href="/workspaces/new">
              <Plus className="size-4" aria-hidden /> New workspace
            </Link>
          </Button>
        </div>
      ) : null}

      {workspaces.length === 0 ? (
        <div className="relative max-w-2xl overflow-hidden rounded-[16px] border border-border bg-card p-7 sm:p-10">
          <div className="pointer-events-none absolute -bottom-12 -right-12 size-48 rounded-full bg-primary/[0.03]" aria-hidden />
          <div className="pointer-events-none absolute -right-4 -top-4 size-24 rounded-full bg-primary/[0.02]" aria-hidden />
          <div className="grid size-12 place-items-center rounded-[10px] bg-primary/15 text-primary">
            <Building2 className="size-6" aria-hidden />
          </div>
          <div className="mt-6">
            <p className="text-2xl font-extrabold tracking-[-0.02em] text-foreground">Set up your workspace</p>
            <p className="mt-2 max-w-lg text-base font-bold leading-7 text-muted-foreground">
              Give it a name and URL. You can invite collaborators and add your first project next.
            </p>
          </div>
          <Button asChild size="lg" className="mt-7">
            <Link href="/workspaces/new">
              <Plus className="size-4" aria-hidden /> Create Workspace
            </Link>
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[16px] border border-border bg-card p-10 text-center">
          <Building2 className="size-8 text-muted-foreground" aria-hidden />
          <p className="text-lg font-extrabold text-foreground">No workspaces match</p>
          <p className="max-w-sm text-sm font-bold text-muted-foreground">
            Try a different search term, or create a new workspace.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <WorkspaceCard key={w.id} workspace={w} />
          ))}
           <Link
            href="/workspaces/new"
            className="group flex flex-col items-center justify-center rounded-[16px] border border-dashed border-border bg-card p-7 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-primary/[0.04] hover:shadow-md"
          >
            <span className="grid size-14 place-items-center rounded-full border border-primary text-primary transition group-hover:bg-primary group-hover:text-white">
              <Plus className="size-7" aria-hidden />
            </span>
            <span className="mt-6 text-[21px] font-extrabold tracking-[-0.02em] text-foreground">New workspace</span>
            <span className="mt-4 max-w-[18rem] text-base font-bold leading-7 text-muted-foreground">
              Create a new workspace to manage your projects and clients.
            </span>
          </Link>
        </div>
      )}

      {workspaces.length > 0 ? (
        <p className="flex items-center justify-center gap-2 pt-2 text-sm font-bold text-muted-foreground">
          Can&apos;t find your workspace?{" "}
          <Link href="/workspaces/new" className="whitespace-nowrap text-primary underline-offset-2 hover:underline">
            Create New Workspace
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function WorkspaceCard({ workspace: w }: { workspace: Workspace }) {
  const lastActive = formatLastActive(w.lastActive);
  const lastActiveLabel = lastActive === "Today" ? "Active today" : `Last active ${lastActive}`;

  return (
    <Card className="flex flex-col rounded-[16px] border-border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
      <div className="flex items-start justify-between">
        <Avatar className="size-12 rounded-[10px]">
          {w.logoUrl ? <AvatarImage src={w.logoUrl} alt={w.name} /> : null}
          <AvatarFallback className="rounded-[10px] bg-primary text-xl font-extrabold text-white">
            {w.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap justify-end gap-2">
          {w.type ? <Badge variant="secondary">{TYPE_LABEL[w.type] ?? w.type}</Badge> : null}
          <Badge variant="outline" className="border-primary/40 text-primary">
            {ROLE_LABEL[w.role] ?? w.role}
          </Badge>
        </div>
      </div>

      <h2 className="mt-4 text-[19px] font-extrabold tracking-[-0.02em] text-foreground">{w.name}</h2>
      <p className="mt-1.5 text-sm font-bold text-muted-foreground">{lastActiveLabel}</p>

      <div className="mt-4 grid grid-cols-3 items-start gap-3 border-t border-border pt-4">
        <Stat icon={BriefcaseBusiness} label="Projects" value={String(w.projects)} />
        <Stat icon={Users} label="Clients" value={String(w.clients)} />
        <Stat icon={UsersRound} label="Members" value={String(w.members)} />
      </div>

      <Button asChild className="mt-auto w-full">
        <Link href={w.slug ? `/w/${w.slug}/dashboard` : "/workspaces"}>
          Open workspace
          <ArrowRight size={16} aria-hidden />
        </Link>
      </Button>
    </Card>
  );
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[15px] font-extrabold text-foreground">
        <Icon className="size-4 text-muted-foreground" aria-hidden />
        {value}
      </div>
      <p className="mt-2 text-[13px] font-bold text-muted-foreground">{label}</p>
    </div>
  );
}
