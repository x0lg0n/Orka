import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { WorkspaceNav } from "../../components/shell/WorkspaceNav";
import { WorkspaceGrid, type Workspace } from "./components/WorkspaceGrid";

export const metadata = { title: "Choose a Workspace · ORKA" };

function formatLastActive(iso: string | null): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function WorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { error } = await searchParams;

  const { data: members } = await supabase
    .from("organization_members")
    .select("role, organizations(id, name, slug, type, logo_url, updated_at)")
    .eq("user_id", user.id);

  const workspaces: Workspace[] = (
    await Promise.all(
      (members ?? []).map(async (membership) => {
        const organization = Array.isArray(membership.organizations)
          ? membership.organizations[0]
          : membership.organizations;
        if (!organization) return null;

        const [projects, clients, roster, last] = await Promise.all([
          supabase.from("projects").select("id", { count: "exact", head: true }).eq("org_id", organization.id),
          supabase.from("clients").select("id", { count: "exact", head: true }).eq("org_id", organization.id),
          supabase.from("organization_members").select("user_id", { count: "exact", head: true }).eq("org_id", organization.id),
          supabase
            .from("projects")
            .select("updated_at")
            .eq("org_id", organization.id)
            .order("updated_at", { ascending: false })
            .limit(1),
        ]);

        const lastActive =
          (last.data?.[0]?.updated_at as string | undefined) ?? (organization.updated_at as string | undefined) ?? null;

        return {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          type: (organization.type as string | null) ?? null,
          logoUrl: (organization.logo_url as string | null) ?? null,
          role: String(membership.role ?? "member"),
          projects: projects.count ?? 0,
          clients: clients.count ?? 0,
          members: roster.count ?? 0,
          lastActive,
        } satisfies Workspace;
      }),
    )
  ).filter((w): w is Workspace => w !== null);

  const name =
    (user.user_metadata?.full_name as string | null) ??
    (user.email ? user.email.split("@")[0] : "Workspace Owner");
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="product-ui dashboard-light min-h-screen bg-shell font-product">
      <WorkspaceNav name={name} initials={initials} />

      <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-extrabold tracking-[-0.035em] text-foreground sm:text-[38px]">Choose a Workspace</h1>
          <p className="text-[15px] font-bold text-muted-foreground sm:text-[16px]">
            Select a workspace to continue or create a new one.
          </p>
        </div>

        {error ? (
          <p className="mt-6 max-w-120 rounded-[10px] border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-bold text-red-100">
            {error}
          </p>
        ) : null}

        <WorkspaceGrid workspaces={workspaces} />
      </div>
    </main>
  );
}
