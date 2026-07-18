"use client";

import { getNavigation } from "@/lib/dashboard/navigation";
import { NavItem } from "./NavItem";

export function Navigation({ slug }: { slug: string }) {
  const items = getNavigation(slug);

  return (
    <nav className="flex flex-col gap-1 px-4" aria-label="Dashboard navigation">
      {items.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </nav>
  );
}
