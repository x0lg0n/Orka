"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavGroupConfig } from "@/lib/navigation/workspace-nav";

export function NavSection({
  group,
  slug,
  collapsed,
  pinned,
  onTogglePin,
}: {
  group: NavGroupConfig;
  slug: string;
  collapsed: boolean;
  pinned: boolean;
  onTogglePin: () => void;
}) {
  const pathname = usePathname();

  // In the collapsed rail, show only the first item as the group's icon link.
  if (collapsed) {
    const first = group.items[0];
    if (!first) return null;
    const href = `/w/${slug}/${first.path}`;
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const Icon = first.icon;
    return (
      <Link
        href={href}
        title={group.label}
        aria-current={active ? "page" : undefined}
        className={`flex h-10 items-center justify-center rounded-lg ${
          active ? "bg-primary/20 text-white" : "text-white/60 hover:bg-hover hover:text-white"
        }`}
      >
        <Icon className={`size-5 ${active ? "text-primary" : ""}`} aria-hidden="true" />
      </Link>
    );
  }

  const childHrefs = group.items.map((i) => `/w/${slug}/${i.path}`);
  const anyActive = childHrefs.some(
    (h) => pathname === h || pathname.startsWith(`${h}/`)
  );

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={onTogglePin}
        aria-expanded={pinned}
        className={`flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors duration-150 ${
          anyActive || pinned
            ? "text-white"
            : "text-white/70 hover:bg-hover hover:text-white"
        }`}
      >
        <span className="flex-1 truncate text-left text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/35">
          {group.label}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-white/40 transition-transform duration-200 ${
            pinned ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          pinned ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 pb-1 pl-3">
            {group.items.map((item) => {
              const href = `/w/${slug}/${item.path}`;
              const active = pathname === href || pathname.startsWith(`${href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={href}
                  title={item.title}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 ${
                    active
                      ? "border-l-2 border-primary bg-primary/20 text-white"
                      : "border-l-2 border-transparent text-white/55 hover:bg-hover hover:text-white"
                  }`}
                >
                  <Icon
                    className={`size-[18px] shrink-0 ${active ? "text-primary" : ""}`}
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
          </div>
        </div>
      </div>
    </div>
  );
}
