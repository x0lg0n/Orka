import type { LucideIcon } from "lucide-react";

export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface MetricData {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  iconBg: string;
}

export interface Milestone {
  id: string;
  project: string;
  name: string;
  date: string;
  icon: LucideIcon;
}

export interface Approval {
  id: string;
  project: string;
  description: string;
  type: "review" | "sign" | "release";
}

export interface Activity {
  id: string;
  text: string;
  boldPart: string;
  timestamp: string;
  icon: LucideIcon;
  iconBg: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  escrow: string;
  status: "In Progress" | "Pending Approval" | "Completed";
  nextMilestone: string;
  nextDate: string;
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
