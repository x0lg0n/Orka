"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROJECT_TABS, type ProjectTabHref } from "./projectTabs.config";

export function ProjectTabs({ slug, projectId }: { slug: string; projectId: string }) {
  const pathname = usePathname();
  const base = `/w/${slug}/projects/${projectId}`;
  const active = pathname.replace(base, "").split("/").filter(Boolean)[0] as
    | ProjectTabHref
    | undefined;

  return (
    <div className="mt-6 border-b border-gray-200">
      <nav className="flex gap-1 overflow-x-auto" aria-label="Project tabs">
        {PROJECT_TABS.map((tab) => {
          const isActive = active === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={`${base}/${tab.href}`}
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
