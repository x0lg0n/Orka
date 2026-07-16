"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function UpgradeCard({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="mx-2 grid place-items-center rounded-xl bg-primary/20 p-3" title="Upgrade to Pro">
        <Sparkles className="size-5 text-lime" aria-hidden />
      </div>
    );
  }

  return (
    <div className="mx-4 rounded-xl bg-primary/20 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-4 text-lime" aria-hidden />
        <h3 className="text-sm font-extrabold text-white">Upgrade to Pro</h3>
      </div>
      <p className="text-[13px] font-bold leading-5 text-white/70">
        Unlimited projects, advanced analytics and priority support.
      </p>
      <Button className="mt-4 h-10 w-full text-sm font-extrabold">Upgrade Now</Button>
    </div>
  );
}
