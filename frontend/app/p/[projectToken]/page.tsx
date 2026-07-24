import { notFound } from "next/navigation";
import { getPortalProject } from "@/lib/portal";
import { PortalDashboard } from "./components/PortalDashboard";
import { PortalContractActions } from "./components/PortalContractActions";
import { PortalMilestoneActions } from "./components/PortalMilestoneActions";
import { PortalProposalView } from "./components/PortalProposalView";
import { PortalWalletConnect } from "./components/PortalWalletConnect";

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtAmount(amount: number | null, currency = "USD") {
  if (amount === null || amount === undefined) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

export default async function PortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectToken: string }>;
  searchParams: Promise<{ nav?: string }>;
}) {
  const { projectToken } = await params;
  const { nav } = await searchParams;
  const active = nav ?? "dashboard";

  const project = await getPortalProject(projectToken);
  if (!project) notFound();

  const mode = (project.custody_mode === "freighter" ? "freighter" : "orka") as "orka" | "freighter";
  const signed =
    project.proposals.some((pr) => pr.status === "signed") || !!project.contract_id;
  const funded = project.milestones.some((m) => m.status !== "draft");
  const totalAmount = project.milestones.reduce((sum, m) => sum + (m.amount ?? 0), 0);
  const milestoneIds = project.milestones
    .map((m) => (typeof m.chain_index === "number" ? m.chain_index : Number(m.id)))
    .filter((n) => !Number.isNaN(n));

  if (active === "dashboard") {
    return <PortalDashboard project={project} token={projectToken} />;
  }

  if (active === "milestones") {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Milestones</h2>
        {project.milestones.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">No milestones yet.</p>
          </div>
        ) : (
          project.milestones.map((m, idx) => (
            <div
              key={m.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{m.title}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                    <span>{m.asset}</span>
                    {m.chain_index !== null && <span>· #{m.chain_index}</span>}
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {m.status}
                    </span>
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  {fmtAmount(m.amount, m.asset)}
                </p>
              </div>
              {project.contract_address ? (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <PortalMilestoneActions
                    token={projectToken}
                    contractAddress={project.contract_address}
                    milestonePos={m.chain_index ?? idx + 1}
                    status={m.status}
                    mode={mode}
                    clientAddress={project.client?.stellar_address ?? null}
                  />
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    );
  }

  if (active === "proposal") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Proposal</h2>
        {project.proposals.length === 0 ? (
          <p className="text-sm text-gray-500">No proposal attached.</p>
        ) : (
          <PortalProposalView token={projectToken} proposal={project.proposals[0]} />
        )}
      </div>
    );
  }

  if (active === "contracts") {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Contract</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          {project.contract_address ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Contract Address</span>
                <span className="font-mono text-xs text-gray-700">
                  {project.contract_address.slice(0, 12)}&hellip;{project.contract_address.slice(-6)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Contract ID</span>
                <span className="font-mono text-xs text-gray-700">
                  {project.contract_id ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Custody Mode</span>
                <span className="font-medium text-gray-700 capitalize">{mode}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Actions</h3>
              <PortalContractActions
                token={projectToken}
                contractAddress={project.contract_address}
                contractId={project.contract_id}
                custodyMode={mode}
                clientAddress={project.client?.stellar_address ?? null}
                signed={signed}
                funded={funded}
                totalAmount={totalAmount}
                milestoneIds={milestoneIds}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">No contract deployed yet.</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Wallet</h3>
          <PortalWalletConnect
            token={projectToken}
            initialAddress={project.client?.stellar_address ?? null}
            mode={mode}
          />
        </div>
      </div>
    );
  }

  if (active === "payments") {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Payments</h2>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Escrow</h3>
          {project.contract_address ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-medium text-gray-900">
                  {totalAmount.toLocaleString()} {project.milestones[0]?.asset ?? "XLM"}
                </span>
              </div>
              <PortalContractActions
                token={projectToken}
                contractAddress={project.contract_address}
                contractId={project.contract_id}
                custodyMode={mode}
                clientAddress={project.client?.stellar_address ?? null}
                signed={signed}
                funded={funded}
                totalAmount={totalAmount}
                milestoneIds={milestoneIds}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">No escrow contract deployed yet.</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Wallet</h3>
          <PortalWalletConnect
            token={projectToken}
            initialAddress={project.client?.stellar_address ?? null}
            mode={mode}
          />
        </div>
      </div>
    );
  }

  if (active === "invoices") {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
        {project.invoices.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm text-gray-500">No invoices yet.</p>
          </div>
        ) : (
          project.invoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="font-semibold text-gray-900">
                  {inv.invoice_number ?? "Invoice"}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                    {inv.status}
                  </span>
                </p>
              </div>
              <p className="font-semibold text-gray-900">
                {fmtAmount(inv.amount, inv.currency)}
              </p>
            </div>
          ))
        )}
      </div>
    );
  }

  if (active === "files") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Files & Deliverables</h2>
        <p className="text-sm text-gray-500">No files shared yet.</p>
      </div>
    );
  }

  if (active === "messages") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500">Messaging is not yet available.</p>
      </div>
    );
  }

  if (active === "activity") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Activity</h2>
        <p className="text-sm text-gray-500">No activity yet.</p>
      </div>
    );
  }

  if (active === "settings") {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Settings are not yet available.</p>
      </div>
    );
  }

  return <PortalDashboard project={project} token={projectToken} />;
}
