"use client";

import { useMemo, useState } from "react";
import { TimelineFilters } from "./TimelineFilters";
import { TimelineList } from "./TimelineList";
import { ProjectSummaryCard } from "./ProjectSummaryCard";
import { UpcomingEventsCard } from "./UpcomingEventsCard";
import { TimelineQuickActions } from "./TimelineQuickActions";

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  client_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
};

type MilestoneRow = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  asset: string;
  status: string;
  position: number | null;
  due_date: string | null;
  created_at: string;
};

type OwnerRow = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

type FileRow = {
  id: string;
  name: string;
  size: number | null;
  created_at: string;
  review_status: string;
};

type ContractRow = {
  id: string;
  title: string | null;
  status: string;
  created_at: string;
};

type PaymentRow = {
  id: string;
  amount: number;
  asset: string;
  status: string;
  created_at: string;
};

type InvoiceRow = {
  id: string;
  amount: number;
  asset: string;
  status: string;
  created_at: string;
};

type ActivityRow = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
  actor_id: string | null;
};

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  author_id: string | null;
};

type EscrowRow = {
  id: string;
  status: string;
  amount: number;
  asset: string;
  created_at: string;
};

type TimelineStats = {
  progressPct: number;
  totalBudget: number;
  releasedAmount: number;
  fundedAmount: number;
  pendingAmount: number;
  milestoneAsset: string;
  totalMilestones: number;
  releasedCount: number;
  fundedCount: number;
  pendingCount: number;
};

export type TimelineEvent = {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status: "completed" | "current" | "upcoming" | "pending";
  category:
    | "milestone"
    | "payment"
    | "contract"
    | "escrow"
    | "file"
    | "activity"
    | "system";
};

