import { PageHeader, EmptyState } from "@/components/dashboard/DashboardUI";

export default function ClientsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Relationships"
        title="Clients"
        description="Counterparties you work with across proposals, projects, and invoices."
      />
      <EmptyState
        title="No clients yet"
        description="Clients are created automatically the first time you draft a proposal with a counterparty address."
      />
    </div>
  );
}
