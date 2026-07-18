import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggler } from "@/components/ThemeToggler";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="absolute right-4 top-4">
        <ThemeToggler variant="circle" />
      </div>
      <div className="w-full max-w-md rounded-[28px] border bg-card p-6 text-card-foreground shadow-sm md:p-8">
        {children}
      </div>
      <Link
        href="/"
        className="mt-6 text-xs font-bold text-muted-foreground underline-offset-4 hover:underline"
      >
        Back to ORKA
      </Link>
    </main>
  );
}
