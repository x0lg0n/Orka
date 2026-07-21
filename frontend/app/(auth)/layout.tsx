import type { ReactNode } from "react";
import AuthMarketingPanel from "@/components/auth/AuthMarketingPanel";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex-1 bg-night lg:basis-[45%]">
        <AuthMarketingPanel />
      </div>
      <main className="flex flex-1 items-center justify-center bg-paper px-4 py-10 lg:basis-[55%]">
        <div className="flex w-full max-w-md flex-col">
          <a
            href="/"
            className="mb-6 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            &larr; Back to orka.io
          </a>
          {children}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-foreground">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>.
          </p>
        </div>
      </main>
    </div>
  );
}
