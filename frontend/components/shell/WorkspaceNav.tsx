import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import SignOutButton from "@/components/SignOutButton";

export function WorkspaceNav({
  name,
  initials,
}: {
  name: string;
  initials: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/workspaces" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/Logo/LOGO.svg"
            alt="ORKA"
            width={28}
            height={28}
            className="size-7 object-contain"
          />
          <span className="text-[20px] font-extrabold tracking-[-0.03em] text-foreground">
            ORKA
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/workspaces/new">
              <Plus className="size-4" aria-hidden /> New workspace
            </Link>
          </Button>
          <ThemeToggle />
          <Avatar className="size-9">
            <AvatarImage src="" alt={name} />
            <AvatarFallback className="bg-primary/15 text-xs font-extrabold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
