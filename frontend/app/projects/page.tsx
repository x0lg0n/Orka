import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getActiveOrgId } from "../../lib/orka";

export const metadata = { title: "Projects · ORKA" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");

  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, client_name")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/Logo/LOGO.svg" alt="ORKA" width={32} height={32} className="size-8 object-contain" />
          <span className="display text-2xl">ORKA</span>
        </div>
        <Link href="/projects/new" className="rounded-full bg-lime px-5 py-2 text-sm font-black uppercase text-ink transition hover:-translate-y-0.5 hover:bg-orange hover:text-white">
          New project
        </Link>
      </div>

      <h1 className="display mt-8 text-4xl uppercase">Projects</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {projects && projects.length > 0 ?
          projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="rounded-[20px] bg-white p-5 text-ink shadow-hard transition hover:-translate-y-0.5">
              <p className="display text-xl uppercase">{p.title}</p>
              <p className="mt-1 text-sm font-bold text-ink/60">
                {p.client_name ?? "No client"} · <span className="uppercase">{p.status}</span>
              </p>
            </Link>
          ))
        : <p className="text-sm font-bold text-white/70">No projects yet — create your first.</p>}
      </div>
    </main>
  );
}
