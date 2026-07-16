"use client";

import { Star } from "lucide-react";

const features = [
  "Advanced analytics",
  "Custom invoices",
  "Priority support",
  "Team management",
];

export function UpgradeCard() {
  return (
    <div className="mx-4 rounded-xl bg-[#7c3aed] p-4">
      <div className="mb-3 flex items-center gap-2">
        <Star className="h-4 w-4 text-yellow-300" fill="currentColor" />
        <h3 className="text-sm font-bold text-white">Upgrade to Pro</h3>
      </div>
      <ul className="mb-4 space-y-1.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-xs text-white/80">
            <svg
              className="h-3.5 w-3.5 shrink-0 text-white/60"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <button className="w-full rounded-lg bg-white/15 px-4 py-2 text-sm font-bold text-white transition-colors duration-150 hover:bg-white/20">
        Upgrade Now
      </button>
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
