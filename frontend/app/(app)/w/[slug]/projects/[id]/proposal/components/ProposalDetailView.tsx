"use client";

import { ProposalOverviewCard } from "./ProposalOverviewCard";
import { ProposalContentCard } from "./ProposalContentCard";
import { ProposalLatestCard } from "./ProposalLatestCard";
import { ProposalStatusCard } from "./ProposalStatusCard";
import { ProposalActionsCard } from "./ProposalActionsCard";
import { ClientContactCard } from "./ClientContactCard";
import { ProposalNotesCard } from "./ProposalNotesCard";
import { ProposalEmptyState } from "./ProposalEmptyState";
import type {
  ProposalRow,
  ProposalSection,
  ProposalPricingItem,
  ProposalNote,
  ProposalActivityItem,
  ProjectRow,
  ClientRow,
} from "./types";

export function ProposalDetailView({
  slug,
  projectId,
  project,
  proposal,
  sections,
  pricing,
  notes,
  activity,
  client,
}: {
  slug: string;
  projectId: string;
  project: ProjectRow;
  proposal: ProposalRow | null;
  sections: ProposalSection[];
  pricing: ProposalPricingItem[];
  notes: ProposalNote[];
  activity: ProposalActivityItem[];
  client: ClientRow;
}) {
  if (!proposal) {
    return <ProposalEmptyState slug={slug} projectId={projectId} />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main column (75%) */}
        <div className="lg:col-span-2 space-y-4">
          <ProposalOverviewCard
            proposal={proposal}
            project={project}
            client={client}
          />
          <ProposalContentCard
            proposal={proposal}
            sections={sections}
            pricing={pricing}
          />
          <ProposalLatestCard proposal={proposal} owner={null} />
        </div>

        {/* Sidebar (25%) */}
        <div className="flex flex-col gap-4">
          <ProposalStatusCard proposal={proposal} activity={activity} />
          <ProposalActionsCard />
          <ClientContactCard client={client} />
          <ProposalNotesCard notes={notes} />
        </div>
      </div>
    </div>
  );
}
