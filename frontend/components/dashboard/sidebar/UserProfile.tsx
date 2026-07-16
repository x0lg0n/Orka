"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function UserProfile({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SignOutButton from "@/components/SignOutButton";

export function UserProfile({
  user,
  collapsed,
}: {
  user: { name: string; email: string; avatar?: string };
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const initials = user.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors duration-150 hover:bg-white/[0.04]"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#1e293b]">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
              width={36}
              height={36}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white/70">
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="truncate text-xs text-white/50">{user.email}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-full rounded-xl border border-white/10 bg-[#0c1a2e] py-1 shadow-xl">
          <button className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/[0.06] hover:text-white">
            Profile
          </button>
          <button className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/[0.06] hover:text-white">
            Sign out
          </button>
        </div>
      )}
    </div>
  if (collapsed) {
    return (
      <div className="p-3">
        <Avatar className="size-9">
          <AvatarFallback
            style={{ backgroundImage: "linear-gradient(to bottom right, #fb923c, #9474ff)" }}
            className="text-xs font-extrabold text-white"
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="User menu"
          aria-expanded={open}
          className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-hover"
        >
          <Avatar className="size-9 shrink-0">
            <AvatarFallback
              style={{ backgroundImage: "linear-gradient(to bottom right, #fb923c, #9474ff)" }}
              className="text-xs font-extrabold text-white"
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-extrabold text-white">{user.name}</span>
            <span className="block truncate text-xs font-bold text-white/45">{user.email}</span>
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" className="w-(--radix-dropdown-menu-trigger-width) border-white/6 bg-[#0c1a2e] text-white">
        <DropdownMenuLabel className="text-white/45">{user.name}</DropdownMenuLabel>
        <DropdownMenuItem asChild className="gap-2 font-extrabold text-white hover:bg-hover focus:bg-hover data-highlighted:bg-hover">
          <span>
            <UserIcon className="size-4" aria-hidden /> Profile
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-sidebar-border/50" />
        <DropdownMenuItem asChild className="gap-2 p-0 font-extrabold text-white hover:bg-hover focus:bg-hover data-highlighted:bg-hover">
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
