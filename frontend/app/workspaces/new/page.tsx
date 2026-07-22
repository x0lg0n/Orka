import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { WorkspaceNav } from "../../../components/shell/WorkspaceNav";
import { CreateWorkspaceForm } from "./components/CreateWorkspaceForm";

export const metadata = { title: "Create Workspace · ORKA" };

export default async function NewWorkspacePage({
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
    <main className="product-ui dashboard-light flex min-h-screen flex-col bg-shell font-product">
      <WorkspaceNav name={name} email={user.email ?? ""} initials={initials} />
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[640px]">
          {error ? (
            <p className="mb-5 rounded-[10px] border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-bold text-destructive">
              {error}
            </p>
          ) : null}
          <CreateWorkspaceForm />
          <p className="mt-6 text-center text-sm font-bold text-muted-foreground">
            <Link href="/workspaces" className="text-primary hover:underline">
              Cancel
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
