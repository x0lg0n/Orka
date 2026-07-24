"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Flag,
  FileText,
  FileSignature,
  CreditCard,
  Receipt,
  Folder,
  MessageSquare,
  Activity,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "milestones", label: "Milestones", icon: Flag },
  { id: "proposal", label: "Proposal", icon: FileText },
  { id: "contracts", label: "Contracts", icon: FileSignature },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "invoices", label: "Invoices", icon: Receipt },
  { id: "files", label: "Files & Deliverables", icon: Folder },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "settings", label: "Settings", icon: Settings },
];

export function PortalSidebar({
  token,
  orgName,
  clientName,
  clientEmail,
}: {
  token: string;
  orgName: string;
  clientName: string | null;
  clientEmail: string | null;
}) {
  const searchParams = useSearchParams();
  const active = searchParams.get("nav") ?? "dashboard";
  const base = `/p/${token}`;

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col overflow-hidden bg-[#081321] text-white">
      <div className="flex items-center gap-2 px-5 pb-4 pt-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6C4DFF] text-sm font-bold">
          O
        </div>
        <span className="text-lg font-bold">ORKA</span>
      </div>

      <div className="mx-4 mb-4 rounded-xl bg-white/5 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          Client Portal
        </p>
        <p className="mt-1 text-sm font-semibold text-white">{orgName}</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={`${base}?nav=${item.id}`}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6C4DFF] text-xs font-bold">
          {clientName?.charAt(0) ?? "C"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {clientName ?? "Client"}
          </p>
          <p className="truncate text-xs text-gray-400">
            {clientEmail ?? ""}
          </p>
        </div>
      </div>
    </aside>
  );
}
