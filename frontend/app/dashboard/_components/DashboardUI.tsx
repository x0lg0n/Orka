import {
  CircleDollarSign,
  FileText,
  FolderKanban,
  Landmark,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "cyan" | "violet" | "teal" | "orange" | "lime" | "coral";

export const metricIcons = {
  proposals: FileText,
  projects: FolderKanban,
  payments: CircleDollarSign,
  value: Landmark,
};

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const toneClasses: Record<Tone, string> = {
  cyan: "border-cyan-200/30 bg-cyan-300/15 text-cyan-100",
  violet: "border-violet/30 bg-violet/15 text-violet",
  teal: "border-teal/30 bg-teal/15 text-teal",
  orange: "border-orange/30 bg-orange/15 text-orange",
  lime: "border-lime/30 bg-lime/15 text-lime",
  coral: "border-coral/30 bg-coral/15 text-coral",
};

const statusTone: Record<string, string> = {
  draft: "border-white/10 bg-white/10 text-slate-200",
  active: "border-lime/30 bg-lime/15 text-lime",
  closed: "border-white/10 bg-white/10 text-slate-300",
  completed: "border-teal/30 bg-teal/15 text-teal",
  archived: "border-white/10 bg-white/10 text-slate-400",
  funded: "border-violet/30 bg-violet/15 text-violet",
  in_review: "border-orange/30 bg-orange/15 text-orange",
  approved: "border-lime/30 bg-lime/15 text-lime",
  released: "border-teal/30 bg-teal/15 text-teal",
  refunded: "border-coral/30 bg-coral/15 text-coral",
  disputed: "border-orange/30 bg-orange/15 text-orange",
  confirmed: "border-teal/30 bg-teal/15 text-teal",
};

export function GlassPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-border bg-panel text-white shadow-product-card",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200/70">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[34px] font-black tracking-[-0.03em] text-white text-balance">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-400">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ status }: { status?: string | null }) {
  const label = status ?? "unknown";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em]",
        statusTone[label] ?? "border-white/10 bg-white/10 text-slate-300",
      )}
    >
      {label.replaceAll("_", " ")}
    </span>
  );
}

export function AlertBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 rounded-[18px] border border-orange/25 bg-orange/10 px-4 py-3 text-sm font-bold text-orange">
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <GlassPanel className="p-8 text-center">
      <p className="text-lg font-black text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm font-bold leading-6 text-slate-400">
        {description}
      </p>
    </GlassPanel>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  spark,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: Tone;
  spark: number[];
}) {
  return (
    <GlassPanel className="min-h-52 p-5">
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "grid size-12 place-items-center rounded-[18px] border shadow-[0_0_28px_rgba(255,255,255,0.05)]",
            toneClasses[tone],
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
          Live
        </span>
      </div>
      <p className="mt-6 text-sm font-bold text-white">{label}</p>
      <p className="mt-4 text-3xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-sm font-bold text-slate-400">{detail}</p>
      <MiniSparkline values={spark} tone={tone} />
    </GlassPanel>
  );
}

function MiniSparkline({ values, tone }: { values: number[]; tone: Tone }) {
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? 100 / (values.length - 1) : 100;
  const points = values
    .map((value, index) => {
      const x = index * step;
      const y = 34 - (value / max) * 28;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const color = {
    cyan: "text-cyan-200",
    violet: "text-violet",
    teal: "text-teal",
    orange: "text-orange",
    lime: "text-lime",
    coral: "text-coral",
  }[tone];

  return (
    <svg
      viewBox="0 0 100 40"
      className={cn("mt-4 h-12 w-full overflow-visible", color)}
      role="img"
      aria-label="Trend"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

export function CashFlowChart({
  funded,
  released,
  pending,
}: {
  funded: number;
  released: number;
  pending: number;
}) {
  const values = [
    Math.max(1, Math.round(pending * 0.18)),
    Math.max(1, Math.round(funded * 0.24)),
    Math.max(1, Math.round(released * 0.3)),
    Math.max(1, Math.round(pending * 0.38)),
    Math.max(1, Math.round(funded * 0.48)),
    Math.max(1, Math.round(released * 0.62)),
    Math.max(1, Math.round(pending + funded + released)),
  ];
  const max = Math.max(...values, 1);

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-white">Cash Flow</h2>
          <p className="mt-5 text-4xl font-black tracking-tight text-white">
            +${(funded + released).toLocaleString()}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-400">
            funded and released milestone value
          </p>
        </div>
        <StatusPill status="confirmed" />
      </div>

      <div className="mt-8 flex h-40 items-end gap-3">
        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className="flex flex-1 items-end rounded-full bg-white/[0.045] p-1"
          >
            <div
              className="w-full rounded-full bg-gradient-to-t from-violet via-orange to-cyan-300 shadow-[0_0_24px_rgba(148,116,255,0.35)]"
              style={{ height: `${Math.max(10, (value / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

export function ActivityFeed({
  items,
}: {
  items: Array<{
    id: string;
    label: string;
    amount: number | null;
    status: string | null;
  }>;
}) {
  return (
    <GlassPanel className="p-5 sm:p-6">
      <h2 className="text-lg font-black text-white">Recent Activity</h2>
      <div className="mt-5 flex flex-col">
        {items.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-white/10 bg-black/20 p-5 text-sm font-bold text-slate-400">
            No activity yet. Fund or release a milestone to start the audit trail.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 border-b border-white/10 py-4 last:border-b-0"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-teal/40 bg-teal/15 text-teal">
                <span className="size-2 rounded-full bg-current" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {item.label?.replaceAll("_", " ") || "Ledger event"}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  {item.amount != null
                    ? `$${Number(item.amount).toLocaleString()}`
                    : "No amount"}{" "}
                  {item.status ? `- ${item.status}` : ""}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassPanel>
  );
}
