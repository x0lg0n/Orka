import {
  FolderKanban,
  TrendingUp,
  CheckCircle2,
  Pause,
  DollarSign,
} from "lucide-react";

const STAT_CARDS = [
  {
    label: "Total Projects",
    value: "24",
    detail: "2 from last month",
    icon: FolderKanban,
    color: "text-violet-500",
    bg: "bg-violet-50",
    pct: null as number | null,
  },
  {
    label: "In Progress",
    value: "12",
    detail: "50% of total",
    icon: TrendingUp,
    color: "text-amber-500",
    bg: "bg-amber-50",
    pct: 50,
  },
  {
    label: "Completed",
    value: "8",
    detail: "33% of total",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    pct: 33,
  },
  {
    label: "On Hold",
    value: "2",
    detail: "8% of total",
    icon: Pause,
    color: "text-amber-600",
    bg: "bg-amber-50",
    pct: 8,
  },
  {
    label: "Total Value",
    value: "2,450 XLM",
    detail: "$1,412.50 USD",
    icon: DollarSign,
    color: "text-violet-500",
    bg: "bg-violet-50",
    pct: null,
  },
];

export function ProjectStats() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
      {STAT_CARDS.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}
            >
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <span className="text-sm font-medium text-gray-500">
              {card.label}
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{card.value}</p>
          {card.pct !== null ? (
            <div className="mt-2">
              <p className="text-xs text-gray-500">{card.detail}</p>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100">
                <div
                  className={`h-1.5 rounded-full ${card.color.replace("text-", "bg-")}`}
                  style={{ width: `${card.pct}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-500">
              <TrendingUp className="h-3 w-3" />
              {card.detail}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
