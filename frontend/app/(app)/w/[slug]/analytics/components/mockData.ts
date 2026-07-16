export interface StatCard {
  title: string;
  value: string;
  change: string;
  changeValue: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface RevenueSource {
  name: string;
  value: number;
  color: string;
  xlm: string;
  percentage: string;
}

export interface ProjectStatus {
  name: string;
  value: number;
  color: string;
  count: string;
  percentage: string;
}

export interface TopClient {
  name: string;
  revenue: number;
  logo: string;
}

export interface CashFlowData {
  month: string;
  inflow: number;
  outflow: number;
}

export interface MilestoneData {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface Insight {
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface Report {
  title: string;
  type: string;
  icon: string;
}

export const statCards: StatCard[] = [
  {
    title: "Total Revenue",
    value: "2,450 XLM",
    change: "↑ 18.7%",
    changeValue: "vs Apr 1 – Apr 30",
    icon: "dollar",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Escrow in Hold",
    value: "980 XLM",
    change: "↑ 12.4%",
    changeValue: "vs Apr 1 – Apr 30",
    icon: "lock",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    title: "Completed Projects",
    value: "12",
    change: "↑ 33.3%",
    changeValue: "vs Apr 1 – Apr 30",
    icon: "check",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Active Projects",
    value: "18",
    change: "↑ 5.9%",
    changeValue: "vs Apr 1 – Apr 30",
    icon: "folder",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    title: "Average Project Value",
    value: "204 XLM",
    change: "↑ 8.2%",
    changeValue: "vs Apr 1 – Apr 30",
    icon: "calculator",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

export const revenueData: RevenueData[] = [
  { date: "May 1", revenue: 200 },
  { date: "May 3", revenue: 350 },
  { date: "May 5", revenue: 280 },
  { date: "May 7", revenue: 420 },
  { date: "May 9", revenue: 380 },
  { date: "May 11", revenue: 520 },
  { date: "May 13", revenue: 480 },
  { date: "May 15", revenue: 620 },
  { date: "May 17", revenue: 580 },
  { date: "May 19", revenue: 720 },
  { date: "May 21", revenue: 680 },
  { date: "May 23", revenue: 820 },
  { date: "May 25", revenue: 780 },
  { date: "May 27", revenue: 920 },
  { date: "May 29", revenue: 880 },
  { date: "May 31", revenue: 1020 },
];

export const revenueSources: RevenueSource[] = [
  { name: "Web Development", value: 48, color: "#7c3aed", xlm: "1,200 XLM", percentage: "48%" },
  { name: "UI/UX Design", value: 24, color: "#2563eb", xlm: "600 XLM", percentage: "24%" },
  { name: "Branding", value: 14, color: "#16a34a", xlm: "350 XLM", percentage: "14%" },
  { name: "Mobile Development", value: 8, color: "#f59e0b", xlm: "200 XLM", percentage: "8%" },
  { name: "Others", value: 6, color: "#6b7280", xlm: "100 XLM", percentage: "4%" },
];

export const projectStatuses: ProjectStatus[] = [
  { name: "In Progress", value: 50, color: "#7c3aed", count: "18", percentage: "50%" },
  { name: "Pending Approval", value: 19, color: "#f59e0b", count: "7", percentage: "19%" },
  { name: "Completed", value: 22, color: "#16a34a", count: "8", percentage: "22%" },
  { name: "On Hold", value: 9, color: "#6b7280", count: "3", percentage: "8%" },
];

export const topClients: TopClient[] = [
  { name: "Acme Corp", revenue: 850, logo: "A" },
  { name: "Google LLC", revenue: 650, logo: "G" },
  { name: "Microsoft", revenue: 450, logo: "M" },
  { name: "Notion Labs", revenue: 300, logo: "N" },
  { name: "Airbnb", revenue: 200, logo: "B" },
];

export const cashFlowData: CashFlowData[] = [
  { month: "May 1", inflow: 1800, outflow: 400 },
  { month: "May 8", inflow: 1600, outflow: 350 },
  { month: "May 15", inflow: 1400, outflow: 300 },
  { month: "May 22", inflow: 1200, outflow: 250 },
  { month: "May 29", inflow: 1000, outflow: 200 },
];

export const milestoneData: MilestoneData[] = [
  { name: "Milestone 1", completed: 18, total: 20, percentage: 90 },
  { name: "Milestone 2", completed: 14, total: 20, percentage: 70 },
  { name: "Milestone 3", completed: 10, total: 20, percentage: 50 },
  { name: "Milestone 4", completed: 6, total: 20, percentage: 30 },
];

export const insights: Insight[] = [
  {
    title: "Revenue is up 18.7% this month",
    description: "Great job! You've earned 18.7% more than last month.",
    icon: "trending",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "3 projects are pending approval",
    description: "These projects are waiting for client approval.",
    icon: "clock",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    title: "Escrow balance increased",
    description: "Escrow in hold increased by 12.4% this month.",
    icon: "lock",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
  },
  {
    title: "Best performing service",
    description: "Web Development is your top revenue source.",
    icon: "star",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
];

export const reports: Report[] = [
  { title: "Financial Summary", type: "PDF Report", icon: "file" },
  { title: "Project Performance", type: "PDF Report", icon: "file" },
  { title: "Client Report", type: "PDF Report", icon: "file" },
];
