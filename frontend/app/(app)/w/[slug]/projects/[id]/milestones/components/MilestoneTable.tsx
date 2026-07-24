"use client";
import { useState, useRef, useEffect, useTransition } from "react";
import {
  MoreHorizontal, Eye, Pencil, CheckCircle2, Send, Banknote, Trash2, Calendar,
} from "lucide-react";

type MilestoneRow = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  asset: string;
  status: string;
  position: number | null;
  due_date: string | null;
  created_at: string;
};

function statusConfig(status: string) {
  const map: Record<string, { label: string; dot: string }> = {
    released: { label: "Released", dot: "bg-emerald-500" },
    approved: { label: "Approved", dot: "bg-blue-500" },
    funded: { label: "In Progress", dot: "bg-[#7c3aed]" },
    in_review: { label: "In Review", dot: "bg-amber-500" },
    draft: { label: "Draft", dot: "bg-gray-400" },
  };
  return map[status] ?? { label: status, dot: "bg-gray-400" };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DueDateDisplay({ dueDate, status }: { dueDate: string | null; status: string }) {
  if (!dueDate) {
    return <span className="text-sm text-gray-400">—</span>;
  }

  const done = status === "released" || status === "approved";
  const date = new Date(dueDate);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let colorClass = "text-gray-500";
  let badge = "";

  if (done) {
    colorClass = "text-gray-400";
    badge = "Completed";
  } else if (diffDays < 0) {
    colorClass = "text-red-500";
    badge = "Overdue";
  } else if (diffDays <= 3) {
    colorClass = "text-amber-600";
    badge = diffDays === 0 ? "Due today" : `${diffDays} days left`;
  } else {
    colorClass = "text-gray-400";
    badge = `${diffDays} days`;
  }

  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-sm text-gray-700">
        <Calendar className="h-3.5 w-3.5 text-gray-300" />
        {formatDate(dueDate)}
      </span>
      <span className={`text-xs ${colorClass}`}>{badge}</span>
    </div>
  );
}

function ActionsDropdown({
  milestone,
  onSubmitMilestone,
  onApprove,
  onReject,
  onRelease,
}: {
  milestone: MilestoneRow;
  onSubmitMilestone?: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onRelease?: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const items: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    danger?: boolean;
    visible: boolean;
    action?: () => void;
  }[] = [
    {
      label: "View Details",
      icon: Eye,
      visible: true,
    },
    {
      label: "Edit",
      icon: Pencil,
      visible: milestone.status === "draft",
    },
    {
      label: "Submit for Review",
      icon: Send,
      visible: (milestone.status === "draft" || milestone.status === "funded") && !!onSubmitMilestone,
      action: () => onSubmitMilestone?.(milestone.id),
    },
    {
      label: "Approve",
      icon: CheckCircle2,
      visible: milestone.status === "in_review" && !!onApprove,
      action: () => onApprove?.(milestone.id),
    },
    {
      label: "Reject",
      icon: Trash2,
      danger: true,
      visible: milestone.status === "in_review" && !!onReject,
      action: () => onReject?.(milestone.id),
    },
    {
      label: "Release Payment",
      icon: Banknote,
      visible: milestone.status === "approved" && !!onRelease,
      action: () => onRelease?.(milestone.id),
    },
  ];

  const visibleItems = items.filter((i) => i.visible);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && visibleItems.length > 0 && (
        <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {visibleItems.map((item) => (
            <button
              key={item.label}
              type="button"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                if (item.action) startTransition(() => item.action!());
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${
                item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-600"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MilestoneTable({
  milestones,
  onSubmitMilestone,
  onApprove,
  onReject,
  onRelease,
}: {
  milestones: MilestoneRow[];
  onSubmitMilestone?: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string) => Promise<void>;
  onRelease?: (id: string) => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {milestones.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-gray-400">No milestones yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="w-8 px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Milestone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {milestones.map((m, i) => {
                const cfg = statusConfig(m.status);
                return (
                  <tr
                    key={m.id}
                    className="group border-b border-gray-50 transition hover:bg-gray-50/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100 text-xs font-medium text-gray-500">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {m.title ?? `Milestone ${m.position ?? i + 1}`}
                        </p>
                        {m.description && (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600">
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <DueDateDisplay dueDate={m.due_date} status={m.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {Number(m.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
                        <span className="text-xs font-normal text-gray-500">{m.asset}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <ActionsDropdown
                        milestone={m}
                        onSubmitMilestone={onSubmitMilestone}
                        onApprove={onApprove}
                        onReject={onReject}
                        onRelease={onRelease}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
