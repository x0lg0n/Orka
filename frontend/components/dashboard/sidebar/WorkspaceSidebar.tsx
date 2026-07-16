"use client";

import { workspaceNav } from "@/lib/navigation/workspace-nav";
import { useSidebarCollapse } from "@/lib/navigation/use-sidebar-collapse";
import { Sidebar } from "@/components/ui/sidebar/Sidebar";
import { SidebarHeader } from "@/components/ui/sidebar/SidebarHeader";
import { NavSection } from "@/components/ui/sidebar/NavSection";
import { SidebarFooter } from "@/components/ui/sidebar/SidebarFooter";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { UpgradeCard } from "./UpgradeCard";
import { UserProfile } from "./UserProfile";

export function WorkspaceSidebar({
  orgs,
  currentSlug,
  user,
}: {
  orgs: { slug: string; name: string }[];
  currentSlug: string;
  user: { name: string; email: string; avatar?: string };
}) {
  const { collapsed, expanded, hovered, pinnedId, setHovered, toggle, togglePin } =
    useSidebarCollapse();

  return (
    <Sidebar
      expanded={expanded}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        // Only collapse on leave when nothing is pinned open.
        setHovered(false);
      }}
    >
      <SidebarHeader
        expanded={expanded}
        collapsed={collapsed && !expanded}
        onToggleCollapse={toggle}
      />

      <div className={`pb-4 ${expanded ? "px-4" : "px-2"}`}>
        <WorkspaceSwitcher orgs={orgs} currentSlug={currentSlug} collapsed={!expanded} />
      </div>

      <nav
        className={`flex flex-1 flex-col gap-2 pb-4 ${expanded ? "px-4" : "px-2"}`}
        aria-label="Workspace navigation"
      >
        {workspaceNav.map((group) => (
          <NavSection
            key={group.id}
            group={group}
            slug={currentSlug}
            collapsed={!expanded}
            pinned={pinnedId === group.id}
            onTogglePin={() => togglePin(group.id)}
          />
        ))}
      </nav>

      <div className={`pb-4 ${expanded ? "px-0" : "px-2"}`}>
        <UpgradeCard collapsed={!expanded} />
      </div>

      <SidebarFooter>
        <UserProfile user={user} collapsed={!expanded} />
      </SidebarFooter>
    </Sidebar>
  );
}
