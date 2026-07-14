import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/shell/AppShell";
import { PageHeader } from "../../components/shell/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import CreateOrgModal from "./_components/CreateOrgModal";
import { OrgGrid } from "./_components/OrgGrid";

export const metadata = { title: "Your organizations · ORKA" };

export type Org = {
  id: string;
  name: string;
  role: string;
  projects: number;
  members: number;
  currency: string;
};

const ROLE_LABEL: Record<string, string> = { owner: "Owner", admin: "Admin", member: "Member" };

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { data: members, error } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name, slug, currency)")
    .eq("user_id", user.id);

  const { error: searchError } = await searchParams;

  const orgs: Org[] = (members ?? [])
    .map((m) => {
      const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations;
      if (!org) return null;
      return {
        id: org.id,
        name: org.name,
        role: m.role,
        projects: 0,
        members: 0,
        currency: (org.currency as string) ?? "USDC",
      };
    })
    .filter((o): o is Org => o !== null);

  const name =
    (user.user_metadata?.full_name as string | null) ??
    (user.email ? user.email.split("@")[0] : "Workspace Owner");

  return (
    <AppShell
      orgs={orgs.map((o) => ({ id: o.id, name: o.name }))}
      role={orgs[0]?.role ?? "member"}
      user={{ name, email: user.email ?? "" }}
    >
      <PageHeader
        title="Your Organizations"
        description="All the organizations / workspaces you belong to."
        actions={
          <CreateOrgModal
            trigger={
              <span className="btn btn-primary">
                <Building2 size={20} aria-hidden />
                New organization
              </span>
            }
          />
        }
      />

      {searchError ? (
        <div className="max-w-[410px] rounded-[9px] border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-bold text-red-100">
          {searchError}
        </div>
      ) : null}

      {error ? (
        <EmptyState
          icon={Building2}
          title="Couldn’t load your workspaces"
          description="Something went wrong reaching the server. Please try again in a moment."
        />
      ) : orgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Create your first workspace"
          description="Organizations are where your projects, clients, and freelancers live. Spin one up to get started."
          action={
            <CreateOrgModal
              trigger={
                <span className="btn btn-primary">
                  <Building2 size={20} aria-hidden />
                  New organization
                </span>
              }
            />
          }
        />
      ) : (
        <OrgGrid orgs={orgs} />
      )}
    </AppShell>
  );
}
