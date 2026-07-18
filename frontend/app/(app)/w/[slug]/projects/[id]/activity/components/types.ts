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
  description: string | null;
  amount: number;
  asset: string;
  status: string;
  created_at: string;
};

type FileRow = {
  id: string;
  name: string;
  size: number | null;
  created_at: string;
  uploaded_by: string | null;
};

type ContractRow = {
  id: string;
  title: string | null;
  status: string;
  created_at: string;
};

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  author_id: string | null;
};

type ActivityRow = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
  actor_id: string | null;
};

type NoteRow = {
  id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
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

function getActorName(
  actorId: string | null,
  profiles: ProfileRow[]
): string | null {
  if (!actorId) return null;
  return profiles.find((p) => p.id === actorId)?.full_name ?? null;
}

export function generateActivityItems(
  projectId: string,
  milestones: MilestoneRow[],
  files: FileRow[],
  contracts: ContractRow[],
  comments: CommentRow[],
  activity: ActivityRow[],
  notes: NoteRow[],
  profiles: ProfileRow[]
): ActivityGroup[] {
  const items: ActivityItem[] = [];

  for (const m of milestones) {
    const isCompleted = m.status === "released" || m.status === "approved";
    items.push({
      id: `milestone-${m.id}`,
      projectId,
      type: "milestone",
      title: `"${m.title ?? "Untitled Milestone"}" ${isCompleted ? "marked as completed" : "updated"}`,
      description: `${Number(m.amount).toLocaleString("en-US", { maximumFractionDigits: 0 })} ${m.asset}`,
      createdBy: null,
      createdByName: null,
      createdAt: m.created_at,
      time: formatTime(m.created_at),
      category: "milestone",
      badge: "Milestones",
    });
  }

  for (const f of files) {
    items.push({
      id: `file-${f.id}`,
      projectId,
      type: "file",
      title: `"${f.name}" uploaded`,
      description: f.size
        ? `${(f.size / 1024).toFixed(1)} KB`
        : "File uploaded",
      createdBy: f.uploaded_by,
      createdByName: getActorName(f.uploaded_by, profiles),
      createdAt: f.created_at,
      time: formatTime(f.created_at),
      category: "file",
      badge: "Files",
    });
  }

  for (const c of contracts) {
    items.push({
      id: `contract-${c.id}`,
      projectId,
      type: "contract",
      title:
        c.status === "signed"
          ? "Contract signed"
          : `Contract "${c.title ?? "Untitled"}" ${c.status}`,
      description:
        c.status === "signed"
          ? "Both parties completed signing."
          : `Contract status: ${c.status}`,
      createdBy: null,
      createdByName: null,
      createdAt: c.created_at,
      time: formatTime(c.created_at),
      category: "contract",
      badge: "Contracts",
    });
  }

  for (const act of activity) {
    const type = act.type;
    let category: ActivityCategory = "system";
    let title = "Activity recorded";
    const description =
      typeof act.payload?.description === "string"
        ? act.payload.description
        : "Event recorded.";
    let badge = "System";

    if (type === "comment" || type === "client_commented") {
      category = "comment";
      title = "Client commented";
      badge = "Comments";
    } else if (type === "feedback") {
      category = "client";
      title = "Client feedback";
      badge = "Client";
    } else if (type === "milestone_completed") {
      category = "milestone";
      title = "Milestone completed";
      badge = "Milestones";
    } else if (type === "payment_released") {
      category = "payment";
      title = "Payment released";
      badge = "Payments";
    } else if (type === "proposal_accepted" || type === "proposal_sent") {
      category = "proposal";
      title = "Proposal updated";
      badge = "Proposal";
    } else if (type === "contract_signed") {
      category = "contract";
      title = "Contract signed";
      badge = "Contracts";
    } else if (type === "escrow_funded") {
      category = "escrow";
      title = "Escrow funded";
      badge = "Escrow";
    } else if (type === "files_uploaded") {
      category = "file";
      title = "Files uploaded";
      badge = "Files";
    } else if (type.startsWith("ai_")) {
      category = "ai";
      title = type.replace("ai_", "").replace(/_/g, " ");
      title = title.charAt(0).toUpperCase() + title.slice(1);
      badge = "AI";
    } else if (type.startsWith("client_")) {
      category = "client";
      title = type.replace("client_", "").replace(/_/g, " ");
      title = title.charAt(0).toUpperCase() + title.slice(1);
      badge = "Client";
    }

    items.push({
      id: `activity-${act.id}`,
      projectId,
      type: act.type,
      title,
      description,
      createdBy: act.actor_id,
      createdByName: getActorName(act.actor_id, profiles),
      createdAt: act.created_at,
      time: formatTime(act.created_at),
      category,
      badge,
    });
  }

  for (const n of notes) {
    items.push({
      id: `note-${n.id}`,
      projectId,
      type: "note",
      title: "Internal Note added",
      description: n.title,
      createdBy: n.created_by,
      createdByName: getActorName(n.created_by, profiles),
      createdAt: n.created_at,
      time: formatTime(n.created_at),
      category: "note",
      badge: "Notes",
    });
  }

  for (const c of comments) {
    items.push({
      id: `comment-${c.id}`,
      projectId,
      type: "comment",
      title: "Comment added",
      description:
        c.content.length > 120 ? c.content.slice(0, 120) + "..." : c.content,
      createdBy: c.author_id,
      createdByName: getActorName(c.author_id, profiles),
      createdAt: c.created_at,
      time: formatTime(c.created_at),
      category: "comment",
      badge: "Comments",
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
