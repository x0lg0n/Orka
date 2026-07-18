"use client";

import {
  Building2,
  Users,
  Shield,
  CreditCard,
  Sliders,
  Bell,
  Lock,
  Plug,
  Key,
  FileText,
  Database,
  AlertTriangle,
} from "lucide-react";

export type SettingsTab =
  | "workspace"
  | "team"
  | "roles"
  | "billing"
  | "preferences"
  | "notifications"
  | "security"
  | "integrations"
  | "api-keys"
  | "audit-logs"
  | "data-privacy"
  | "danger-zone";

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

const sections: { label: string; items: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  {
    label: "SETTINGS",
    items: [
      { id: "workspace", label: "Workspace Profile", icon: Building2 },
      { id: "team", label: "Team Members", icon: Users },
      { id: "roles", label: "Roles & Permissions", icon: Shield },
      { id: "billing", label: "Billing & Subscription", icon: CreditCard },
      { id: "preferences", label: "Preferences", icon: Sliders },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "security", label: "Security", icon: Lock },
      { id: "integrations", label: "Integrations", icon: Plug },
      { id: "api-keys", label: "API Keys", icon: Key },
      { id: "audit-logs", label: "Audit Logs", icon: FileText },
      { id: "data-privacy", label: "Data & Privacy", icon: Database },
      { id: "danger-zone", label: "Danger Zone", icon: AlertTriangle },
    ],
  },
];

export default function SettingsSidebar({ activeTab, onTabChange }: SettingsSidebarProps) {
  return (
    <nav className="w-56 flex-shrink-0">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#7c3aed]/10 text-[#7c3aed]"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
