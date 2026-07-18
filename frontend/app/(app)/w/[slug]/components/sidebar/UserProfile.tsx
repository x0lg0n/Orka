"use client";

import Link from "next/link";
import { ChevronsUpDown, User as UserIcon, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SignOutButton from "@/components/SignOutButton";

export function UserProfile({
  user,
  slug,
}: {
  user: { name: string; email: string; avatarUrl?: string };
  slug: string;
}) {
  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="group flex w-full items-center justify-center gap-3 rounded-lg border border-white/6 bg-white/3 px-3 py-2.5 text-left transition-colors hover:bg-white/6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
        >
          <Avatar className="size-7 shrink-0">
            <AvatarImage src={user.avatarUrl ?? ""} alt={user.name} />
            <AvatarFallback
              style={{ backgroundImage: "linear-gradient(to bottom right, #fb923c, #9474ff)" }}
              className="text-[11px] font-extrabold text-white"
            >
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-sm font-extrabold text-white">
            {user.name}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-white/40 transition-colors group-hover:text-white/70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) border-white/6 bg-[#0c1a2e] text-white shadow-2xl"
      >
        <DropdownMenuItem
          asChild
          className="flex justify-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-white/65 outline-hidden transition-colors hover:bg-white/6 hover:text-white focus:bg-white/6 focus:text-white data-highlighted:bg-white/6 data-highlighted:text-white"
        >
          <Link href={`/w/${slug}/settings`}>
            <UserIcon className="size-4 text-white/50" aria-hidden />
            Workspace Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="flex justify-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-white/65 outline-hidden transition-colors hover:bg-white/6 hover:text-white focus:bg-white/6 focus:text-white data-highlighted:bg-white/6 data-highlighted:text-white"
        >
          <Link href="/settings">
            <Settings className="size-4 text-white/50" aria-hidden />
            Personal Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          asChild
          className="flex justify-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold text-white/65 outline-hidden transition-colors hover:bg-white/6 hover:text-white focus:bg-white/6 focus:text-white data-highlighted:bg-white/6 data-highlighted:text-white"
        >
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
