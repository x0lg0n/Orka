import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-night px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-[28px] bg-white p-6 text-night shadow-hard md:p-8">
        {children}
      </div>
      <Link
        href="/"
        className="mt-6 text-xs font-bold text-white/50 underline-offset-4 hover:underline"
      >
        Back to ORKA
      </Link>
    </main>
  );
}
