"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DocItem } from "@/lib/docs/config";

interface DocsSidebarAccordionProps {
  item: DocItem;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  filterQuery?: string;
}

export default function DocsSidebarAccordion({
  item,
  icon,
  isExpanded,
  onToggle,
  filterQuery = "",
}: DocsSidebarAccordionProps) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  const isActive = pathname === `/docs/${item.slug}` || 
    pathname.startsWith(`/docs/${item.slug}/`);

  const isChildActive = item.children?.some(
    (child) => pathname === `/docs/${item.slug}/${child.slug}`
  );

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isExpanded]);

  return (
    <div>
      <button
        onClick={onToggle}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-all ${
          isActive && !isChildActive
            ? "border-l-[3px] border-violet bg-violet/5 pl-2.5 text-violet"
            : "text-night/70 hover:bg-night/5 hover:text-night"
        }`}
        aria-expanded={isExpanded}
        aria-controls={`submenu-${item.slug}`}
      >
        <span className="shrink-0">{icon}</span>
        <span className="flex-1 text-left">{item.title}</span>
        <ChevronRight
          size={14}
          className={`shrink-0 transition-transform duration-200 ${
            isExpanded ? "rotate-90" : ""
          }`}
        />
      </button>

      <div
        id={`submenu-${item.slug}`}
        role="region"
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : "0px",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div ref={contentRef} className="ml-4 mt-1 space-y-0.5 border-l border-night/10 pl-2">
          {item.children?.map((child) => {
            const childPath = `/docs/${item.slug}/${child.slug}`;
            const isChildCurrent = pathname === childPath;
            const isChildMatching = filterQuery && child.title.toLowerCase().includes(filterQuery.toLowerCase());
            
            return (
              <Link
                key={child.slug}
                href={childPath}
                className={`block rounded-lg px-3 py-1.5 text-[13px] font-bold transition-colors ${
                  isChildCurrent
                    ? "border-l-[3px] border-violet bg-violet/5 pl-2.5 text-violet"
                    : isChildMatching
                      ? "text-violet font-bold"
                      : "text-night/60 hover:bg-night/5 hover:text-night"
                }`}
              >
                {child.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
