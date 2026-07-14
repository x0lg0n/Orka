import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-panel border border-white/10 bg-night px-6 py-16 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-violet/15 text-violet">
        <Icon size={32} aria-hidden />
      </div>
      <h2 className="mt-6 text-[26px] font-extrabold tracking-[-0.02em] text-white">{title}</h2>
      <p className="mt-3 max-w-[26rem] text-base font-bold leading-7 text-white/50">{description}</p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}
