import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkspaceAccountMenu } from "./WorkspaceAccountMenu";

export function WorkspaceNav({
  name,
  email,
  initials,
  hasWorkspaces = false,
}: {
  name: string;
  email: string;
  initials: string;
  hasWorkspaces?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card">
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
          {hasWorkspaces ? (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/workspaces/new">
                <Plus className="size-4" aria-hidden /> New workspace
              </Link>
            </Button>
          ) : null}
          <WorkspaceAccountMenu name={name} email={email} initials={initials} />
        </div>
      </div>
    </header>
  );
}
