import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FolderKanban } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { getActiveOrgId } from "../../../lib/orka";
import {
  AlertBanner,
  EmptyState,
  PageHeader,
  StatusPill,
} from "../_components/DashboardUI";

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
        className={`rounded-[16px] border px-4 py-2 text-sm font-black uppercase transition focus:outline-none focus:ring-2 focus:ring-cyan-200/50 ${
          isActive
            ? "border-cyan-200/30 bg-cyan-300 text-[#04101f]"
            : "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow="Contract workspace"
        title="Projects"
        description="Track active escrow contracts and archived draft projects without leaving the dashboard shell."
      />

      {error && <AlertBanner>{error}</AlertBanner>}

      <div className="mb-6 flex gap-2">
        {tabLink("active", "Active")}
        {tabLink("closed", "Closed")}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={`No ${active ? "active" : "closed"} projects`}
          description="Accepted proposals will appear here as projects with escrow state and contract details."
        />
      ) : (
        <ul className="grid gap-4">
          {rows.map((p) => (
            <li key={p.id}>
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="flex flex-col gap-4 rounded-[24px] border border-white/10 bg-white/[0.065] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.09] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-lime text-[#04101f]">
                    <FolderKanban className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black uppercase">
                      {p.title ?? "Untitled"}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase text-slate-500">
                      {p.contract_id
                        ? `Contract ${p.contract_id.slice(0, 12)}...`
                        : "No contract id"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <StatusPill status={active ? "active" : p.status ?? "closed"} />
                  <ArrowRight className="size-5 text-cyan-200/70" aria-hidden />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
