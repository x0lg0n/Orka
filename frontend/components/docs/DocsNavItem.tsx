"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocItem } from "@/lib/docs/config";

interface DocsNavItemProps {
  item: DocItem;
}

export default function DocsNavItem({ item }: DocsNavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const isActive =
    pathname === `/docs/${item.slug}` ||
    pathname.startsWith(`/docs/${item.slug}/`);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  }, []);

  const hasChildren = item.children && item.children.length > 0;

  const cols = hasChildren
    ? item.children!.length <= 3
      ? "grid-cols-1"
      : item.children!.length <= 6
        ? "grid-cols-2"
        : "grid-cols-3"
    : "";

  return (
    <div
      className="group/NavItem relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/docs/${item.slug}`}
        className={`flex shrink-0 items-center whitespace-nowrap rounded-full px-2 py-1 text-[12px] font-medium transition-colors ${
          isActive
            ? "bg-violet/10 text-violet"
            : "text-white/80 hover:text-white"
        }`}
      >
        {item.title}
      </Link>

      {hasChildren && (
        <div
          className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 transition-all duration-150 ${
            isOpen ? "visible opacity-100 translate-y-0" : "invisible opacity-0 translate-y-1"
          }`}
        >
          <div className="w-fit min-w-[220px] max-w-[480px] rounded-xl border border-night/[0.08] bg-white p-2 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.12)]">
            {item.description && (
              <p className="mb-1 px-3 pt-2 pb-1 text-[11px] font-bold text-night/40 uppercase tracking-wide">
                {item.description}
              </p>
            )}

            <div className={`grid ${cols} gap-0.5`}>
              {item.children!.map((child) => {
                const href = `/docs/${item.slug}/${child.slug}`;
                const isChildActive = pathname === href;

                return (
                  <Link
                    key={child.slug}
                    href={href}
                    className={`rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
                      isChildActive
                        ? "bg-violet/10 text-violet"
                        : "text-night/70 hover:bg-night/[0.04] hover:text-night"
                    }`}
                  >
                    {child.title}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
