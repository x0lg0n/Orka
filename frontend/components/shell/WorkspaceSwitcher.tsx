"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <Button
          variant="ghost"
          className="flex w-full items-center gap-3 rounded-[10px] border border-border bg-hover p-3 transition hover:bg-hover dark:hover:bg-hover"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-primary text-sm font-extrabold text-white">
            {current.name.charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-extrabold text-white">{current.name}</span>
            <span className="mt-0.5 block text-xs font-bold text-white/45">
              {orgs.length} workspace{orgs.length === 1 ? "" : "s"}
            </span>
          </span>
          <ChevronDown className="size-4 text-white/45" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) border-border bg-sidebar text-white">
        <DropdownMenuLabel className="text-white/45">Workspaces</DropdownMenuLabel>
        {orgs.map((org) => {
          const active = org.slug === current.slug;
          return (
            <DropdownMenuItem
              key={org.slug}
              onSelect={() => router.push(urlForSlug(org.slug))}
              className={`gap-2 text-white hover:bg-hover focus:bg-hover data-[highlighted]:bg-hover dark:hover:bg-hover dark:focus:bg-hover dark:data-[highlighted]:bg-hover ${active ? "bg-hover" : ""}`}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-[6px] bg-primary/20 text-xs font-extrabold text-primary">
                {org.name.charAt(0).toUpperCase()}
              </span>
              <span className="truncate font-extrabold">{org.name}</span>
              {active ? <Check className="ml-auto size-4 text-primary" aria-hidden /> : null}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem asChild className="text-white hover:bg-hover focus:bg-hover data-[highlighted]:bg-hover dark:hover:bg-hover dark:focus:bg-hover dark:data-[highlighted]:bg-hover">
          <Link href="/workspaces" className="gap-2 font-extrabold">
            Manage workspaces
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
