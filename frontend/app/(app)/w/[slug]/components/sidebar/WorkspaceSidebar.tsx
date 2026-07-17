"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { flatSidebarNav } from "@/lib/navigation/workspace-nav";
import { Sidebar } from "@/components/ui/sidebar/Sidebar";
import { SidebarHeader } from "@/components/ui/sidebar/SidebarHeader";
import { SidebarFooter } from "@/components/ui/sidebar/SidebarFooter";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { UserProfile } from "./UserProfile";

export function WorkspaceSidebar({
  orgs,
  currentSlug,
  user,
}: {
  orgs: { slug: string; name: string }[];
  currentSlug: string;
  user: { name: string; email: string; avatarUrl?: string };
}) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader />

      <div className="px-4 pb-4 pt-2">
        <WorkspaceSwitcher orgs={orgs} currentSlug={currentSlug} />
      </div>

      <nav
        className="flex flex-1 flex-col gap-1 px-4 pb-4"
        aria-label="Workspace navigation"
      >
        {flatSidebarNav.map((item) => {
          const href = `/w/${currentSlug}/${item.path}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors duration-150 ${
                active
                  ? "bg-primary/20 text-white"
                  : "text-white/65 hover:bg-white/6 hover:text-white"
              }`}
            >
              <Icon
                className={`size-4.5 shrink-0 ${active ? "text-primary" : ""}`}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && (
                <span className="rounded-full bg-primary/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <SidebarFooter>
        <UserProfile user={user} slug={currentSlug} />
      </SidebarFooter>
    </Sidebar>
  );
}
