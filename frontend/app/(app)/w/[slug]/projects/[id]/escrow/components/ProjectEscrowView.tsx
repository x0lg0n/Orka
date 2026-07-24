// frontend/app/(app)/w/[slug]/projects/[id]/escrow/components/ProjectEscrowView.tsx
"use client";

import { useRouter } from "next/navigation";
import { deriveWorkflowState, nextActionsForRole, type WorkflowState } from "@/lib/workflow";
import type { MilestoneStatus } from "@/lib/orka";
import { WorkflowStepper } from "../../components/WorkflowStepper";
import { EscrowDeploymentFlow } from "./EscrowDeploymentFlow";
import { deployEscrow } from "../../actions";

type ProjectEscrowViewProps = {
  slug: string;
  orgId: string;
  projectId: string;
  project: {
    id: string;
    shared_token?: string | null;
    sharedToken?: string | null;
    asset?: string | null;
    client_sig?: string | null;
    freelancer_sig?: string | null;
    contract_status?: string | null;
  };
  escrow: {
    id: string;
    status: string;
    contract_address: string | null;
    total_amount: number;
    total_funded: number;
    asset: string;
    deployed_at?: string | null;
    custody_mode?: string;
  } | null;
  milestones: { id: string; status: string }[];
  role: "agency" | "client";
};

export function ProjectEscrowView({
  slug,
  orgId,
  projectId,
  project,
  escrow,
  milestones,
  role,
}: ProjectEscrowViewProps) {
  const router = useRouter();

  const state: WorkflowState = deriveWorkflowState({
    contract: {
      client_sig: project.client_sig ?? null,
      freelancer_sig: project.freelancer_sig ?? null,
      status: project.contract_status ?? undefined,
    },
    escrow: escrow
      ? {
          contract_address: escrow.contract_address ?? null,
          total_funded: Number(escrow.total_funded ?? 0),
          total_amount: Number(escrow.total_amount ?? 0),
          deployed_at: escrow.deployed_at ?? null,
        }
      : null,
    milestones: milestones.map((m) => ({ status: m.status as MilestoneStatus })),
  });

  const handleDeploy = async () => {
    const asset = escrow?.asset ?? project.asset ?? "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
    const milestoneIds = milestones.map((m) => m.id);
    const res = await deployEscrow({
      projectId,
      orgId,
      asset,
      milestoneIds,
      mode: "orka",
    });
    if (!res.ok) throw new Error(res.error);
    router.refresh();
  };

  if (!escrow) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <WorkflowStepper stage={state.stage} />
        </div>
        <EscrowDeploymentFlow
          projectSlug={slug}
          projectId={projectId}
          projectToken={project.shared_token ?? project.sharedToken ?? null}
          deployedAt={null}
          contractAddress={null}
          role={role}
          onDeploy={handleDeploy}
        />
      </div>
    );
  }

  const totalAmount = Number(escrow.total_amount ?? 0);
  const totalFunded = Number(escrow.total_funded ?? 0);
  const pct = totalAmount > 0 ? Math.min(100, Math.round((totalFunded / totalAmount) * 100)) : 0;
  const custodyMode = escrow.custody_mode ?? "orka";
  const asset = escrow.asset ?? project.asset ?? "XLM";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <WorkflowStepper stage={state.stage} />
      </div>

      <EscrowDeploymentFlow
        projectSlug={slug}
        projectId={projectId}
        projectToken={project.shared_token ?? project.sharedToken ?? null}
        deployedAt={escrow.deployed_at ?? null}
        contractAddress={escrow.contract_address}
        role={role}
        onDeploy={handleDeploy}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Escrow pool</h3>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                custodyMode === "freighter"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {custodyMode === "freighter" ? "Freighter" : "Orka KMS"}
            </span>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Total value</dt>
              <dd className="font-medium text-gray-900">
                {totalAmount.toLocaleString()} {asset}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Funded</dt>
              <dd className="font-medium text-gray-900">
                {totalFunded.toLocaleString()} {asset}
              </dd>
            </div>
            {escrow.contract_address && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Contract address</dt>
                <dd className="font-mono text-xs text-gray-900">
                  {escrow.contract_address.slice(0, 12)}…{escrow.contract_address.slice(-6)}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span>Funded</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Milestone funds are released from this pool — no per-milestone
            funding.
          </p>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {nextActionsForRole(state, "client").includes("fund_escrow") && (
              <a
                href={`/p/${project.shared_token ?? project.sharedToken ?? ""}`}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Fund escrow
              </a>
            )}
          </div>
          {state.stage === "escrow_deployed" && (
            <p className="mt-3 text-xs text-gray-500">
              The client funds the escrow from the public portal. Copy the portal
              link to your client to complete funding.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
