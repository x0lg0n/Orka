"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, CreditCard, FileText, FolderKanban, Home, ReceiptText, Settings, Sparkles, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

type NavItem = { href: string; label: string; icon: LucideIcon };
const NAV: NavItem[] = [
  { href: "/dashboard/home", label: "Dashboard", icon: Home },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/proposals", label: "Proposals", icon: FileText },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export type ShellUser = { name: string; email: string };

export function Sidebar({ orgs, role, user }: { orgs: { id: string; name: string }[]; role: string; user: ShellUser }) {
  const pathname = usePathname();
  const initials = user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <aside className="z-40 flex h-screen w-72 shrink-0 flex-col border-r border-border bg-sidebar p-6 lg:sticky lg:top-0">
      <div className="flex items-center gap-4">
        <Image src="/Logo/LOGO.svg" alt="ORKA" width={42} height={42} className="size-11 object-contain" priority />
        <span className="text-[31px] font-extrabold tracking-[-0.02em] text-white">ORKA</span>
      </div>

      <div className="mt-7">
        <WorkspaceSwitcher orgs={orgs} />
      </div>

      <nav className="mt-12 flex flex-col gap-4">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={`h-12 w-full justify-start gap-5 rounded-[10px] px-4 text-[15px] font-extrabold ${
                active
                  ? "bg-primary/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-primary/20 dark:hover:bg-primary/20"
                  : "text-white/90 hover:bg-hover dark:hover:bg-hover"
              }`}
            >
              <Link href={item.href}>
                <Icon className={`size-6 ${active ? "text-primary" : ""}`} aria-hidden />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="mb-5 rounded-[10px] bg-primary/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <Sparkles className="size-5 text-lime" aria-hidden />
          <p className="mt-5 text-base font-extrabold text-white">Upgrade to Pro</p>
          <p className="mt-2 max-w-[13rem] text-[15px] font-bold leading-6 text-white/70">
            Unlock unlimited projects, advanced analytics and priority support.
          </p>
          <Button className="mt-5 h-12 w-full text-sm font-extrabold">Upgrade Now</Button>
        </div>

        <div className="flex items-center gap-3 rounded-[9px] bg-hover p-4">
          <Avatar className="size-11">
            <AvatarFallback
              style={{ backgroundImage: "linear-gradient(to bottom right, #fb923c, #9474ff)" }}
              className="text-sm font-extrabold text-white"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-extrabold text-white">{user.name}</p>
            <p className="mt-1 truncate text-sm font-bold text-white/40">{user.email}</p>
          </div>
          <ChevronDown className="size-4 text-white/40" aria-hidden />
        </div>
      </div>
    </aside>
  );
}
