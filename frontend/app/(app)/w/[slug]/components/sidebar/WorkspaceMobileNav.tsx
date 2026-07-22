"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { flatSidebarNav } from "@/lib/navigation/workspace-nav";

export function WorkspaceMobileNav({
  currentSlug,
  workspaceName,
}: {
  currentSlug: string;
  workspaceName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[#e5e8f0] bg-white lg:hidden">
      <div className="flex h-15 items-center justify-between gap-3 px-4">
        <Link
          href={`/w/${currentSlug}/dashboard`}
          className="flex min-w-0 items-center text-sm font-extrabold tracking-[-0.02em] text-text"
        >
          <span className="shrink-0 text-primary">ORKA</span>
          <span className="mx-2 shrink-0 text-textSubtle">/</span>
          <span className="min-w-0 truncate">{workspaceName}</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href={`/w/${currentSlug}/search`}
            className="grid size-10 place-items-center rounded-lg text-textMuted transition-colors hover:bg-surfaceMuted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Search workspace"
          >
            <Search className="size-5" aria-hidden />
          </Link>
          <Link
            href={`/w/${currentSlug}/notifications`}
            className="grid size-10 place-items-center rounded-lg text-textMuted transition-colors hover:bg-surfaceMuted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Notifications"
          >
            <Bell className="size-5" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-10 place-items-center rounded-lg text-textMuted transition-colors hover:bg-surfaceMuted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-expanded={open}
            aria-controls="workspace-mobile-menu"
            aria-label={open ? "Close workspace menu" : "Open workspace menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div id="workspace-mobile-menu" className="fixed inset-x-0 bottom-0 top-15 z-40 flex">
          <button
            type="button"
            className="flex-1 bg-[#06101f]/25"
            onClick={() => setOpen(false)}
            aria-label="Close workspace menu"
          />
          <nav
            className="flex w-[min(20rem,86vw)] flex-col border-l border-white/[0.08] bg-[#06101f] px-3 py-4"
            aria-label="Workspace navigation"
          >
            <p className="px-3 pb-3 text-xs font-semibold text-white/45">Workspace</p>
            <div className="flex flex-col gap-1">
              {flatSidebarNav.map((item) => {
                const href = `/w/${currentSlug}/${item.path}`;
                const active = pathname === href || pathname.startsWith(`${href}/`);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-primary/20 text-white"
                        : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <Icon className={`size-4.5 ${active ? "text-primary" : ""}`} aria-hidden />
                    <span>{item.title}</span>
                    {item.badge ? (
                      <span className="ml-auto rounded-full bg-primary/25 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
            <Link
              href="/workspaces"
              onClick={() => setOpen(false)}
              className="mt-auto rounded-lg px-3 py-2.5 text-sm font-semibold text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Switch workspace
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
