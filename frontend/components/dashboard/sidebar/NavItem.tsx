"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/dashboard/navigation";

interface NavItemProps {
  item: NavItem;
}

export function NavItem({ item }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
        isActive
          ? "bg-[#7c3aed] text-white"
          : "text-white/60 hover:bg-white/[0.06] hover:text-white"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="flex-1">{item.title}</span>
      {item.badge && (
        <span className="rounded-full bg-[#7c3aed]/30 px-2 py-0.5 text-[10px] font-bold text-[#a78bfa]">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
