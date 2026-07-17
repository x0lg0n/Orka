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

export function getNavigation(slug: string): NavItem[] {
  const base = `/w/${slug}`;
  return [
    { title: "Dashboard", href: `${base}/dashboard`, icon: Home },
    { title: "Projects", href: `${base}/projects`, icon: Folder },
    { title: "Clients", href: `${base}/clients`, icon: Users },
    { title: "Payments", href: `${base}/payments`, icon: CreditCard },
    { title: "Invoices", href: `${base}/invoices`, icon: FileText },
    { title: "Analytics", href: `${base}/analytics`, icon: BarChart3 },
    { title: "AI Copilot", href: `${base}/ai`, icon: Sparkles, badge: "Beta" },
    { title: "Settings", href: `${base}/settings`, icon: Settings },
  ];
}
