import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";
import { CreateWorkspaceForm } from "./_components/CreateWorkspaceForm";

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

  return (
    <main className="product-ui dark flex min-h-screen items-center justify-center bg-shell px-4 py-10 font-product text-white">
      <div className="w-full max-w-[640px]">
        {error ? (
          <p className="mb-5 rounded-[10px] border border-danger/35 bg-danger/10 px-4 py-3 text-sm font-bold text-red-100">
            {error}
          </p>
        ) : null}
        <CreateWorkspaceForm />
        <p className="mt-6 text-center text-sm font-bold text-white/40">
          <Link href="/workspaces" className="text-primary hover:underline">
            Cancel
          </Link>
        </p>
      </div>
    </main>
  );
}
