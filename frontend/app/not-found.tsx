import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-night px-6 text-white">
      <section className="max-w-2xl text-center">
        <p className="section-label">404</p>
        <h1 className="display mt-3 text-7xl uppercase md:text-8xl">
          This milestone does not exist.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-sm font-bold leading-6 text-white/70">
           The ORKA route you opened is not available. Head back to the landing page to get started.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-lime px-6 py-3 text-sm font-black uppercase text-night transition hover:bg-orange"
        >
          Back to ORKA
        </Link>
      </section>
    </main>
  );
}
