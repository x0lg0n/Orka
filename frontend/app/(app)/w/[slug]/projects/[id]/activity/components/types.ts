export type SummaryStats = {
  totalActivities: number;
  totalMilestones: number;
  totalPayments: number;
  totalFiles: number;
  totalComments: number;
  totalContracts: number;
};

export type Contributor = {
  name: string;
  count: number;
};

export type Note = {
  id: string;
  title: string;
  description: string | null;
  created_by_name: string | null;
  created_at: string;
};

export type ActivityCategory =
  | "milestone"
  | "payment"
  | "proposal"
  | "contract"
  | "escrow"
  | "file"
  | "comment"
  | "note"
  | "ai"
  | "client"
  | "system";

export type ActivityItem = {
  id: string;
  projectId: string;
  type: string;
  title: string;
  description: string;
  createdBy: string | null;
  createdByName: string | null;
  createdAt: string;
  time: string;
  category: ActivityCategory;
  badge: string;
};

export type ActivityGroup = {
  date: string;
  label: string;
  items: ActivityItem[];
};

type MilestoneRow = {
  id: string;
  title: string | null;
  description?: string | null;
  amount: number;
  asset: string;
  status: string;
  created_at: string;
};

type PaymentRow = {
  id: string;
  project_id: string | null;
  milestone_id: string | null;
  invoice_id: string | null;
  payment_type: "escrow" | "milestone" | "invoice" | "refund";
  amount: number;
  currency: string | null;
  status: "completed" | "pending" | "failed" | "released" | "processing" | null;
  tx_hash: string | null;
  created_at: string;
};

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (itemDate.getTime() === today.getTime()) return "Today";
  if (itemDate.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function generateActivityItems(
  projectId: string,
  milestones: MilestoneRow[],
  payments: PaymentRow[]
): ActivityGroup[] {
  const items: ActivityItem[] = [];

  for (const m of milestones) {
    const isCompleted = m.status === "released" || m.status === "approved";
    const isDisputed = m.status === "disputed";
    const label = isDisputed
      ? "disputed"
      : isCompleted
        ? "marked as completed"
        : "status updated";
    items.push({
      id: `milestone-${m.id}`,
      projectId,
      type: "milestone",
      title: `"${m.title ?? "Untitled Milestone"}" ${label}`,
      description: `${Number(m.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${m.asset} · ${m.status}`,
      createdBy: null,
      createdByName: null,
      createdAt: m.created_at,
      time: formatTime(m.created_at),
      category: "milestone",
      badge: "Milestones",
    });
  }

  for (const p of payments) {
    const amount = Number(p.amount ?? 0);
    const currency = p.currency ?? "";
    let category: ActivityCategory = "payment";
    let title = "Payment recorded";
    let badge = "Payments";

    if (p.payment_type === "escrow") {
      category = "escrow";
      title = "Escrow funded";
      badge = "Escrow";
    } else if (p.payment_type === "milestone") {
      category = "milestone";
      title = "Milestone payment released";
      badge = "Milestones";
    } else if (p.payment_type === "invoice") {
      category = "payment";
      title = "Invoice payment";
      badge = "Payments";
    } else if (p.payment_type === "refund") {
      category = "payment";
      title = "Refund issued";
      badge = "Payments";
    }

    const statusSuffix =
      p.status && p.status !== "completed" ? ` · ${p.status}` : "";
    items.push({
      id: `payment-${p.id}`,
      projectId,
      type: p.payment_type,
      title,
      description: `${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })} ${currency}${statusSuffix}`,
      createdBy: null,
      createdByName: null,
      createdAt: p.created_at,
      time: formatTime(p.created_at),
      category,
      badge,
    });
  }

  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const grouped = new Map<string, ActivityItem[]>();
  for (const item of items) {
    const key = toDateKey(item.createdAt);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(item);
  }

  const groups: ActivityGroup[] = [];
  for (const [dateKey, groupItems] of grouped) {
    groups.push({
      date: dateKey,
      label: formatDateLabel(groupItems[0].createdAt),
      items: groupItems,
    });
  }

  return groups;
}
