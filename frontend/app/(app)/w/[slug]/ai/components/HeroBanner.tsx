"use client";

import { Sparkles } from "lucide-react";

interface HeroBannerProps {
  userName: string;
}

export default function HeroBanner({ userName }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#5b21b6] p-8 text-white shadow-lg">
      <div className="relative z-10 max-w-xl">
        <h2 className="text-3xl font-bold">
          👋 Hi {userName}! I&apos;m Orka AI Copilot.
        </h2>
        <p className="mt-4 text-lg text-white/80">
          I can help you write proposals, analyze projects, summarize documents,
          forecast payments, and much more.
        </p>
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-90">
        <div className="relative">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Sparkles className="h-16 w-16 text-white/90" />
          </div>
          <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <span className="text-2xl">🤖</span>
          </div>
        </div>
      </div>
    </div>
  );
}
