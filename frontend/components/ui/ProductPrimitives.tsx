import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function IconBadge({
  icon: Icon,
  tone = "violet",
}: {
  icon: LucideIcon;
  tone?: "violet" | "success" | "warning" | "info" | "danger";
}) {
  return (
    <span className={`product-icon product-icon-${tone}`}>
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

export function ProgressBar({ value, tone = "primary" }: { value: number; tone?: "primary" | "success" | "warning" | "danger" }) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div className="product-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}>
      <span className={`product-progress-fill product-progress-${tone}`} style={{ width: `${safeValue}%` }} />
    </div>
  );
}

export function DataTable({ children }: { children: ReactNode }) {
  return <div className="product-table-wrap">{children}</div>;
}

export function Timeline({
  items,
}: {
  items: Array<{ title: string; detail?: string; status?: "complete" | "current" | "pending" }>;
}) {
  return (
    <ol className="product-timeline">
      {items.map((item) => (
        <li key={`${item.title}-${item.detail ?? ""}`} className="product-timeline-item">
          <span className={`product-timeline-dot product-timeline-${item.status ?? "pending"}`} />
          <div className="min-w-0">
            <p className="font-bold text-white">{item.title}</p>
            {item.detail ? <p className="mt-1 text-sm text-white/50">{item.detail}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SummaryRow({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="text-sm font-bold text-white/55">{label}</span>
      {children ?? <span className="text-right text-sm font-extrabold text-white">{value}</span>}
    </div>
  );
}
