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
