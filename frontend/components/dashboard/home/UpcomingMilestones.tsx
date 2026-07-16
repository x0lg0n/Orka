import { Calendar } from "lucide-react";
import type { Milestone } from "@/types/dashboard";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface UpcomingMilestonesProps {
  milestones: Milestone[];
}

export function UpcomingMilestones({ milestones }: UpcomingMilestonesProps) {
  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#11182d]">
          Upcoming Milestones
        </h2>
        <button className="text-xs font-semibold text-[#7c3aed] transition-colors duration-150 hover:text-[#6d28d9]">
          View all
        </button>
      </div>

      {milestones.length === 0 ? (
        <EmptyState
          compact
          tone="violet"
          icon={Calendar}
          title="No upcoming milestones"
          description="Funded or in-review milestones will appear here once work begins."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="rounded-lg border border-[#e5e8f0] p-3 transition-colors duration-150 hover:bg-[#f7f8fc]"
            >
              <p className="text-sm font-semibold text-[#11182d]">
                {milestone.project}
              </p>
              <p className="mt-0.5 text-xs text-[#5f6b86]">{milestone.name}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#8b95aa]">
                <Calendar className="h-3 w-3" />
                <span>{milestone.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
