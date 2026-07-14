import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function WorkspaceSwitcher({ orgs, currentOrgId }: { orgs: { id: string; name: string }[]; currentOrgId?: string }) {
  const current = orgs.find((org) => org.id === currentOrgId) ?? orgs[0];
  if (!current) return null;
  return (
    <Link href="/onboarding" className="flex items-center gap-3 rounded-[10px] border border-border bg-white/[0.045] p-3 transition hover:bg-hover">
      <span className="grid size-10 shrink-0 place-items-center rounded-[8px] bg-primary text-sm font-extrabold text-white">
        {current.name.charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-white">{current.name}</span>
        <span className="mt-0.5 block text-xs font-bold text-white/45">{orgs.length} workspace{orgs.length === 1 ? "" : "s"}</span>
      </span>
      <ChevronDown className="size-4 text-white/45" aria-hidden />
    </Link>
  );
}
