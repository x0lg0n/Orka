import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { PageHeader, EmptyState } from "@/components/dashboard/DashboardUI";

type ClientRow = {
  id: string;
  name: string | null;
  email: string | null;
  stellar_address: string | null;
  created_at: string;
};

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) redirect("/workspaces");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, email, stellar_address, created_at")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const rows = (clients as ClientRow[] | null) ?? [];

  return (
    <div>
      <PageHeader
        eyebrow="Relationships"
        title="Clients"
        description="Counterparties you work with across proposals, projects, and invoices."
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Clients are created automatically the first time you draft a proposal with a counterparty address."
        />
      ) : (
        <ul className="grid gap-4">
          {rows.map((c) => (
            <li
              key={c.id}
              className="rounded-[24px] border border-white/10 bg-white/[0.065] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-black uppercase text-white">
                    {c.name ?? "Unnamed"}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase text-slate-500">
                    {c.email ?? c.stellar_address ?? "No contact"}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
