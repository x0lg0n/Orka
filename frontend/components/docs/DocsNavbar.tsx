"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { docsNavigation, DocItem } from "@/lib/docs/config";
import DocsNavItem from "./DocsNavItem";
import DocsSearchTrigger from "./DocsSearchTrigger";
import SearchModal from "./SearchModal";

export default function DocsNavbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allItems = docsNavigation.flatMap((section) => section.items);

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <nav className="sticky top-0 z-40 h-[72px] w-full border-b border-white/10 bg-[#071426]">
        <div className="mx-auto flex h-full w-full items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-white/70 hover:text-white lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link
              href="/docs"
              className="display text-xl uppercase text-white"
            >
              ORKA
            </Link>
          </div>

          <div className="scrollbar-hide hidden items-center gap-0.5 lg:flex">
            {allItems.map((item) => (
              <DocsNavItem key={item.slug} item={item} />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <DocsSearchTrigger onClick={handleOpenSearch} />
          </div>
        </div>

        {mobileOpen && (
          <MobileNavDrawer
            items={allItems}
            onClose={() => setMobileOpen(false)}
            onOpenSearch={handleOpenSearch}
          />
        )}
      </nav>
    </>
  );
}

function MobileNavDrawer({
  items,
  onClose,
  onOpenSearch,
}: {
  items: DocItem[];
  onClose: () => void;
  onOpenSearch: () => void;
}) {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-night/40" onClick={onClose} />

      <div className="absolute left-0 top-[72px] h-[calc(100%-72px)] w-[300px] overflow-y-auto bg-white shadow-xl">
        <div className="p-4">
          <button
            onClick={() => {
              onClose();
              onOpenSearch();
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-night/10 bg-night/5 px-4 py-3 text-sm text-night/50"
          >
            Search documentation…
          </button>

          <div className="mt-4 space-y-1">
            {items.map((item) => {
              const isExpanded = expandedSlug === item.slug;
              return (
                <div key={item.slug}>
                  <button
                    onClick={() =>
                      setExpandedSlug(isExpanded ? null : item.slug)
                    }
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-night transition-colors hover:bg-night/5"
                  >
                    {item.title}
                    <span
                      className={`transition-transform duration-150 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {isExpanded && item.children && (
                    <div className="ml-3 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.slug}
                          href={`/docs/${item.slug}/${child.slug}`}
                          onClick={onClose}
                          className="block rounded-lg px-3 py-2 text-[13px] font-bold text-night/60 transition-colors hover:bg-night/5 hover:text-night"
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
