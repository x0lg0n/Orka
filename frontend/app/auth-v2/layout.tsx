import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { MarketingPanel } from "@/components/auth-v2/MarketingPanel";

export const metadata = {
  title: "Auth · ORKA",
  description: "Sign in or create an account on ORKA.",
};

export default function AuthV2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a1c2e]">
      {/* Left Marketing Panel — hidden on mobile, 42% on desktop */}
      <div className="hidden h-full w-[42%] flex-shrink-0 lg:block">
        <MarketingPanel />
      </div>

      {/* Right Auth Panel — full width on mobile, 58% on desktop */}
      <div className="flex h-full flex-1 flex-col items-center justify-center overflow-y-auto bg-[#0a1c2e] px-4 py-8 lg:overflow-hidden lg:px-0 lg:py-0">
        {/* Mobile brand header */}
        <div className="mb-6 flex items-center gap-2.5 lg:hidden">
          <span className="display text-2xl tracking-wide text-white">ORKA</span>
        </div>

        {children}
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
