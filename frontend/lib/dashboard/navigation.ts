import {
  Home,
  Folder,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Sparkles,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/home",
    icon: Home,
  },
  {
    title: "Projects",
    href: "/dashboard/projects",
    icon: Folder,
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "AI Copilot",
    href: "/dashboard/ai",
    icon: Sparkles,
    badge: "Beta",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
