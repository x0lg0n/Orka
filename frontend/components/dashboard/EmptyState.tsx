import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/components/dashboard/DashboardUI";

type Tone = "cyan" | "violet" | "teal" | "orange" | "lime" | "coral";

const toneClasses: Record<Tone, string> = {
  cyan: "border-cyan-200/30 bg-cyan-300/15 text-cyan-100",
  violet: "border-violet/30 bg-violet/15 text-violet",
  teal: "border-teal/30 bg-teal/15 text-teal",
  orange: "border-orange/30 bg-orange/15 text-orange",
  lime: "border-lime/30 bg-lime/15 text-lime",
  coral: "border-coral/30 bg-coral/15 text-coral",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  tone = "violet",
  action,
  compact = false,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: Tone;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[18px] border border-dashed border-white/10 bg-black/20 text-center",
        compact ? "px-5 py-8" : "px-6 py-12",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-12 place-items-center rounded-[18px] border shadow-[0_0_28px_rgba(255,255,255,0.05)]",
          toneClasses[tone],
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <p className={cn("mt-4 font-black text-white", compact ? "text-base" : "text-lg")}>
        {title}
      </p>
      <p
        className={cn(
          "mx-auto mt-2 max-w-md font-bold leading-6 text-slate-400",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
