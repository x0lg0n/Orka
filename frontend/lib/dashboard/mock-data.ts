import {
  FolderKanban,
  Lock,
  Clock,
  CircleDollarSign,
  FileSignature,
  FileEdit,
  Wallet,
  Calendar,
} from "lucide-react";
import type {
  DashboardUser,
  MetricData,
  Milestone,
  Approval,
  Activity,
  Project,
  QuickSummaryData,
  DashboardData,
} from "@/types/dashboard";

export const currentUser: DashboardUser = {
  id: "usr_01",
  firstName: "Siddhartha",
  lastName: "Sharma",
  avatar: undefined,
};

export const metrics: MetricData[] = [
  {
    title: "Total Projects",
    value: "8",
    subtitle: "↑ 2 from last month",
    icon: FolderKanban,
    trend: "+2",
    trendUp: true,
    iconBg: "bg-purple-100",
  },
  {
    title: "Funds in Escrow",
    value: "450 XLM",
    subtitle: "≈ $256.30 USD",
    icon: Lock,
    iconBg: "bg-purple-100",
  },
  {
    title: "Pending Approvals",
    value: "3",
    subtitle: "Requires your action",
    icon: Clock,
    trend: "Requires your action",
    trendUp: false,
    iconBg: "bg-yellow-100",
  },
  {
    title: "Payments Received",
    value: "1,250 XLM",
    subtitle: "≈ $712.50 USD",
    icon: CircleDollarSign,
    iconBg: "bg-green-100",
  },
];

export const approvals: Approval[] = [
  {
    id: "apr_1",
    project: "Acme Website Redesign",
    description: "Milestone 2 is waiting for client approval",
    type: "review",
  },
  {
    id: "apr_2",
    project: "Brand Identity Design",
    description: "Contract is pending your signature",
    type: "sign",
  },
  {
    id: "apr_3",
    project: "Mobile App Development",
    description: "Payment is ready to be released",
    type: "release",
  },
];

export const activities: Activity[] = [
  {
    id: "act_1",
    text: "Payment released for",
    boldPart: "Acme Website Redesign – Milestone 1",
    timestamp: "2 hours ago",
    icon: CircleDollarSign,
    iconBg: "bg-green-100 text-green-600",
  },
  {
    id: "act_2",
    text: "New contract signed for",
    boldPart: "Brand Identity Design",
    timestamp: "5 hours ago",
    icon: FileSignature,
    iconBg: "bg-purple-100 text-purple-600",
  },
  {
    id: "act_3",
    text: "Client requested changes in",
    boldPart: "Landing Page Design",
    timestamp: "1 day ago",
    icon: FileEdit,
    iconBg: "bg-yellow-100 text-yellow-600",
  },
  {
    id: "act_4",
    text: "Escrow funded for",
    boldPart: "Mobile App Development",
    timestamp: "2 days ago",
    icon: Wallet,
    iconBg: "bg-blue-100 text-blue-600",
  },
];

export const milestones: Milestone[] = [
  {
    id: "ms_1",
    project: "Acme Website Redesign",
    name: "Milestone 3 – Development",
    date: "May 28, 2025",
    icon: Calendar,
  },
  {
    id: "ms_2",
    project: "Mobile App Development",
    name: "Milestone 2 – UI/UX",
    date: "May 30, 2025",
    icon: Calendar,
  },
  {
    id: "ms_3",
    project: "E-commerce Platform",
    name: "Milestone 1 – Planning",
    date: "Jun 02, 2025",
    icon: Calendar,
  },
];

export const projects: Project[] = [
  {
    id: "prj_1",
    name: "Acme Website Redesign",
    client: "Acme Corp",
    progress: 60,
    escrow: "200 XLM",
    status: "In Progress",
    nextMilestone: "Development",
    nextDate: "May 28, 2025",
  },
  {
    id: "prj_2",
    name: "Brand Identity Design",
    client: "DesignHub",
    progress: 40,
    escrow: "100 XLM",
    status: "Pending Approval",
    nextMilestone: "Logo Concepts",
    nextDate: "May 25, 2025",
  },
  {
    id: "prj_3",
    name: "Mobile App Development",
    client: "TechStart Inc.",
    progress: 70,
    escrow: "150 XLM",
    status: "In Progress",
    nextMilestone: "UI/UX Design",
    nextDate: "May 30, 2025",
  },
];

export const summary: QuickSummaryData = {
  period: "This Month",
  revenue: "1,250 XLM",
  revenueTrend: "12%",
  revenueUp: true,
  completedProjects: 3,
  completedTrend: "1",
  completedUp: true,
  totalClients: 6,
  clientsTrend: "2",
  clientsUp: true,
};

export const dashboardData: DashboardData = {
  user: currentUser,
  metrics,
  approvals,
  activities,
  milestones,
  projects,
  summary,
};
