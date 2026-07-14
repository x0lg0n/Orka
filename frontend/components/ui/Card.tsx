import type { ReactNode } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`card p-6 ${className}`}>{children}</div>;
}

export function Panel({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`panel p-6 ${className}`}>{children}</div>;
}
