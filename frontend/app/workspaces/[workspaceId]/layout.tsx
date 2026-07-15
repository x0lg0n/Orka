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
