"use client";

import { navigation } from "@/lib/dashboard/navigation";
import { NavItem } from "./NavItem";

export function Navigation() {
  return (
    <nav className="flex flex-col gap-1 px-4" aria-label="Dashboard navigation">
      {navigation.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}
    </nav>
  );
}
