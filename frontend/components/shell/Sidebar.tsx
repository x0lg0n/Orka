import Image from "next/image";
import Link from "next/link";
import { Building2, ChevronDown, CreditCard, Settings, Sparkles, type LucideIcon } from "lucide-react";
import { Avatar } from "../ui/Avatar";

type NavItem = { href: string; label: string; icon: LucideIcon };
const NAV: NavItem[] = [
  { href: "/dashboard/projects", label: "Organizations", icon: Building2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export type ShellUser = { name: string; email: string };

export function Sidebar({ orgs, role, user }: { orgs: { id: string; name: string }[]; role: string; user: ShellUser }) {
  return (
    <aside className="z-40 flex h-screen w-72 shrink-0 flex-col border-r border-border bg-sidebar p-6 lg:sticky lg:top-0">
      <div className="flex items-center gap-4">
        <Image src="/Logo/LOGO.svg" alt="ORKA" width={42} height={42} className="size-11 object-contain" priority />
        <span className="text-[31px] font-extrabold tracking-[-0.02em] text-white">ORKA</span>
      </div>

      <nav className="mt-12 flex flex-col gap-4">
        {NAV.map((item, i) => {
          const Icon = item.icon;
          const active = i === 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-12 items-center gap-5 rounded-[10px] px-4 text-[15px] font-extrabold transition ${
                active ? "bg-primary/20 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" : "text-white/90 hover:bg-hover"
              }`}
            >
              <Icon className={`size-6 ${active ? "text-primary" : ""}`} aria-hidden />
              {item.label}
            </Link>
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
          <button type="button" className="btn btn-primary mt-5 h-12 w-full">
            Upgrade Now
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-[9px] bg-white/[0.045] p-4">
          <Avatar name={user.name} />
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
