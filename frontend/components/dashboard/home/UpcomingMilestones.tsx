import Link from "next/link";
import { Calendar } from "lucide-react";
import type { Milestone } from "@/types/dashboard";

interface UpcomingMilestonesProps {
  milestones: Milestone[];
  slug: string;
}

export function UpcomingMilestones({
  milestones,
  slug,
}: UpcomingMilestonesProps) {
  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#11182d]">
          Upcoming Milestones
        </h2>
        <Link
          href={`/w/${slug}/projects`}
          className="text-xs font-semibold text-[#7c3aed] transition-colors duration-150 hover:text-[#6d28d9]"
        >
          View all
        </Link>
      </div>

      {milestones.length === 0 ? (
        <p className="py-2 text-sm font-medium text-[#8b95aa]">
          No upcoming milestones.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {milestones.map((milestone) => (
            <Link
              key={milestone.id}
              href={milestone.href}
              className="block rounded-lg border border-[#e5e8f0] p-3 transition-colors duration-150 hover:bg-[#f7f8fc]"
            >
              <p className="text-sm font-semibold text-[#11182d]">
                {milestone.project}
              </p>
              <p className="mt-0.5 text-xs text-[#5f6b86]">{milestone.name}</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[#8b95aa]">
                <Calendar className="h-3 w-3" />
                <span>{milestone.date}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
