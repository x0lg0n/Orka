// frontend/app/(app)/w/[slug]/projects/[id]/payments/components/ProjectPaymentsView.tsx
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { WorkflowStepper } from "../../components/WorkflowStepper";

type PaymentRow = {
  id: string;
  project_id: string | null;
  milestone_id: string | null;
  invoice_id: string | null;
  payment_type: "escrow" | "milestone" | "invoice" | "refund";
  amount: number;
  currency: string | null;
  status: "completed" | "pending" | "failed" | "released" | "processing" | null;
  tx_hash: string | null;
  created_at: string;
};

const TYPE_LABELS: Record<string, string> = {
  escrow: "Escrow fund",
  milestone: "Milestone release",
  invoice: "Invoice",
  refund: "Refund",
};

function statusClasses(status: string | null): string {
  switch (status) {
    case "completed":
    case "released":
      return "bg-emerald-100 text-emerald-700";
    case "pending":
    case "processing":
      return "bg-amber-100 text-amber-700";
    case "failed":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export async function ProjectPaymentsView({
  slug,
  orgId,
  projectId,
}: {
  slug: string;
  orgId: string;
  projectId: string;
}) {
  const supabase = await createClient();
  const org = await getActiveOrgBySlug(supabase, slug);
  if (!org) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("org_id", orgId)
    .eq("id", projectId)
    .single();

  if (!project) return null;

  const { data: escrow } = await supabase
    .from("escrow_contracts")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: payments } = await supabase
    .from("workspace_payments")
    .select("*")
    .eq("org_id", orgId)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  // Funded pool context comes from the escrow contract (real columns:
  // total_funded / total_amount live on escrow_contracts per the migration).
  const totalFunded = Number(escrow?.total_funded ?? 0);

  const rows = (payments ?? []) as PaymentRow[];
  const released = rows
    .filter((p) => p.payment_type !== "escrow" && p.status !== "failed")
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
  const remaining = Math.max(totalFunded - released, 0);

  const asset =
    (escrow?.asset as string) ?? project.asset ?? rows[0]?.currency ?? "XLM";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <WorkflowStepper stage={project.project_stage ?? "draft"} />
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Funded pool</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {totalFunded.toLocaleString()} {asset}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Released</p>
          <p className="mt-1 text-lg font-semibold text-emerald-700">
            {released.toLocaleString()} {asset}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Remaining</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">
            {remaining.toLocaleString()} {asset}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-900">
          Payment ledger
        </h3>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center">
            <p className="text-sm text-gray-500">
              No payments yet. Escrow funds and milestone releases will appear
              here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-3 py-2 font-medium">Type</th>
                  <th className="px-3 py-2 font-medium">Amount</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Tx</th>
                  <th className="px-3 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="px-3 py-2.5 font-medium text-gray-900">
                      {TYPE_LABELS[p.payment_type] ?? p.payment_type}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700">
                      {Number(p.amount ?? 0).toLocaleString()} {p.currency ?? ""}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses(
                          p.status
                        )}`}
                      >
                        {p.status ?? "pending"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-500">
                      {p.tx_hash
                        ? `${p.tx_hash.slice(0, 8)}…${p.tx_hash.slice(-6)}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500">
                      {new Date(p.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
