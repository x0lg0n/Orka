import { Bell, Command, Search, UserRound } from "lucide-react";
import SignOutButton from "../../../components/SignOutButton";

export default function DashboardTopBar({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const initials = (name || email || "O")
    .split(/[ @.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-white/10 bg-[#05101f]/85 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-b-0 lg:bg-transparent lg:px-0 lg:pt-0">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Search className="size-5 shrink-0 text-cyan-200/70" aria-hidden />
          <input
            aria-label="Search dashboard"
            placeholder="Search projects, proposals, payments"
            className="min-w-0 flex-1 bg-transparent text-sm font-bold text-white outline-none placeholder:text-slate-400"
          />
          <span className="hidden items-center gap-1 rounded-xl border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-black uppercase text-slate-300 sm:flex">
            <Command className="size-3.5" aria-hidden /> K
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="grid size-11 place-items-center rounded-[18px] border border-white/10 bg-white/[0.06] text-white transition hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-cyan-200/50"
          >
            <Bell className="size-5" aria-hidden />
          </button>
          <div className="flex min-w-0 items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.06] px-3 py-2 text-white">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-sm font-black text-[#04101f]">
              {initials || <UserRound className="size-4" aria-hidden />}
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-black">
                {name || "ORKA member"}
              </span>
              <span className="block truncate text-xs font-bold text-slate-400">
                {email}
              </span>
            </span>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
