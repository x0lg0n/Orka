import { ArrowRight } from "lucide-react";
import {
  Banknote,
  FileSignature,
  HandCoins,
  Pencil,
  Scale,
  ShieldAlert,
} from "lucide-react";
import type { ActivityEventType, Activity } from "@/types/dashboard";
import { EmptyState } from "@/components/dashboard/EmptyState";

type Tone = "cyan" | "violet" | "teal" | "orange" | "lime" | "coral";

const activityIcon: Record<ActivityEventType, typeof Pencil> = {
  release: HandCoins,
  sign: FileSignature,
  edit: Pencil,
  fund: Banknote,
  dispute: ShieldAlert,
  refund: Scale,
};

const activityTone: Record<ActivityEventType, Tone> = {
  release: "teal",
  sign: "violet",
  edit: "cyan",
  fund: "lime",
  dispute: "orange",
  refund: "coral",
};

const toneClasses: Record<Tone, string> = {
  cyan: "border-cyan-200/30 bg-cyan-300/15 text-cyan-100",
  violet: "border-violet/30 bg-violet/15 text-violet",
  teal: "border-teal/30 bg-teal/15 text-teal",
  orange: "border-orange/30 bg-orange/15 text-orange",
  lime: "border-lime/30 bg-lime/15 text-lime",
  coral: "border-coral/30 bg-coral/15 text-coral",
};

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <h2 className="mb-4 text-base font-bold text-[#11182d]">Recent Activity</h2>

      {activities.length === 0 ? (
        <EmptyState
          compact
          tone="cyan"
          icon={Scale}
          title="No activity yet"
          description="Fund, release, or sign off on a milestone to start your on-chain audit trail."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {activities.map((activity) => {
            const Icon = activityIcon[activity.eventType];
            const tone = activityTone[activity.eventType];

            return (
              <div key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toneClasses[tone]}`}
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
      )}

      <button className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#7c3aed] transition-colors duration-150 hover:text-[#6d28d9]">
        View all activity
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
