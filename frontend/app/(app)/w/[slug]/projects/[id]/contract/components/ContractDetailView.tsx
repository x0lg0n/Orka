// frontend/app/(app)/w/[slug]/projects/[id]/contract/components/ContractDetailView.tsx
import { createClient } from "@/lib/supabase/server";
import { getActiveOrgBySlug } from "@/lib/orka";
import { deriveWorkflowState, type WorkflowState } from "@/lib/workflow";
import { WorkflowStepper } from "../../components/WorkflowStepper";
import { ActionButton } from "../../components/ActionButton";

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export async function ContractDetailView({
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

  const contractData = (project.contract_data ?? {}) as {
    amount?: number | string;
    milestones?: number;
    deliverables?: string[];
    terms?: string;
  };

  const contract = {
    client_sig: project.client_sig ?? null,
    freelancer_sig: project.freelancer_sig ?? null,
    status: project.contract_status ?? null,
  };

  const { data: escrow } = await supabase
    .from("escrow_contracts")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: milestones } = await supabase
    .from("milestones")
    .select("status")
    .eq("project_id", projectId);

  const state: WorkflowState = deriveWorkflowState({
    contract,
    escrow: escrow
      ? {
          contract_address: escrow.contract_address ?? null,
          total_funded: Number(escrow.total_funded ?? 0),
          total_amount: Number(escrow.total_amount ?? 0),
        }
      : null,
    milestones: (milestones ?? []).map((m) => ({ status: m.status })),
  });

  const agencyRole = "agency" as const;
  const amount = contractData.amount != null ? Number(contractData.amount) : null;
  const milestonesCount = contractData.milestones ?? (milestones?.length ?? 0);

  const sigRow = (label: string, hash: string | null) => (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="font-mono text-xs text-gray-500">
          {hash ? hash.slice(0, 12) + "…" + hash.slice(-6) : "Pending"}
        </p>
      </div>
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
          hash
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {hash ? "Signed" : "Pending"}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <WorkflowStepper stage={state.stage} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">
            Contract terms
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Total value</dt>
              <dd className="font-medium text-gray-900">
                {amount != null ? `${amount.toLocaleString()} ${project.asset ?? "XLM"}` : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Milestones</dt>
              <dd className="font-medium text-gray-900">{milestonesCount}</dd>
            </div>
            {project.contract_address && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Contract address</dt>
                <dd className="font-mono text-xs text-gray-900">
                  {project.contract_address.slice(0, 12)}…{project.contract_address.slice(-6)}
                </dd>
              </div>
            )}
          </dl>
          {contractData.deliverables && contractData.deliverables.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Deliverables
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                {contractData.deliverables.map((d) => (
                  <li key={slugify(d)}>{d}</li>
                ))}
              </ul>
            </div>
          )}
          {contractData.terms && (
            <p className="mt-4 text-sm text-gray-600">{contractData.terms}</p>
          )}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Signatures</h3>
          {sigRow("Freelancer / Agency", contract.freelancer_sig)}
          {sigRow("Client", contract.client_sig)}

          <div className="mt-5 flex flex-wrap gap-3">
            {!contract.freelancer_sig && (
              <form action={`/w/${slug}/projects/${projectId}/contract/sign?signer=agency`} method="post">
                <ActionButton
                  action="sign_contract_agency"
                  role={agencyRole}
                  state={state}
                  label="Sign as agency"
                />
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
