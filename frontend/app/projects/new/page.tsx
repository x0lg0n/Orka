import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getActiveOrgId } from "../../../lib/orka";
import { createProject } from "../../../app/actions";

export const metadata = { title: "New project · ORKA" };

const field =
  "min-h-12 w-full rounded-[10px] border-2 border-ink bg-white px-4 text-sm font-bold outline-none transition focus:border-violet focus:ring-4 focus:ring-violet/20";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  if (!(await getActiveOrgId(supabase))) redirect("/onboarding");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 text-white">
      <Link href="/projects" className="text-sm font-bold text-lime underline">← Back</Link>
      <h1 className="display mt-4 text-4xl uppercase">New project</h1>

      <form action={createProject} className="mt-6 flex flex-col gap-3">
        <input name="title" placeholder="Project title" required className={field} />
        <textarea name="description" placeholder="Description" className={field} />
        <input name="clientName" placeholder="Client name" className={field} />
        <input name="clientEmail" type="email" placeholder="Client email" className={field} />
        <input name="freelancerName" placeholder="Freelancer name" className={field} />
        <input name="freelancerEmail" type="email" placeholder="Freelancer email" className={field} />
        <button type="submit" className="mt-2 flex min-h-12 items-center justify-center rounded-full border-2 border-ink bg-lime px-7 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">
          Create project
        </button>
      </form>
    </main>
  );
}
