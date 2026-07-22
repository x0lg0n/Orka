"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Rocket,
  LayoutGrid,
  Folder,
  FileText,
  FileCheck,
  Milestone,
  Shield,
  Wallet,
  Receipt,
  Users,
  Code,
  ShieldCheck,
  HelpCircle,
  Headphones,
  ArrowRight,
} from "lucide-react";
import { docsNavigation } from "@/lib/docs/config";
import DocsSidebarAccordion from "./DocsSidebarAccordion";
import DocsSidebarSearch from "./DocsSidebarSearch";

const iconMap: Record<string, typeof Rocket> = {
  rocket: Rocket,
  "layout-grid": LayoutGrid,
  folder: Folder,
  "file-text": FileText,
  "file-check": FileCheck,
  milestone: Milestone,
  shield: Shield,
  wallet: Wallet,
  receipt: Receipt,
  users: Users,
  code: Code,
  "shield-check": ShieldCheck,
  "help-circle": HelpCircle,
};

const STORAGE_KEY = "docs_sidebar_expanded";

function getInitialExpanded(): string[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

export default function DocsSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(() => {
    const initial = getInitialExpanded();
    const parts = pathname.split("/");
    if (parts[2] && !initial.includes(parts[2])) {
      initial.push(parts[2]);
    }
    return initial;
  });
  const [filterQuery, setFilterQuery] = useState("");

  // Save expanded state to localStorage
  const saveToStorage = useCallback((items: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const toggleExpanded = useCallback((slug: string) => {
    setExpandedItems((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      saveToStorage(next);
      return next;
    });
  }, [saveToStorage]);

  const handleFilter = useCallback((query: string) => {
    setFilterQuery(query.toLowerCase());
  }, []);

  // Auto-expand matching categories during search
  const matchingSlugs = useMemo(() => {
    if (!filterQuery) return [];
    return docsNavigation
      .flatMap((section) => section.items)
      .filter(
        (item) =>
          item.title.toLowerCase().includes(filterQuery) ||
          item.children?.some((child) =>
            child.title.toLowerCase().includes(filterQuery)
          )
      )
      .map((item) => item.slug);
  }, [filterQuery]);

  // Compute effective expanded items including search matches
  const effectiveExpandedItems = useMemo(() => {
    if (matchingSlugs.length === 0) return expandedItems;
    const combined = [...new Set([...expandedItems, ...matchingSlugs])];
    // Save to storage if we added new items
    if (combined.length > expandedItems.length) {
      saveToStorage(combined);
    }
    return combined;
  }, [expandedItems, matchingSlugs, saveToStorage]);

  // Filter items based on search query
  const filteredNavigation = docsNavigation.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!filterQuery) return true;

      const matchesParent = item.title.toLowerCase().includes(filterQuery);
      const matchesChild = item.children?.some((child) =>
        child.title.toLowerCase().includes(filterQuery)
      );

      return matchesParent || matchesChild;
    }),
  }));

  const hasActiveFilter = filterQuery.length > 0;

  return (
    <aside className="sticky top-0 h-screen w-[240px] shrink-0 overflow-y-auto border-r border-night/10 bg-white/60 p-4 lg:block hidden">
      <DocsSidebarSearch onFilter={handleFilter} />

      <nav className="space-y-6">
        {filteredNavigation.map((section) => (
          <div key={section.title}>
            <p className="mb-2 text-[11px] font-black uppercase tracking-wider text-night/40">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon ? iconMap[item.icon] : Folder;
                const isExpanded = effectiveExpandedItems.includes(item.slug);
                const hasChildren = item.children && item.children.length > 0;
                const isFiltered =
                  hasActiveFilter &&
                  !item.title.toLowerCase().includes(filterQuery) &&
                  !item.children?.some((child) =>
                    child.title.toLowerCase().includes(filterQuery)
                  );

                return (
                  <li key={item.slug} className={isFiltered ? "opacity-50" : ""}>
                    {hasChildren ? (
                      <DocsSidebarAccordion
                        item={item}
                        icon={<Icon size={15} />}
                        isExpanded={isExpanded}
                        onToggle={() => toggleExpanded(item.slug)}
                        filterQuery={filterQuery}
                      />
                    ) : (
                      <Link
                        href={`/docs/${item.slug}`}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                          pathname === `/docs/${item.slug}`
                            ? "border-l-[3px] border-violet bg-violet/5 pl-2.5 text-violet"
                            : "text-night/70 hover:bg-night/5 hover:text-night"
                        }`}
                      >
                        <Icon size={15} className="shrink-0" />
                        {item.title}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-8 space-y-3">
        <div className="rounded-xl border border-night/10 bg-white p-4">
          <p className="text-xs font-black uppercase text-night/50">New to Orka?</p>
          <p className="mt-1 text-xs font-bold text-night/60">
            Follow our interactive setup guide.
          </p>
          <Link
            href="/docs/getting-started"
            className="mt-2 inline-flex items-center gap-1 text-xs font-black text-violet hover:underline"
          >
            Start Tutorial <ArrowRight size={12} />
          </Link>
        </div>
        <div className="rounded-xl border border-night/10 bg-white p-4">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-violet" />
            <p className="text-xs font-black text-night">Need Help?</p>
          </div>
          <p className="mt-1 text-xs font-bold text-night/60">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <Link
            href="/contact"
            className="mt-2 inline-flex items-center gap-1 text-xs font-black text-violet hover:underline"
          >
            Contact Support <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
