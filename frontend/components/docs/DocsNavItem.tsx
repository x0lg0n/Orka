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
          className={`absolute left-1/2 top-full z-50 -translate-x-1/2 pt-2 transition-opacity duration-150 ${
            isOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          <div className="w-[640px] rounded-2xl border border-night/10 bg-white p-6 shadow-xl backdrop-blur-xl">
            <div className="mb-4">
              <p className="text-sm font-black text-night">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-[13px] font-bold text-night/50">
                  {item.description}
                </p>
              )}
            </div>

            <div className={`grid ${cols} gap-1`}>
              {item.children!.map((child) => {
                const href = `/docs/${item.slug}/${child.slug}`;
                const isChildActive = pathname === href;

                return (
                  <Link
                    key={child.slug}
                    href={href}
                    className={`rounded-xl px-3 py-2.5 transition-colors ${
                      isChildActive
                        ? "bg-violet/10 text-violet"
                        : "text-night hover:bg-night/5"
                    }`}
                  >
                    <p className="text-[13px] font-bold">{child.title}</p>
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
