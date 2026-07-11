import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getActiveOrgId } from "../../../lib/orka";

type ProjectRow = {
  id: string;
  title: string | null;
  status: string | null;
  contract_id: string | null;
  created_at: string;
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, status, contract_id, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  const { tab, error } = await searchParams;
  const active = (tab ?? "active") !== "closed";

  const rows = ((projects as ProjectRow[] | null) ?? []).filter((p) =>
    active ? p.contract_id !== null : p.contract_id === null,
  );

  const tabLink = (key: "active" | "closed", label: string) => {
    const isActive = (key === "active") === active;
    return (
      <Link
        key={key}
        href={`/dashboard/projects?tab=${key}`}
        className={`rounded-full px-5 py-2 text-sm font-black uppercase transition ${
          isActive ? "bg-ink text-white" : "bg-white text-ink hover:bg-bone"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="display mb-6 text-3xl uppercase">Projects</h1>

      {error && (
        <p className="mb-5 rounded-2xl bg-orange/20 px-4 py-2 text-sm font-bold text-ink">
          {error}
        </p>
      )}

      <div className="mb-6 flex gap-2">
        {tabLink("active", "Active")}
        {tabLink("closed", "Closed")}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-[28px] bg-white p-6 text-ink shadow-hard md:p-8">
          <p className="text-sm font-bold text-ink/70">
            No {active ? "active" : "closed"} projects yet.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="flex items-center justify-between gap-3 rounded-[28px] bg-white p-5 text-ink shadow-hard transition hover:-translate-y-0.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-black uppercase">{p.title ?? "Untitled"}</p>
                  <p className="text-xs font-bold uppercase text-ink/50">
                    {p.status ?? "—"}
                  </p>
                </div>
                <span className="rounded-full bg-lime px-3 py-1 text-xs font-black uppercase text-ink">
                  {active ? "Active" : "Closed"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
