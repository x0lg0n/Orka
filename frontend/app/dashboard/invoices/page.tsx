import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getActiveOrgId } from "../../../lib/orka";

export const metadata = { title: "Invoices · ORKA" };

export default async function InvoicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signup");
  const orgId = await getActiveOrgId(supabase);
  if (!orgId) redirect("/onboarding");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, currency, status, project_id, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-white">
      <h1 className="display text-4xl uppercase">Invoices</h1>
      <div className="mt-6 flex flex-col gap-3">
        {invoices?.map((inv) => (
          <div key={inv.id} className="rounded-[18px] bg-white p-4 text-ink shadow-hard">
            <div className="flex items-center justify-between">
              <p className="font-black uppercase">{inv.invoice_number}</p>
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-black uppercase text-white">{inv.status}</span>
            </div>
            <p className="text-sm font-bold text-ink/70">{inv.amount} {inv.currency}</p>
          </div>
        ))}
        {(!invoices || invoices.length === 0) && (
          <p className="text-sm font-bold text-white/70">No invoices yet — release a milestone to generate one.</p>
        )}
      </div>
    </main>
  );
}