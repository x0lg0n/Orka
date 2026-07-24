"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home, Flag, FileText, CreditCard, Lock, Folder, Activity } from "lucide-react";

const PORTAL_TABS = [
  { value: "overview", label: "Overview", icon: Home },
  { value: "milestones", label: "Milestones", icon: Flag },
  { value: "proposal", label: "Proposal", icon: FileText },
  { value: "escrow", label: "Escrow", icon: Lock },
  { value: "billing", label: "Billing", icon: CreditCard },
  { value: "files", label: "Files", icon: Folder },
  { value: "activity", label: "Activity", icon: Activity },
] as const;

export function PortalTabs({ token }: { token: string }) {
  const searchParams = useSearchParams();
  const active = searchParams.get("tab") ?? "overview";
  const base = `/p/${token}`;

  return (
    <div className="mt-6 border-b border-gray-200">
      <nav className="flex gap-1 overflow-x-auto" aria-label="Portal tabs">
        {PORTAL_TABS.map((tab) => {
          const isActive = active === tab.value;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.value}
              href={`${base}?tab=${tab.value}`}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "border-[#7c3aed] text-[#7c3aed]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export { PORTAL_TABS };
