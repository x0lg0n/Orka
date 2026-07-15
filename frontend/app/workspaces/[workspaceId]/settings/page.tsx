import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { EditWorkspaceForm } from "./_components/EditWorkspaceForm";
import { DeleteWorkspaceDialog } from "./_components/DeleteWorkspaceDialog";

export default async function WorkspaceSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { workspaceId } = await params;
  const { updated, error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const { data: orgRow } = await supabase
    .from("organizations")
    .select("id, name, slug, type, logo_url")
    .eq("id", workspaceId)
    .maybeSingle();
  if (!orgRow) redirect("/workspaces");

  const { data: member } = await supabase
    .from("organization_members")
    .select("role")
    .eq("org_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();
  const isOwner = member?.role === "owner";

  return (
    <main className="flex-1 px-5 py-8 sm:px-8">
      <div className="mx-auto w-full max-w-[760px]">
        <h1 className="text-[26px] font-extrabold tracking-[-0.03em]">Workspace settings</h1>

        {updated ? (
          <p className="mt-4 rounded-[10px] border border-orka-success/35 bg-orka-success/10 px-4 py-3 text-sm font-bold text-green-100">
            Workspace updated.
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-[10px] border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-bold text-red-100">
            {error}
          </p>
        ) : null}

        {isOwner ? (
          <>
            <p className="mb-3 mt-6 text-sm font-bold uppercase tracking-wide text-white/40">Details</p>
            <EditWorkspaceForm
              id={orgRow.id}
              defaultValues={{
                name: orgRow.name,
                slug: (orgRow.slug as string | null) ?? null,
                type: (orgRow.type as string | null) ?? null,
                logoUrl: (orgRow.logo_url as string | null) ?? null,
              }}
            />

            <p className="mb-3 mt-10 text-sm font-bold uppercase tracking-wide text-white/40">Danger zone</p>
            <Card className="border-danger/30 bg-panel p-6">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-extrabold text-white">Delete this workspace</p>
                  <p className="mt-1 text-sm font-bold text-white/50">
                    Permanently remove the workspace and all of its data. This cannot be undone.
                  </p>
                </div>
                <DeleteWorkspaceDialog id={orgRow.id} name={orgRow.name} />
              </div>
            </Card>
          </>
        ) : (
          <Card className="mt-6 border-border bg-panel p-6">
            <p className="text-sm font-bold text-white/70">
              Only the workspace owner can edit these settings.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-bold text-white/40">Name</dt>
                <dd className="font-extrabold text-white">{orgRow.name}</dd>
              </div>
              <div>
                <dt className="font-bold text-white/40">Slug</dt>
                <dd className="font-extrabold text-white">{orgRow.slug ?? "—"}</dd>
              </div>
            </dl>
          </Card>
        )}
      </div>
    </main>
  );
}
