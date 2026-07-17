import type { LucideIcon } from "lucide-react";

export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export type MetricKey = "projects" | "escrow" | "approvals" | "payments";

export interface MetricData {
  title: string;
  value: string;
  subtitle: string;
  icon?: LucideIcon;
  iconBg?: string;
  metricKey: MetricKey;
  href: string;
  trend?: string;
  trendUp?: boolean;
}

export interface Milestone {
  id: string;
  project: string;
  name: string;
  date: string;
  icon?: LucideIcon;
  projectId?: string;
  href?: string;
}

export type ApprovalType = "review" | "sign" | "release";

export interface Approval {
  id: string;
  project: string;
  description: string;
  type: ApprovalType;
  projectId?: string;
  href?: string;
}

export type ActivityEventType =
  | "release"
  | "sign"
  | "edit"
  | "fund"
  | "dispute"
  | "refund";

export interface Activity {
  id: string;
  eventType: ActivityEventType;
  text: string;
  boldPart: string;
  timestamp: string;
  projectId?: string;
  href?: string;
  icon?: LucideIcon;
  iconBg?: string;
}

export type ProjectStatus =
  | "Pending"
  | "Pending Approval"
  | "In Progress"
  | "Completed"
  | "Archived";

export interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  escrow: string;
  status: ProjectStatus;
  nextMilestone: string;
  nextDate: string;
  href: string;
}

export interface QuickSummaryData {
  period: string;
  revenue: string;
  revenueTrend: string;
  revenueUp: boolean;
  completedProjects: number;
  completedTrend: string;
  completedUp: boolean;
  totalClients: number;
  clientsTrend: string;
  clientsUp: boolean;
}

export interface DashboardData {
  user: DashboardUser;
  metrics: MetricData[];
  approvals: Approval[];
  activities: Activity[];
  milestones: Milestone[];
  projects: Project[];
  summary: QuickSummaryData;
}
