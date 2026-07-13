import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getActiveOrgId } from "../../lib/orka";
import { createOrg } from "../../app/actions";

export const metadata = { title: "Create workspace · ORKA" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const orgId = await getActiveOrgId(supabase);
  if (orgId) redirect("/dashboard/projects");

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 text-white">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
        <h1 className="display mb-1 text-3xl uppercase">Create your workspace</h1>
        <p className="mb-6 text-sm font-bold text-ink/70">
          Workspaces hold your projects, clients, and freelancers.
        </p>
        <form action={createOrg} className="flex flex-col gap-3">
          <input
            name="name"
            placeholder="Acme Studio"
            required
            className="min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20"
          />
          <button
            type="submit"
            className="mt-2 flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">
            Create workspace
          </button>
        </form>
      </div>
    </main>
  );
}
