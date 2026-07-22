import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  Banknote,
  FileSignature,
  HandCoins,
  Pencil,
  Scale,
  ShieldAlert,
} from "lucide-react";
import type { Activity, ActivityEventType } from "@/types/dashboard";

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
  cyan: "bg-sky-100 text-sky-700",
  violet: "bg-violet/15 text-[#6544dd]",
  teal: "bg-teal/15 text-[#087d61]",
  orange: "bg-orange/15 text-[#b85400]",
  lime: "bg-[#eaff35]/30 text-[#436400]",
  coral: "bg-coral/15 text-[#c9342a]",
};

interface RecentActivityProps {
  activities: Activity[];
  slug: string;
}

export function RecentActivity({ activities, slug }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <h2 className="mb-4 text-base font-bold text-[#11182d]">Recent Activity</h2>

      {activities.length === 0 ? (
        <p className="py-2 text-sm font-medium text-[#8b95aa]">
          No activity yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {activities.map((activity) => {
            const Icon = activityIcon[activity.eventType];
            const tone = activityTone[activity.eventType];

            const inner = (
              <div className="flex gap-3">
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

            return activity.href ? (
              <Link
                key={activity.id}
                href={activity.href}
                className="block rounded-lg transition-colors duration-150 hover:bg-[#f7f8fc]"
              >
                {inner}
              </Link>
            ) : (
              <div key={activity.id}>{inner}</div>
            );
          })}
        </div>
      )}

      <Link
        href={`/w/${slug}/projects`}
        className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-[#7c3aed] transition-colors duration-150 hover:text-[#6d28d9]"
      >
        View all activity
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
