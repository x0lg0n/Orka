import Link from "next/link";
import { Calendar } from "lucide-react";

type UpcomingEvent = {
  title: string;
  dueDate: string;
  dueIn: string;
};

function DueBadge({ dueIn }: { dueIn: string }) {
  const isSoon = dueIn.includes("today") || dueIn.includes("tomorrow");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        isSoon
          ? "bg-amber-50 text-amber-600"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {dueIn}
    </span>
  );
}

export function UpcomingEventsCard({
  events,
  slug,
  projectId,
}: {
  events: UpcomingEvent[];
  slug: string;
  projectId: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Upcoming Events
        </h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/milestones`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="mt-4 text-center text-sm text-gray-400">
          No upcoming events
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {events.map((event, i) => (
            <div
              key={`${event.title}-${i}`}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#7c3aed]/10">
                  <Calendar className="h-3.5 w-3.5 text-[#7c3aed]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-400">{event.dueDate}</p>
                </div>
              </div>
              <DueBadge dueIn={event.dueIn} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
