"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/home" },
  { label: "Proposals", href: "/dashboard/proposals" },
  { label: "Projects", href: "/dashboard/projects" },
  { label: "Payments", href: "/dashboard/payments" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex w-full flex-col gap-2">
      <Link href="/dashboard/home" className="mb-4 flex items-center gap-3">
        <span className="display text-2xl uppercase text-ink">ORKA</span>
      </Link>

      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard/home" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-5 py-2 text-sm font-black uppercase transition ${
              active
                ? "bg-ink text-white"
                : "bg-white text-ink hover:bg-bone"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <span className="mt-4 rounded-full bg-bone px-5 py-2 text-xs font-bold uppercase text-ink/70">
        Role: {role}
      </span>
    </nav>
  );
}
