"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkspaceSwitcher({
  orgs,
  currentSlug,
}: {
  orgs: { slug: string; name: string }[];
  currentSlug: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const current = orgs.find((o) => o.slug === currentSlug) ?? orgs[0];
  if (!current) return null;

  const urlForSlug = (slug: string) => pathname.replace(/\/w\/[^/]+/, `/w/${slug}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch workspace"
          className="group flex w-full items-center gap-3 rounded-lg border border-white/6 bg-white/3 px-3 py-2.5 text-left transition-colors hover:bg-white/6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-sm font-extrabold text-white">
            {current.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-extrabold text-white">
              {current.name}
            </span>
            <span className="mt-0.5 block text-xs font-semibold text-white/45">
              {orgs.length} workspace{orgs.length === 1 ? "" : "s"}
            </span>
          </span>
          <ChevronsUpDown className="size-4 text-white/40 transition-colors group-hover:text-white/70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) border-white/6 bg-[#0c1a2e] text-white shadow-2xl"
      >
        <DropdownMenuLabel className="px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white/35">
          Workspaces
        </DropdownMenuLabel>
        {orgs.map((org) => {
          const active = org.slug === current.slug;
          return (
            <DropdownMenuItem
              key={org.slug}
              onSelect={() => router.push(urlForSlug(org.slug))}
              className={`gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold outline-hidden transition-colors hover:bg-white/6 hover:text-white focus:bg-white/6 focus:text-white data-highlighted:bg-white/6 data-highlighted:text-white ${
                active ? "bg-primary/20 text-white" : "text-white/65"
              }`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-md text-xs font-extrabold ${
                  active
                    ? "bg-primary/30 text-primary"
                    : "bg-white/6 text-white/60"
                }`}
              >
                {org.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate">{org.name}</span>
              {active && <Check className="ml-auto size-4 text-primary" aria-hidden />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="bg-white/6" />
        <DropdownMenuItem
          asChild
          className="gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-white/65 outline-hidden transition-colors hover:bg-white/6 hover:text-white focus:bg-white/6 focus:text-white data-highlighted:bg-white/6 data-highlighted:text-white"
        >
          <Link href="/workspaces">
            <Plus className="size-4 text-white/50" aria-hidden />
            Manage workspaces
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
