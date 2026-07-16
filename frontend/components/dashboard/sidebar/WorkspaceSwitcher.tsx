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
  collapsed = false,
}: {
  orgs: { slug: string; name: string }[];
  currentSlug: string;
  collapsed?: boolean;
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
          className={`flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-hover px-3 py-2.5 text-left transition hover:bg-hover/70 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-sm font-extrabold text-white">
            {current.name.charAt(0).toUpperCase()}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold text-white">
                  {current.name}
                </span>
                <span className="mt-0.5 block text-xs font-bold text-white/45">
                  {orgs.length} workspace{orgs.length === 1 ? "" : "s"}
                </span>
              </span>
              <ChevronsUpDown className="size-4 text-white/45" aria-hidden />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) border-white/[0.06] bg-[#0c1a2e] text-white">
        <DropdownMenuLabel className="text-white/45">Workspaces</DropdownMenuLabel>
        {orgs.map((org) => {
          const active = org.slug === current.slug;
          return (
            <DropdownMenuItem
              key={org.slug}
              onSelect={() => router.push(urlForSlug(org.slug))}
              className={`gap-2 text-white hover:bg-hover focus:bg-hover data-[highlighted]:bg-hover ${
                active ? "bg-hover" : ""
              }`}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/20 text-xs font-extrabold text-primary">
                {org.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate font-extrabold">{org.name}</span>
              {active && <Check className="ml-auto size-4 text-primary" aria-hidden />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="bg-sidebar-border/50" />
        <DropdownMenuItem asChild className="gap-2 font-extrabold text-white hover:bg-hover focus:bg-hover data-[highlighted]:bg-hover">
          <Link href="/workspaces">
            <Plus className="size-4" aria-hidden /> Manage workspaces
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
