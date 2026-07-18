"use client";

import { CheckCircle, Circle } from "lucide-react";
import type { TimelineEvent } from "./mockData";

interface PaymentTimelineProps {
  timeline: TimelineEvent[];
}

export default function PaymentTimeline({ timeline }: PaymentTimelineProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h4 className="mb-4 text-sm font-semibold text-gray-900">Payment Timeline</h4>
      <div className="relative">
        {timeline.map((event, index) => (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < timeline.length - 1 && (
              <div className="absolute left-[11px] top-6 h-full w-0.5 bg-gray-200" />
            )}
            <div className="relative z-10 flex-shrink-0">
              {event.completed ? (
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              ) : (
                <Circle className="h-6 w-6 text-gray-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${event.completed ? "text-gray-900" : "text-gray-500"}`}>
                {event.title}
              </p>
              <p className="text-xs text-gray-500">{event.timestamp}</p>
              {event.amount && (
                <p className="mt-1 text-sm font-semibold text-gray-900">{event.amount}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
