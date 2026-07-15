"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Building2, Users, Plug, BarChart3, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { WorkspaceSwitcher } from "@/components/shell/WorkspaceSwitcher";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import SignOutButton from "@/components/SignOutButton";

type NavItem = {
  href: (id: string) => string;
  label: string;
  icon: typeof Building2;
  exact?: boolean;
};

const NAV: NavItem[] = [
  { href: (id) => `/workspaces/${id}`, label: "Dashboard", icon: Building2, exact: true },
  { href: (id) => `/workspaces/${id}/team`, label: "Team", icon: Users },
  { href: (id) => `/workspaces/${id}/integrations`, label: "Integrations", icon: Plug },
  { href: (id) => `/workspaces/${id}/usage`, label: "Usage", icon: BarChart3 },
  { href: (id) => `/workspaces/${id}/billing`, label: "Billing", icon: CreditCard },
  { href: (id) => `/workspaces/${id}/settings`, label: "Settings", icon: SettingsIcon },
];

export function WorkspaceSidebar({
  orgs,
  currentOrgId,
}: {
  orgs: { id: string; name: string }[];
  currentOrgId: string;
}) {
  const pathname = usePathname();

  const NavLinks = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const href = item.href(currentOrgId);
        const active = item.exact ? pathname === href : pathname.startsWith(href);
        const Icon = item.icon;
        return (
          <Button
            key={href}
            asChild
            variant={active ? "secondary" : "ghost"}
            className={`justify-start gap-3 ${active ? "" : "text-white/70"}`}
          >
            <Link href={href}>
              <Icon className="size-4" />
              {item.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <div className="p-3">
          <WorkspaceSwitcher orgs={orgs} currentOrgId={currentOrgId} />
        </div>
        <div className="flex-1 p-3">{NavLinks}</div>
        <div className="m-3 flex items-center gap-2 rounded-[10px] border border-border bg-hover p-3">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/20 text-xs font-extrabold text-primary">U</AvatarFallback>
          </Avatar>
          <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-white">Account</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 lg:hidden">
        <WorkspaceSwitcher orgs={orgs} currentOrgId={currentOrgId} />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-border bg-sidebar p-3 text-white">
            <div className="flex flex-col gap-3">
              {NavLinks}
              <div className="mt-2 border-t border-border pt-3">
                <SignOutButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
