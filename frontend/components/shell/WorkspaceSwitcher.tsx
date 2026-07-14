import { Building2 } from "lucide-react";

export function WorkspaceSwitcher({ orgs, currentOrgId }: { orgs: { id: string; name: string }[]; currentOrgId?: string }) {
  return (
    <div className="rounded-[9px] bg-white/[0.045] p-2">
      <p className="px-2 pb-1 pt-1 text-xs font-bold uppercase tracking-wide text-white/40">Workspaces</p>
      <ul className="flex flex-col">
        {orgs.map((org) => (
          <li key={org.id}>
            <button
              type="button"
              className={`flex w-full items-center gap-3 rounded-[7px] px-2 py-2 text-left text-sm font-bold transition hover:bg-hover ${
                org.id === currentOrgId ? "text-primary" : "text-white/80"
              }`}
            >
              <Building2 className="size-4" aria-hidden />
              <span className="truncate">{org.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
