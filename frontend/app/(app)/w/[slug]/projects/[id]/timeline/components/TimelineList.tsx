import { CheckCircle2, Circle, Clock } from "lucide-react";
import { TimelineEventCard } from "./TimelineEventCard";
import { CurrentMilestoneCard } from "./CurrentMilestoneCard";
import { UpcomingMilestoneCard } from "./UpcomingMilestoneCard";
import { EmptyTimeline } from "./EmptyTimeline";
import type { TimelineEvent } from "./ProjectTimelineView";

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

function TimelineIcon({ status }: { status: string }) {
  if (status === "completed") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  }
  if (status === "current") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#7c3aed] bg-[#7c3aed]/10">
        <div className="h-2 w-2 rounded-full bg-[#7c3aed]" />
      </div>
    );
  }
  if (status === "upcoming") {
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-50">
        <div className="h-2 w-2 rounded-full bg-gray-300" />
      </div>
    );
  }
  return <Circle className="h-5 w-5 text-gray-300" />;
}

function getLineColor(status: string) {
  if (status === "completed") return "bg-emerald-200";
  if (status === "current") return "bg-[#7c3aed]/30";
  return "bg-gray-200";
}

export function TimelineList({
  events,
  currentMilestone,
  upcomingMilestones,
  milestoneAsset,
}: {
  events: TimelineEvent[];
  currentMilestone?: MilestoneRow;
  upcomingMilestones: MilestoneRow[];
  milestoneAsset: string;
}) {
  if (events.length === 0 && !currentMilestone && upcomingMilestones.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <EmptyTimeline />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col">
        {events.map((event, i) => {
          const isLast = i === events.length - 1 && !currentMilestone && upcomingMilestones.length === 0;
          const nextEvent = events[i + 1];
          const lineStatus = nextEvent ? nextEvent.status : currentMilestone ? "current" : "pending";

          return (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <TimelineIcon status={event.status} />
                {!isLast && (
                  <div
                    className={`my-0.5 h-6 w-0.5 ${getLineColor(lineStatus)}`}
                  />
                )}
              </div>

              <div className={`flex-1 ${isLast ? "pb-1.5" : "pb-3"}`}>
                <TimelineEventCard event={event} />
              </div>
            </div>
          );
        })}

        {currentMilestone && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#7c3aed] bg-[#7c3aed]">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
              {upcomingMilestones.length > 0 && (
                <div className="my-0.5 h-6 w-0.5 bg-gray-200" />
              )}
            </div>
            <div className={`flex-1 ${upcomingMilestones.length === 0 ? "pb-1.5" : "pb-3"}`}>
              <CurrentMilestoneCard
                milestone={currentMilestone}
                asset={milestoneAsset}
              />
            </div>
          </div>
        )}

        {upcomingMilestones.map((milestone, i) => {
          const isLast = i === upcomingMilestones.length - 1;
          return (
            <div key={milestone.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <TimelineIcon status="upcoming" />
                {!isLast && (
                  <div className="my-0.5 h-6 w-0.5 bg-gray-200" />
                )}
              </div>
              <div className={`flex-1 ${isLast ? "pb-1.5" : "pb-3"}`}>
                <UpcomingMilestoneCard
                  milestone={milestone}
                  asset={milestoneAsset}
                  isLast={isLast}
                />
              </div>
            </div>
          );
        })}

        <div className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100">
              <Clock className="h-2.5 w-2.5 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 pb-1.5">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Project Completion
                </p>
                <p className="text-xs text-gray-300">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
