import {
  FileSignature,
  Lock,
  DollarSign,
  Upload,
  MessageSquare,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { TimelineEvent } from "./ProjectTimelineView";

function EventIcon({ type }: { type: string }) {
  const iconClass = "h-4 w-4";
  switch (type) {
    case "project_created":
      return <CheckCircle2 className={`${iconClass} text-emerald-500`} />;
    case "contract":
      return <FileSignature className={`${iconClass} text-blue-500`} />;
    case "escrow":
      return <Lock className={`${iconClass} text-amber-500`} />;
    case "milestone":
      return <AlertCircle className={`${iconClass} text-[#7c3aed]`} />;
    case "payment":
    case "invoice":
      return <DollarSign className={`${iconClass} text-emerald-500`} />;
    case "file":
      return <Upload className={`${iconClass} text-blue-500`} />;
    case "comment":
      return <MessageSquare className={`${iconClass} text-gray-500`} />;
    default:
      return <FolderOpen className={`${iconClass} text-gray-400`} />;
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </span>
    );
  }
  if (status === "current") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#7c3aed]/10 px-2 py-0.5 text-xs font-medium text-[#7c3aed]">
        In Progress
      </span>
    );
  }
  return null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function TimelineEventCard({ event }: { event: TimelineEvent }) {
  return (
    <div className="group rounded-xl border border-gray-100 p-3 transition hover:border-gray-200 hover:shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50">
          <EventIcon type={event.type} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {event.title}
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                {event.description}
              </p>
            </div>
            <StatusBadge status={event.status} />
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-400">
            <span>{formatDate(event.date)}</span>
            <span>{event.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
