"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar/DashboardSidebar";

const mockWorkspace = {
  name: "Acme Studio",
  role: "Owner",
};
import { WorkspaceSidebar } from "@/components/dashboard/sidebar/WorkspaceSidebar";

const mockOrgs = [{ slug: "acme-studio", name: "Acme Studio" }];

const mockUser = {
  name: "Siddhartha Kunwar",
  email: "siddhartha@acme.com",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f8fc]">
      <DashboardSidebar slug="dashboard" workspace={mockWorkspace} user={mockUser} />
      <main
        className="flex-1 overflow-y-auto"
        id="main-content"
      >
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <WorkspaceSidebar orgs={mockOrgs} currentSlug="acme-studio" user={mockUser} />
      <main className="flex-1 overflow-y-auto" id="main-content">
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
