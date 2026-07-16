"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar/DashboardSidebar";

const mockWorkspace = {
  name: "Acme Studio",
  role: "Owner",
};

const mockUser = {
  name: "Siddhartha Kunwar",
  email: "siddhartha@acme.com",
};

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f8fc]">
      <DashboardSidebar workspace={mockWorkspace} user={mockUser} />
      <main
        className="flex-1 overflow-y-auto"
        id="main-content"
        aria-current={pathname}
      >
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
