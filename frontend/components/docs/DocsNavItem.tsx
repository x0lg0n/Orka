"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DocItem } from "@/lib/docs/config";
import DocsMegaMenu from "./DocsMegaMenu";

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

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={`/docs/${item.slug}`}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          isActive
            ? "bg-violet/10 text-violet"
            : "text-white/80 hover:text-white"
        }`}
      >
        {item.title}
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Link>

      {isOpen && item.children && item.children.length > 0 && (
        <DocsMegaMenu item={item} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
