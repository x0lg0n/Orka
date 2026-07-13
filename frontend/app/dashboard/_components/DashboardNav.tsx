"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  CreditCard,
  FileText,
  FolderKanban,
  Home,
  Settings,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/home", icon: Home },
  { label: "Proposals", href: "/dashboard/proposals", icon: FileText },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex w-full flex-col gap-4">
      <Link
        href="/dashboard/home"
        className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      >
        <span className="grid size-10 place-items-center rounded-[16px] bg-cyan-300 text-sm font-black text-[#04101f]">
          O
        </span>
        <span>
          <span className="display block text-2xl uppercase text-white">
            ORKA
          </span>
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200/70">
            Escrow OS
          </span>
        </span>
      </Link>

      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard/home" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-black uppercase transition focus:outline-none focus:ring-2 focus:ring-cyan-200/50 ${
                active
                  ? "border border-cyan-200/25 bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  : "border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <span className="hidden rounded-[18px] border border-white/10 bg-black/20 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400 lg:block">
        Role <span className="text-cyan-200">{role}</span>
      </span>
    </nav>
  );
}
