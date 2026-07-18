import {
  CreditCard,
  FileText,
  FolderKanban,
  Home,
  LayoutDashboard,
  ReceiptText,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavLinkConfig = {
  title: string;
  /** Path relative to the workspace, e.g. "dashboard", "projects" */
  path: string;
  icon: LucideIcon;
  badge?: string;
  requiredRole?: string;
};

export type NavGroupConfig = {
  id: string;
  label: string;
  items: NavLinkConfig[];
};

export type NavItemConfig = {
  title: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
};

export const workspaceNav: NavGroupConfig[] = [
  {
    id: "overview",
    label: "Overview",
    items: [{ title: "Dashboard", path: "dashboard", icon: Home }],
  },
  {
    id: "work",
    label: "Work",
    items: [
      { title: "Projects", path: "projects", icon: FolderKanban },
      { title: "Proposals", path: "proposals", icon: FileText },
      { title: "Clients", path: "clients", icon: Users },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { title: "Payments", path: "payments", icon: CreditCard },
      { title: "Invoices", path: "invoices", icon: ReceiptText },
      { title: "Analytics", path: "analytics", icon: LayoutDashboard },
    ],
  },
  {
    id: "ai",
    label: "AI",
    items: [{ title: "AI Copilot", path: "ai", icon: Sparkles, badge: "Beta" }],
  },
  {
    id: "workspace",
    label: "Workspace",
    items: [
      { title: "Settings", path: "settings", icon: Settings, requiredRole: "owner" },
    ],
  },
];

/** Flat, single-level sidebar nav (no groups/accordions). */
export const flatSidebarNav: NavItemConfig[] = [
  { title: "Dashboard", path: "dashboard", icon: Home },
  { title: "Projects", path: "projects", icon: FolderKanban },
  { title: "Clients", path: "clients", icon: Users },
  { title: "Payments", path: "payments", icon: CreditCard },
  { title: "Invoices", path: "invoices", icon: ReceiptText },
  { title: "Analytics", path: "analytics", icon: LayoutDashboard },
  { title: "AI", path: "ai", icon: Sparkles, badge: "Beta" },
  { title: "Settings", path: "settings", icon: Settings },
];
