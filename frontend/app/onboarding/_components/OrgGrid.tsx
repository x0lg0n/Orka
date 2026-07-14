"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, CircleDollarSign, Users } from "lucide-react";
import { SearchField } from "../../../components/shell/SearchField";
import { Card } from "../../../components/ui/Card";
import { StatusPill } from "../../../components/ui/StatusPill";
import { EmptyState } from "../../../components/ui/EmptyState";
import type { Org } from "../page";

export function OrgGrid({ orgs }: { orgs: Org[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(
    () => orgs.filter((o) => o.name.toLowerCase().includes(q.toLowerCase().trim())),
    [orgs, q],
  );

  return (
    <div className="flex flex-col gap-6">
      <SearchField value={q} onChange={setQ} placeholder="Search organizations..." />
      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No workspaces match"
          description="Try a different search term, or create a new organization."
        />
      ) : (
        <div className="grid gap-7 lg:grid-cols-3">
          {filtered.map((org) => (
            <Card key={org.id} className="flex min-h-[354px] flex-col transition hover:border-primary/40">
              <div className="flex items-start justify-between">
                <div className="grid size-14 place-items-center rounded-[8px] bg-gradient-to-br from-primary/30 to-orange/30 text-2xl font-extrabold text-white">
                  {org.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-white">{org.name}</h2>
                <StatusPill status="neutral" label={ROLE_LABEL[org.role] ?? org.role} />
              </div>
              <p className="mt-4 text-base font-bold leading-7 text-white/50">
                Manage projects, clients, and freelancers in one place.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-5">
                <OrgStat icon={CircleDollarSign} label="Currency" value={org.currency} />
                <OrgStat icon={Users} label="Members" value={String(org.members)} />
                <OrgStat icon={Building2} label="Role" value={ROLE_LABEL[org.role] ?? org.role} />
              </div>
              <Link href="/dashboard/projects" className="btn btn-secondary mt-6 w-full">
                Enter workspace
                <ArrowRight size={16} aria-hidden />
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = { owner: "Owner", admin: "Admin", member: "Member" };

function OrgStat({ icon: Icon, value, label }: { icon: typeof Building2; value: string; label: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[15px] font-extrabold text-white">
        <Icon className="size-4 text-white/40" aria-hidden />
        {value}
      </div>
      <p className="mt-3 text-[15px] font-bold text-white/40">{label}</p>
    </div>
  );
}
