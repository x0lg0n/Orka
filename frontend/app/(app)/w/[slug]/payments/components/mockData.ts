export type PaymentType = "Escrow" | "Milestone" | "Invoice" | "Refund";
export type PaymentStatus =
  | "Completed"
  | "Pending"
  | "Failed"
  | "Released"
  | "Processing";

export interface Payment {
  id: string;
  description: string;
  project: string;
  projectId: string;
  type: PaymentType;
  amount: number;
  amountUsd: number;
  status: PaymentStatus;
  date: string;
  txHash: string;
}

export interface PaymentStats {
  totalReceived: number;
  escrowInHold: number;
  pendingRelease: number;
  totalReleased: number;
  totalFeesPaid: number;
}

export interface EscrowBreakdown {
  totalHeld: number;
  totalPending: number;
  totalReleased: number;
  totalFailed: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  time: string;
  icon: "escrow" | "release" | "milestone" | "refund";
}

export interface InsightCard {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: "trending" | "escrow" | "time" | "alert";
}

export const mockPayments: Payment[] = [
  {
    id: "pay-001",
    description: "Website Redesign - Phase 1",
    project: "Website Redesign",
    projectId: "proj-001",
    type: "Escrow",
    amount: 450,
    amountUsd: 45,
    status: "Completed",
    date: "2024-01-15",
    txHash: "0x8f7d...3e2a",
  },
  {
    id: "pay-002",
    description: "Logo Design Final Delivery",
    project: "Brand Identity",
    projectId: "proj-002",
    type: "Milestone",
    amount: 280,
    amountUsd: 28,
    status: "Pending",
    date: "2024-01-14",
    txHash: "0x4c2b...9d1f",
  },
  {
    id: "pay-003",
    description: "API Development Sprint",
    project: "Mobile App",
    projectId: "proj-003",
    type: "Invoice",
    amount: 650,
    amountUsd: 65,
    status: "Completed",
    date: "2024-01-13",
    txHash: "0x2a9c...7b4e",
  },
  {
    id: "pay-004",
    description: "UI/UX Consultation Refund",
    project: "E-commerce Platform",
    projectId: "proj-004",
    type: "Refund",
    amount: 120,
    amountUsd: 12,
    status: "Completed",
    date: "2024-01-12",
    txHash: "0x6e3d...1a8c",
  },
  {
    id: "pay-005",
    description: "Database Optimization",
    project: "SaaS Dashboard",
    projectId: "proj-005",
    type: "Escrow",
    amount: 380,
    amountUsd: 38,
    status: "Released",
    date: "2024-01-11",
    txHash: "0x1f5a...4c9d",
  },
  {
    id: "pay-006",
    description: "Content Writing Package",
    project: "Marketing Site",
    projectId: "proj-006",
    type: "Milestone",
    amount: 190,
    amountUsd: 19,
    status: "Processing",
    date: "2024-01-10",
    txHash: "0x9b8e...2d7f",
  },
  {
    id: "pay-007",
    description: "Mobile App Testing",
    project: "Mobile App",
    projectId: "proj-003",
    type: "Escrow",
    amount: 320,
    amountUsd: 32,
    status: "Pending",
    date: "2024-01-09",
    txHash: "0x3d4f...8a1b",
  },
  {
    id: "pay-008",
    description: "SEO Audit Report",
    project: "Marketing Site",
    projectId: "proj-006",
    type: "Invoice",
    amount: 150,
    amountUsd: 15,
    status: "Completed",
    date: "2024-01-08",
    txHash: "0x7c2e...5f9a",
  },
  {
    id: "pay-009",
    description: "Cloud Infrastructure Setup",
    project: "SaaS Dashboard",
    projectId: "proj-005",
    type: "Escrow",
    amount: 520,
    amountUsd: 52,
    status: "Released",
    date: "2024-01-07",
    txHash: "0x4a1d...3c8e",
  },
  {
    id: "pay-010",
    description: "Payment Gateway Integration",
    project: "E-commerce Platform",
    projectId: "proj-004",
    type: "Milestone",
    amount: 410,
    amountUsd: 41,
    status: "Failed",
    date: "2024-01-06",
    txHash: "0x8f3b...6d2a",
  },
];

export const mockPaymentStats: PaymentStats = {
  totalReceived: 2450,
  escrowInHold: 980,
  pendingRelease: 350,
  totalReleased: 1120,
  totalFeesPaid: 32.5,
};

export const mockEscrowBreakdown: EscrowBreakdown = {
  totalHeld: 980,
  totalPending: 350,
  totalReleased: 1120,
  totalFailed: 0,
};

export const mockRecentActivity: ActivityItem[] = [
  {
    id: "act-001",
    action: "Escrow funded",
    description: "Website Redesign - Phase 1",
    time: "2 hours ago",
    icon: "escrow",
  },
  {
    id: "act-002",
    action: "Payment released",
    description: "Database Optimization",
    time: "5 hours ago",
    icon: "release",
  },
  {
    id: "act-003",
    action: "Milestone completed",
    description: "Logo Design Final Delivery",
    time: "1 day ago",
    icon: "milestone",
  },
  {
    id: "act-004",
    action: "Refund processed",
    description: "UI/UX Consultation Refund",
    time: "2 days ago",
    icon: "refund",
  },
  {
    id: "act-005",
    action: "Escrow funded",
    description: "Mobile App Testing",
    time: "3 days ago",
    icon: "escrow",
  },
];

export const mockInsights: InsightCard[] = [
  {
    title: "Average Payment Size",
    value: "245 XLM",
    change: "+12% from last month",
    changeType: "positive",
    icon: "trending",
  },
  {
    title: "Escrow Utilization",
    value: "68%",
    change: "Healthy range",
    changeType: "neutral",
    icon: "escrow",
  },
  {
    title: "Average Release Time",
    value: "2.3 days",
    change: "-0.5 days faster",
    changeType: "positive",
    icon: "time",
  },
  {
    title: "Failed Transactions",
    value: "1",
    change: "Needs attention",
    changeType: "negative",
    icon: "alert",
  },
];

export const paymentTypeData = [
  { type: "Escrow", value: 1670, color: "#7c3aed" },
  { type: "Milestone", value: 880, color: "#2563eb" },
  { type: "Invoice", value: 800, color: "#16a34a" },
  { type: "Refund", value: 120, color: "#dc2626" },
];

export const projects = [
  "Website Redesign",
  "Brand Identity",
  "Mobile App",
  "E-commerce Platform",
  "SaaS Dashboard",
  "Marketing Site",
];

export const statuses: PaymentStatus[] = [
  "Completed",
  "Pending",
  "Failed",
  "Released",
  "Processing",
];
