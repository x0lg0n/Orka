import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function AuthTopBar() {
  return (
    <header className="grid h-16 border-b lg:grid-cols-[55fr_45fr]">
      <div className="flex items-center justify-between bg-background px-5 sm:px-8 lg:px-10">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="ORKA home">
          <Image
            src="/Logo/LOGO.svg"
            alt="ORKA"
            width={32}
            height={32}
            className="size-8"
          />
          <span className="text-2xl font-bold tracking-[-0.04em] text-foreground transition-colors group-hover:text-violet">
            ORKA
          </span>
        </Link>

        <Link
          href="/docs"
          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet/15 lg:hidden"
        >
          <BookOpen size={16} aria-hidden="true" />
          <span>Documentation</span>
        </Link>
      </div>

      <div className="hidden items-center justify-end bg-night px-10 lg:flex">
        <Link
          href="/docs"
          className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-lime/30"
        >
          <BookOpen size={16} aria-hidden="true" />
          <span>Documentation</span>
        </Link>
      </div>
    </header>
  );
}
