import {
  FolderPlus,
  FileSignature,
  CircleDollarSign,
  UserPlus,
  ArrowRight,
} from "lucide-react";

const ACTIVITIES = [
  {
    icon: FolderPlus,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-500",
    text: "New project created by",
    entity: "Acme Corp",
    time: "2 hours ago",
  },
  {
    icon: FileSignature,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    text: "Contract signed by",
    entity: "Google LLC",
    time: "1 day ago",
  },
  {
    icon: CircleDollarSign,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    text: "Payment received from",
    entity: "Microsoft",
    time: "3 days ago",
  },
  {
    icon: UserPlus,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    text: "Client invited",
    entity: "Notion Labs",
    time: "1 week ago",
  },
];

export function RecentActivityCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">
        Recent Client Activity
      </h3>

      <div className="mt-4 flex flex-col gap-4">
        {ACTIVITIES.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${a.iconBg}`}
            >
              <a.icon className={`h-4 w-4 ${a.iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-600">
                {a.text}{" "}
                <span className="font-semibold text-gray-900">{a.entity}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">{a.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-[#7c3aed] transition hover:bg-gray-50"
      >
        View all activity
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
