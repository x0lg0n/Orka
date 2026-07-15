import { PageHeader, EmptyState } from "@/components/dashboard/DashboardUI";

export default function AiPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Orka AI"
        title="AI assistant"
        description="Draft proposals, summarize escrow state, and surface next actions across your workspace."
      />
      <EmptyState
        title="AI assistant coming soon"
        description="Natural-language helpers for proposals, milestone reviews, and reporting will live here."
      />
    </div>
  );
}
