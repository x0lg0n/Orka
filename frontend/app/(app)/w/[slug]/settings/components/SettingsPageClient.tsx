"use client";

import { useState } from "react";
import { Search, HelpCircle, Bell } from "lucide-react";
import SettingsSidebar, { type SettingsTab } from "./SettingsSidebar";
import WorkspaceProfile from "./WorkspaceProfile";
import BrandingSettings from "./BrandingSettings";
import WorkspacePlanCard from "./WorkspacePlanCard";
import StorageUsageCard from "./StorageUsageCard";
import WorkspaceIdCard from "./WorkspaceIdCard";
import DangerZoneCard from "./DangerZoneCard";
import PlaceholderSection from "./PlaceholderSection";

interface SettingsPageProps {
  workspace: {
    id: string;
    name: string;
    slug: string;
    logo_url?: string | null;
  };
}

export default function SettingsPageClient({ workspace }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("workspace");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your workspace, preferences and integrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search settings..."
              className="h-10 w-64 rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            <HelpCircle className="h-5 w-5" />
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
              3
            </span>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="min-w-0 flex-1">
          {activeTab === "workspace" && (
            <div className="space-y-6">
              <WorkspaceProfile workspace={workspace} />
              <BrandingSettings />
            </div>
          )}
          {activeTab === "team" && (
            <PlaceholderSection
              title="Team Members"
              description="Manage your team members and their roles."
            />
          )}
          {activeTab === "roles" && (
            <PlaceholderSection
              title="Roles & Permissions"
              description="Configure roles and permissions for your team."
            />
          )}
          {activeTab === "billing" && (
            <PlaceholderSection
              title="Billing & Subscription"
              description="Manage your subscription and billing information."
            />
          )}
          {activeTab === "preferences" && (
            <PlaceholderSection
              title="Preferences"
              description="Customize your workspace preferences."
            />
          )}
          {activeTab === "notifications" && (
            <PlaceholderSection
              title="Notifications"
              description="Configure your notification preferences."
            />
          )}
          {activeTab === "security" && (
            <PlaceholderSection
              title="Security"
              description="Manage your security settings."
            />
          )}
          {activeTab === "integrations" && (
            <PlaceholderSection
              title="Integrations"
              description="Connect your favorite tools and services."
            />
          )}
          {activeTab === "api-keys" && (
            <PlaceholderSection
              title="API Keys"
              description="Manage your API keys for integrations."
            />
          )}
          {activeTab === "audit-logs" && (
            <PlaceholderSection
              title="Audit Logs"
              description="View activity logs for your workspace."
            />
          )}
          {activeTab === "data-privacy" && (
            <PlaceholderSection
              title="Data & Privacy"
              description="Manage your data and privacy settings."
            />
          )}
          {activeTab === "danger-zone" && (
            <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-rose-600">Danger Zone</h3>
              <p className="mt-1 text-sm text-gray-500">
                Irreversible and destructive actions.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-rose-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Delete Workspace</p>
                    <p className="text-xs text-gray-500">Permanently delete this workspace and all its data.</p>
                  </div>
                  <button className="rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50">
                    Delete
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Archive Workspace</p>
                    <p className="text-xs text-gray-500">Archive this workspace temporarily.</p>
                  </div>
                  <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Archive
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Transfer Ownership</p>
                    <p className="text-xs text-gray-500">Transfer ownership to another team member.</p>
                  </div>
                  <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Transfer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hidden w-64 flex-shrink-0 space-y-6 lg:block">
          <WorkspacePlanCard />
          <StorageUsageCard />
          <WorkspaceIdCard workspaceId={`ws_${workspace.id.slice(0, 16)}`} />
          <DangerZoneCard />
        </div>
      </div>
    </div>
  );
}
