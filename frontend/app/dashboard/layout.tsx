import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "../../lib/supabase/server";
import { getActiveOrgId } from "../../lib/orka";
import { AppShell } from "../../components/shell/AppShell";

export default async function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const activeOrgId = await getActiveOrgId(supabase);
  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", activeOrgId ?? "")
    .eq("user_id", user.id)
    .maybeSingle();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();

  const role = (member?.role as string) ?? "member";
  const name = (profile?.full_name as string | null) ?? (user.user_metadata?.full_name as string | null) ?? "";
  const { data: orgs } = await supabase
    .from("organization_members")
    .select("organizations(id, name)")
    .eq("user_id", user.id);

  const workspaceList = (orgs ?? [])
    .map((m) => {
      const org = Array.isArray(m.organizations) ? m.organizations[0] : m.organizations;
      return org ? { id: org.id, name: org.name } : null;
    })
    .filter((o): o is { id: string; name: string } => o !== null);

  return (
    <AppShell orgs={workspaceList} role={role} user={{ name: name || (user.email ?? ""), email: user.email ?? "" }}>
      {children}
    </AppShell>
  );
}
