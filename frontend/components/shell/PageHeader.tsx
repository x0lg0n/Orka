import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200/70">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[34px] font-black tracking-[-0.03em] text-white text-balance">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-6 text-slate-400">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}
