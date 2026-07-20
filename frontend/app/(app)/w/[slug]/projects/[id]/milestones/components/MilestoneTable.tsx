import { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  CheckCircle2,
  Send,
  Banknote,
  Trash2,
  Calendar,
  Plus,
  GripVertical,
  Search,
  LayoutList,
  LayoutGrid,
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
  const map: Record<string, { label: string; color: string; dot: string }> = {
    released: {
      label: "Completed",
      color: "bg-emerald-50 text-emerald-600",
      dot: "bg-emerald-500",
    },
    approved: {
      label: "Approved",
      color: "bg-emerald-50 text-emerald-600",
      dot: "bg-emerald-500",
    },
    funded: {
      label: "In Progress",
      color: "bg-blue-50 text-blue-600",
      dot: "bg-blue-500",
    },
    in_review: {
      label: "In Review",
      color: "bg-purple-50 text-purple-600",
      dot: "bg-purple-500",
    },
    draft: {
      label: "Pending",
      color: "bg-amber-50 text-amber-600",
      dot: "bg-amber-500",
    },
  };
  return (
    map[status] ?? {
      label: status,
      color: "bg-gray-100 text-gray-600",
      dot: "bg-gray-400",
    }
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function DueDateDisplay({
  dueDate,
  status,
}: {
  dueDate: string | null;
  status: string;
}) {
  if (!dueDate) {
    return <span className="text-sm text-gray-400">No date</span>;
  }

  const isCompleted = status === "released" || status === "approved";
  const date = new Date(dueDate);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let colorClass = "text-gray-500";
  let badge = "";

  if (isCompleted) {
    colorClass = "text-gray-500";
    badge = `Completed ${formatDate(dueDate)}`;
  } else if (diffDays < 0) {
    colorClass = "text-red-500";
    badge = "Overdue";
  } else if (diffDays <= 3) {
    colorClass = "text-amber-600";
    badge = diffDays === 0 ? "Due today" : `${diffDays} days left`;
  } else {
    colorClass = "text-gray-500";
    badge = `${diffDays} days left`;
  }

  return (
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-sm text-gray-700">
        <Calendar className="h-3.5 w-3.5 text-gray-400" />
        {formatDate(dueDate)}
      </span>
      <span className={`text-xs ${colorClass}`}>{badge}</span>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    released: { label: "Paid", color: "bg-emerald-50 text-emerald-600" },
    funded: { label: "Locked", color: "bg-[#7c3aed]/10 text-[#7c3aed]" },
    approved: { label: "Released", color: "bg-blue-50 text-blue-600" },
    in_review: {
      label: "Awaiting Approval",
      color: "bg-amber-50 text-amber-600",
    },
    draft: { label: "Pending", color: "bg-gray-100 text-gray-500" },
  };
  const cfg = map[status] ?? map.draft;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}
    >
      {cfg.label}
    </span>
  );
}

function ActionsDropdown() {
  const [open, setOpen] = useState(false);
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

  const items = [
    { label: "View", icon: Eye },
    { label: "Edit", icon: Pencil },
    { label: "Duplicate", icon: Copy },
    { label: "Mark Complete", icon: CheckCircle2 },
    { label: "Request Approval", icon: Send },
    { label: "Release Payment", icon: Banknote },
    { label: "Delete", icon: Trash2, danger: true },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setOpen(false)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-600"
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
  onAdd,
}: {
  milestones: MilestoneRow[];
  onAdd: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Milestones</h3>
          <p className="text-xs text-gray-500">
            Track deliverables, approvals and payments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            <Search className="h-3.5 w-3.5" />
            Filter
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            <LayoutList className="h-3.5 w-3.5" />
            List View
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Board View
          </button>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="px-4 py-12 text-center text-sm text-gray-400">
          No milestones yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-4 py-2.5 font-medium">#</th>
                <th className="px-4 py-2.5 font-medium">Milestone</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Due Date</th>
                <th className="px-4 py-2.5 font-medium">Amount</th>
                <th className="px-4 py-2.5 font-medium">Payment</th>
                <th className="px-4 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {milestones.map((m, i) => {
                const cfg = statusConfig(m.status);
                return (
                  <tr
                    key={m.id}
                    className="group border-b border-gray-50 transition hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-medium text-gray-600">
                        {i + 1}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-gray-300 opacity-0 transition group-hover:opacity-100" />
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
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <DueDateDisplay
                        dueDate={m.due_date}
                        status={m.status}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {Number(m.amount).toLocaleString("en-US", {
                            maximumFractionDigits: 0,
                          })}{" "}
                          {m.asset}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          ~${(Number(m.amount) * 0.15).toFixed(0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={m.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionsDropdown />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-gray-100 px-4 py-2.5">
        <button
          type="button"
          onClick={onAdd}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-sm font-medium text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </button>
      </div>
    </div>
  );
}
