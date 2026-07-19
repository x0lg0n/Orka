export type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "archived";

export type ProposalRow = {
  id: string;
  org_id: string;
  project_id: string;
  title: string;
  amount: number;
  currency: string;
  usd_equivalent: number | null;
  summary: string | null;
  content: string | null;
  status: ProposalStatus;
  valid_until: string | null;
  accepted_at: string | null;
  payment_terms: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProposalSection = {
  id: string;
  proposal_id: string;
  title: string;
  content: string | null;
  position: number;
  created_at: string;
};

export type ProposalPricingItem = {
  id: string;
  proposal_id: string;
  label: string;
  amount: number;
  currency: string;
  category: string | null;
  position: number;
  created_at: string;
};

export type ProposalNote = {
  id: string;
  proposal_id: string;
  content: string;
  created_by: string | null;
  created_at: string;
};

export type ProposalActivityItem = {
  id: string;
  proposal_id: string;
  type: string;
  payload: Record<string, unknown>;
  actor_id: string | null;
  created_at: string;
};

export type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  client_id: string | null;
  client_name: string | null;
  client_email: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
};

export type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  avatar_url: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
} | null;

export type OwnerRow = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

export const PROPOSAL_STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; badge: string; dot: string }
> = {
  draft: {
    label: "Draft",
    badge: "bg-gray-100 text-gray-600 border border-gray-200",
    dot: "bg-gray-400",
  },
  sent: {
    label: "Sent",
    badge: "bg-blue-50 text-blue-600 border border-blue-200",
    dot: "bg-blue-500",
  },
  viewed: {
    label: "Viewed",
    badge: "bg-amber-50 text-amber-600 border border-amber-200",
    dot: "bg-amber-500",
  },
  accepted: {
    label: "Accepted",
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    badge: "bg-red-50 text-red-600 border border-red-200",
    dot: "bg-red-500",
  },
  expired: {
    label: "Expired",
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
  },
  archived: {
    label: "Archived",
    badge: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
  },
};

export const PROPOSAL_SECTIONS = [
  "Project Overview",
  "Objectives",
  "Scope of Work",
  "Deliverables",
  "Timeline",
  "Pricing",
  "Payment Terms",
  "Terms & Conditions",
  "Next Steps",
] as const;
