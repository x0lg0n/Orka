import { PageHeader, EmptyState } from "@/components/dashboard/DashboardUI";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Escrow throughput, release velocity, and counterparty activity for this workspace."
      />
      <EmptyState
        title="Analytics coming soon"
        description="Once you have funded or released milestones, trends and cash-flow insights will appear here."
      />
    </div>
  );
}
