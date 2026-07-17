import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortalProject } from "@/lib/portal";
import { Tabs, type TabItem } from "@/components/shell/Tabs";

const TABS: TabItem[] = [
  { value: "overview", label: "Overview" },
  { value: "milestones", label: "Milestones" },
  { value: "proposal", label: "Proposal" },
  { value: "billing", label: "Billing" },
];
const VALID = TABS.map((t) => t.value);

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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-hover px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
      {children}
    </span>
  );
}

export const metadata = { title: "Project · ORKA Client Portal" };

export default async function PortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectToken: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { projectToken } = await params;
  const { tab } = await searchParams;

  const project = await getPortalProject(projectToken);
  if (!project) notFound();

  const active = VALID.includes(tab ?? "") ? (tab as string) : "overview";

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {project.organization?.name ?? "ORKA"} · <Badge>{project.status}</Badge>
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-night">
          {project.title}
        </h1>
        {project.client?.name ? (
          <p className="text-sm text-muted-foreground">
            Client: {project.client.name}
          </p>
        ) : null}
      </div>

      {project.description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      ) : null}

      <Tabs basePath={`/p/${projectToken}`} tabs={TABS} active={active} />

      {active === "overview" && (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            This is a read-only view shared with you by{" "}
            {project.organization?.name ?? "the workspace"}. Use the tabs above to
            review milestones, the proposal, and billing.
          </p>
          {project.contract_id ? (
            <p>
              On-chain contract:{" "}
              <span className="font-mono text-night">{project.contract_id}</span>
            </p>
          ) : null}
        </div>
      )}

      {active === "milestones" && (
        <div className="space-y-3">
          {project.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones yet.</p>
          ) : (
            project.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-[12px] border border-border bg-panel p-4"
              >
                <div>
                  <p className="font-extrabold text-night">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.asset} · {m.chain_index !== null ? `#${m.chain_index} · ` : ""}
                    <Badge>{m.status}</Badge>
                  </p>
                </div>
                <p className="font-extrabold text-night">
                  {fmtAmount(m.amount, m.asset)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {active === "proposal" && (
        <div className="space-y-3">
          {project.proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposal attached.</p>
          ) : (
            project.proposals.map((pr) => (
              <div
                key={pr.id}
                className="rounded-[12px] border border-border bg-panel p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <Badge>{pr.status}</Badge>
                  <span className="text-xs text-muted-foreground">{pr.asset}</span>
                </div>
                {Array.isArray(pr.milestones) ? (
                  <ul className="space-y-2">
                    {pr.milestones.map((ms, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-night">{ms.description}</span>
                        <span className="font-extrabold text-night">
                          {fmtAmount(ms.amount, pr.asset)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Milestone details unavailable.
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {active === "billing" && (
        <div className="space-y-3">
          {project.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            project.invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-[12px] border border-border bg-panel p-4"
              >
                <div>
                  <p className="font-extrabold text-night">
                    {inv.invoice_number ?? "Invoice"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <Badge>{inv.status}</Badge>
                  </p>
                </div>
                <p className="font-extrabold text-night">
                  {fmtAmount(inv.amount, inv.currency)}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      <div className="pt-4">
        <Link
          href="/"
          className="text-xs font-bold text-muted-foreground underline-offset-4 hover:underline"
        >
          Go to ORKA
        </Link>
      </div>
    </div>
  );
}
