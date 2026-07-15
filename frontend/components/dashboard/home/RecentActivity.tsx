import { ArrowRight } from "lucide-react";
import type { Activity } from "@/types/dashboard";

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <h2 className="mb-4 text-base font-bold text-[#11182d]">
        Recent Activity
      </h2>

      <div className="flex flex-col gap-4">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div key={activity.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${activity.iconBg}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-sm text-[#5f6b86]">
                  {activity.text}{" "}
                  <span className="font-semibold text-[#11182d]">
                    {activity.boldPart}
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-[#8b95aa]">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#7c3aed] transition-colors duration-150 hover:text-[#6d28d9]">
        View all activity
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
