import Link from "next/link";
import type { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-shell text-night">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-extrabold tracking-tight text-night">
            ORKA
          </Link>
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Client Portal
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
      <footer className="mx-auto max-w-3xl px-6 pb-10 text-center text-xs text-muted-foreground">
        Powered by ORKA · Secure on-chain escrow
      </footer>
    </div>
  );
}
