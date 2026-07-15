import { PageHeader, EmptyState } from "@/components/dashboard/DashboardUI";

export default function SearchPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Command center"
        title="Search"
        description="Jump to any proposal, project, client, or invoice across this workspace."
      />
      <EmptyState
        title="Search coming soon"
        description="A unified search and command palette for this workspace will live here."
      />
    </div>
  );
}