function generateTimelineEvents(
  project: ProjectRow,
  milestones: MilestoneRow[],
  files: FileRow[],
  contracts: ContractRow[],
  payments: PaymentRow[],
  invoices: InvoiceRow[],
  activity: ActivityRow[],
  comments: CommentRow[],
  escrow: EscrowRow[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  events.push({
    id: `project-created-${project.id}`,
    type: "project_created",
    title: "Project Created",
    description:
      "The project was created and initial details were added.",
    date: project.created_at,
    time: new Date(project.created_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
    status: "completed",
    category: "system",
  });

  for (const contract of contracts) {
    events.push({
      id: `contract-${contract.id}`,
      type: "contract",
      title:
        contract.status === "signed"
          ? "Contract Signed"
          : "Contract Created",
      description:
        contract.status === "signed"
          ? "Both parties have signed the contract."
          : `Contract "${contract.title ?? "Untitled"}" was created.`,
      date: contract.created_at,
      time: new Date(contract.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: "completed",
      category: "contract",
    });
  }

  for (const e of escrow) {
    events.push({
      id: `escrow-${e.id}`,
      type: "escrow",
      title:
        e.status === "funded"
          ? "Escrow Funded"
          : e.status === "released"
            ? "Escrow Released"
            : "Escrow Created",
      description:
        e.status === "funded"
          ? `${Number(e.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${e.asset} has been locked in escrow.`
          : e.status === "released"
            ? `Escrow funds have been released.`
            : `Escrow for ${Number(e.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${e.asset} was created.`,
      date: e.created_at,
      time: new Date(e.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: "completed",
      category: "escrow",
    });
  }

  for (const milestone of milestones) {
    const isCurrent =
      milestone.status === "funded" || milestone.status === "in_review";
    const isUpcoming = milestone.status === "draft";
    const isCompleted =
      milestone.status === "released" || milestone.status === "approved";

    events.push({
      id: `milestone-${milestone.id}`,
      type: "milestone",
      title: milestone.title ?? `Milestone ${milestone.position ?? ""}`,
      description:
        milestone.description ??
        `${Number(milestone.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${milestone.asset}`,
      date: milestone.created_at,
      time: new Date(milestone.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: isCompleted
        ? "completed"
        : isCurrent
          ? "current"
          : isUpcoming
            ? "upcoming"
            : "pending",
      category: "milestone",
    });
  }

  for (const payment of payments) {
    events.push({
      id: `payment-${payment.id}`,
      type: "payment",
      title:
        payment.status === "completed" ? "Payment Released" : "Payment Pending",
      description: `${Number(payment.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${payment.asset} payment.`,
      date: payment.created_at,
      time: new Date(payment.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: payment.status === "completed" ? "completed" : "pending",
      category: "payment",
    });
  }

  for (const invoice of invoices) {
    events.push({
      id: `invoice-${invoice.id}`,
      type: "invoice",
      title:
        invoice.status === "paid" ? "Invoice Paid" : "Invoice Generated",
      description: `Invoice for ${Number(invoice.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${invoice.asset}.`,
      date: invoice.created_at,
      time: new Date(invoice.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: invoice.status === "paid" ? "completed" : "pending",
      category: "payment",
    });
  }

  for (const file of files) {
    events.push({
      id: `file-${file.id}`,
      type: "file",
      title: "File Uploaded",
      description: `"${file.name}" was uploaded to the project.`,
      date: file.created_at,
      time: new Date(file.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: "completed",
      category: "file",
    });
  }

  for (const act of activity) {
    const typeLabel =
      act.type === "comment"
        ? "Comment Added"
        : act.type === "feedback"
          ? "Client Feedback"
          : "Activity Recorded";
    events.push({
      id: `activity-${act.id}`,
      type: act.type,
      title: typeLabel,
      description:
        typeof act.payload?.description === "string"
          ? act.payload.description
          : `Activity event recorded.`,
      date: act.created_at,
      time: new Date(act.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: "completed",
      category: "activity",
    });
  }

  for (const comment of comments) {
    events.push({
      id: `comment-${comment.id}`,
      type: "comment",
      title: "Comment Added",
      description:
        comment.content.length > 120
          ? comment.content.slice(0, 120) + "..."
          : comment.content,
      date: comment.created_at,
      time: new Date(comment.created_at).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      status: "completed",
      category: "activity",
    });
  }

  events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return events;
}

function getUpcomingEvents(
  milestones: MilestoneRow[]
): Array<{ title: string; dueDate: string; dueIn: string }> {
  const upcoming = milestones
    .filter((m) => m.status === "draft" || m.status === "funded")
    .sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 3);

  return upcoming.map((m) => {
    const dueDate = m.due_date ? new Date(m.due_date) : new Date();
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return {
      title: m.title ?? "Milestone",
      dueDate: m.due_date
        ? new Date(m.due_date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "No date",
      dueIn:
        diffDays === 0
          ? "Due today"
          : diffDays === 1
            ? "Due tomorrow"
            : `Due in ${diffDays} days`,
    };
  });
}

export function ProjectTimelineView({
  slug,
  projectId,
  project,
  milestones,
  owner,
  files,
  contracts,
  payments,
  invoices,
  activity,
  comments,
  escrow,
  memberCount,
  stats,
}: {
  slug: string;
  projectId: string;
  project: ProjectRow;
  milestones: MilestoneRow[];
  owner: OwnerRow;
  files: FileRow[];
  contracts: ContractRow[];
  payments: PaymentRow[];
  invoices: InvoiceRow[];
  activity: ActivityRow[];
  comments: CommentRow[];
  escrow: EscrowRow[];
  memberCount: number;
  stats: TimelineStats;
}) {
  const [filter, setFilter] = useState<string>("all");

  const allEvents = useMemo(
    () =>
      generateTimelineEvents(
        project,
        milestones,
        files,
        contracts,
        payments,
        invoices,
        activity,
        comments,
        escrow
      ),
    [
      project,
      milestones,
      files,
      contracts,
      payments,
      invoices,
      activity,
      comments,
      escrow,
    ]
  );

  const filteredEvents = useMemo(() => {
    if (filter === "all") return allEvents;
    return allEvents.filter((e) => e.category === filter);
  }, [allEvents, filter]);

  const upcomingEvents = useMemo(
    () => getUpcomingEvents(milestones),
    [milestones]
  );

  const currentMilestone = milestones.find(
    (m) => m.status === "funded" || m.status === "in_review"
  );

  const upcomingMilestones = milestones.filter(
    (m) => m.status === "draft"
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Project Timeline
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Track all key events and progress in this project
          </p>
        </div>
        <TimelineFilters filter={filter} onFilterChange={setFilter} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TimelineList
            events={filteredEvents}
            currentMilestone={currentMilestone}
            upcomingMilestones={upcomingMilestones}
            milestoneAsset={stats.milestoneAsset}
          />
        </div>

        <div className="flex flex-col gap-4">
          <ProjectSummaryCard
            project={project}
            owner={owner}
            memberCount={memberCount}
            stats={stats}
          />
          <UpcomingEventsCard
            events={upcomingEvents}
            slug={slug}
            projectId={projectId}
          />
          <TimelineQuickActions slug={slug} projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
