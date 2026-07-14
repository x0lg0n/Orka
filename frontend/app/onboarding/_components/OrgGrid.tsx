"use client";
import { useMemo, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Building2, CircleDollarSign, Ellipsis, Plus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SearchField } from "../../../components/shell/SearchField";
import { Card } from "../../../components/ui/Card";
import { StatusPill } from "../../../components/ui/StatusPill";
import { EmptyState } from "../../../components/ui/EmptyState";
import { selectOrg } from "../../actions";
import CreateOrgModal from "./CreateOrgModal";
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
                <div className="grid size-14 place-items-center rounded-[8px] bg-primary text-2xl font-extrabold text-white shadow-[0_8px_20px_rgba(148,116,255,0.25)]">
                  {org.name.charAt(0).toUpperCase()}
                </div>
                <Ellipsis className="size-5 text-white/40" aria-hidden />
              </div>
              <div className="mt-6 flex items-center gap-3">
                <h2 className="text-[22px] font-extrabold tracking-[-0.02em] text-white">{org.name}</h2>
                <StatusPill status="neutral" label={ROLE_LABEL[org.role] ?? org.role} />
              </div>
              <p className="mt-4 text-base font-bold leading-7 text-white/50">
                Manage projects, clients, and freelancers in one place.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-4 border-t border-border pt-5">
                <OrgStat icon={BriefcaseBusiness} label="Projects" value={String(org.projects)} />
                <OrgStat icon={Users} label={org.members === 1 ? "Member" : "Members"} value={String(org.members)} />
                <OrgStat icon={CircleDollarSign} label="Currency" value={org.currency} />
              </div>
              <form action={selectOrg} className="mt-6">
                <input type="hidden" name="orgId" value={org.id} />
                <button type="submit" className="btn btn-secondary w-full">
                  Enter workspace
                  <ArrowRight size={16} aria-hidden />
                </button>
              </form>
            </Card>
          ))}
          <CreateOrgModal
            trigger={
              <span className="group flex min-h-[354px] flex-col items-center justify-center rounded-card border border-dashed border-white/20 bg-white/[0.02] p-7 text-center transition hover:border-primary hover:bg-primary/[0.04]">
                <span className="grid size-14 place-items-center rounded-full border border-primary text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Plus className="size-7" aria-hidden />
                </span>
                <span className="mt-6 text-[21px] font-extrabold tracking-[-0.02em] text-white">New organization</span>
                <span className="mt-4 max-w-[18rem] text-base font-bold leading-7 text-white/50">Create a new workspace to manage your projects and clients.</span>
                <span className="btn btn-primary mt-6 h-12 px-6">Create new <ArrowRight size={16} aria-hidden /></span>
              </span>
            }
          />
        </div>
      )}
    </div>
  );
}

const ROLE_LABEL: Record<string, string> = { owner: "Owner", admin: "Admin", member: "Member" };

function OrgStat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
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
