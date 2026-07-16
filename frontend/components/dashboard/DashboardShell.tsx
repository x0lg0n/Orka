"use client";

import { WorkspaceSidebar } from "@/app/(app)/w/[slug]/components/sidebar/WorkspaceSidebar";

const mockOrgs = [{ slug: "acme-studio", name: "Acme Studio" }];

const mockUser = {
  name: "Siddhartha Kunwar",
  email: "siddhartha@acme.com",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
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
