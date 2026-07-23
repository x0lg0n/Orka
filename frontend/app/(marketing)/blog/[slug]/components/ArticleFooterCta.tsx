import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ArticleFooterCta() {
  return (
    <section className="mt-16 px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl rounded-[24px] bg-night p-8 text-white md:rounded-[36px] md:p-12">
        <div className="text-center">
          <p className="text-base font-bold text-white/50">
            Stop losing revenue to broken client processes.
          </p>
          <h2 className="display mx-auto mt-3 max-w-xl text-3xl uppercase sm:text-4xl md:text-5xl">
            Spend Less Time Managing Clients.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-md font-bold leading-6 text-white/60">
            More Time Growing Your Business.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-violet px-6 py-3 text-sm font-black text-white transition-colors hover:bg-violet/90"
            >
              Explore Platform <ArrowRight size={16} />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/70 transition-colors hover:text-white"
            >
              See How ORKA Works <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
