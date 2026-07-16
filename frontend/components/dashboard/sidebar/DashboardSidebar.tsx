"use client";

import { SidebarHeader } from "./SidebarHeader";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { Navigation } from "./Navigation";
import { UpgradeCard } from "./UpgradeCard";
import { UserProfile } from "./UserProfile";

interface DashboardSidebarProps {
  workspace: {
    name: string;
    role: string;
    logo?: string;
  };
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function DashboardSidebar({ workspace, user }: DashboardSidebarProps) {
  return (
    <aside
      className="flex h-screen w-[280px] shrink-0 flex-col border-r border-white/[0.06] bg-[#06101f]"
      aria-label="Dashboard sidebar"
    >
      <div className="px-0 pb-4 pt-5">
        <SidebarHeader />
      </div>

      <div className="pb-4">
        <WorkspaceSwitcher workspace={workspace} />
      </div>

      <nav className="flex-1 overflow-y-auto pb-4">
        <Navigation />
      </nav>

      <div className="pb-4">
        <UpgradeCard />
      </div>

      <div className="mt-auto border-t border-white/[0.06]">
        <UserProfile user={user} />
      </div>
    </aside>
  );
}
