"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  Plus,
  Search,
  Users,
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[16px] border border-border bg-card p-12 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-primary/15 text-primary">
            <Building2 className="size-7" aria-hidden />
          </div>
          <div>
            <p className="text-2xl font-extrabold tracking-[-0.02em]">Welcome to Orka</p>
            <p className="mt-2 max-w-sm text-base font-bold text-muted-foreground">
              Let&apos;s create your first workspace.
            </p>
          </div>
          <Button asChild size="lg" className="mt-2">
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
        <div className="grid gap-6 lg:grid-cols-3 sm:grid-cols-2">
          {filtered.map((w) => (
            <WorkspaceCard key={w.id} workspace={w} />
          ))}
           <Link
            href="/workspaces/new"
            className="group flex min-h-[280px] flex-col items-center justify-center rounded-[16px] border border-dashed border-border bg-card p-7 text-center transition hover:border-primary hover:bg-primary/[0.04]"
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
          <Link href="/workspaces/new" className="text-primary hover:underline">
            Create New Workspace
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function WorkspaceCard({ workspace: w }: { workspace: Workspace }) {
  return (
    <Card className="flex min-h-[280px] flex-col rounded-[16px] border-border p-5 transition duration-200 hover:scale-[1.01] hover:border-primary hover:shadow-[0_12px_30px_rgba(148,116,255,0.18)]">
      <div className="flex items-start justify-between">
        <Avatar className="size-12 rounded-[10px]">
          {w.logoUrl ? <AvatarImage src={w.logoUrl} alt={w.name} /> : null}
          <AvatarFallback className="rounded-[10px] bg-primary text-xl font-extrabold text-white">
            {w.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap justify-end gap-2">
          {w.type ? <Badge variant="secondary">{TYPE_LABEL[w.type] ?? w.type}</Badge> : null}
          {w.role === "owner" ? (
            <Badge variant="outline" className="border-primary/40 text-primary">
              Owner
            </Badge>
          ) : null}
        </div>
      </div>

      <h2 className="mt-4 text-[19px] font-extrabold tracking-[-0.02em] text-foreground">{w.name}</h2>
      <p className="mt-1.5 text-sm font-bold text-muted-foreground">Last active {formatLastActive(w.lastActive)}</p>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
        <Stat icon={BriefcaseBusiness} label="Projects" value={String(w.projects)} />
        <Stat icon={Users} label="Clients" value={String(w.clients)} />
        <Stat icon={CircleDollarSign} label="Members" value={String(w.members)} />
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
