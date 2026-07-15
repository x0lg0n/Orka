import Link from "next/link";
import Footer from "@/components/Footer";

const links = [
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/docs", label: "Docs" },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="border-b border-night/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-lg font-extrabold tracking-tight text-night"
          >
            ORKA
          </Link>
          <nav className="flex items-center gap-5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hidden text-sm font-bold text-night/70 transition hover:text-night sm:block"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="text-sm font-bold text-night/70 transition hover:text-night"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-lime px-4 py-2 text-sm font-black uppercase text-night transition hover:-translate-y-0.5 hover:bg-orange hover:text-white"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
