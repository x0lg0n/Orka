import type { ReactNode } from "react";
import AuthMarketingPanel from "@/components/auth/AuthMarketingPanel";
import AuthTopBar from "@/components/auth/AuthTopBar";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-light flex min-h-dvh flex-col">
      <AuthTopBar />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="flex flex-1 items-center justify-center bg-background px-5 py-12 sm:px-8 lg:basis-[55%] lg:px-12">
          <div className="flex w-full max-w-md flex-col gap-8">
            {children}
            <p className="-mt-2 text-center text-xs leading-5 text-muted-foreground">
              By continuing, you agree to our{" "}
              <a href="/terms" className="auth-text-link">
                Terms
              </a>{" "}
              and{" "}
              <a href="/privacy" className="auth-text-link">
                Privacy Policy
              </a>.
            </p>
          </div>
        </main>
        <div className="hidden flex-1 lg:flex lg:basis-[45%]">
          <AuthMarketingPanel />
        </div>
      </div>
    </div>
  );
}
