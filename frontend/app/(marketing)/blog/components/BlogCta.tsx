import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BlogCta() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-[24px] bg-night p-8 text-white md:rounded-[36px] md:p-12">
        <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-base font-bold text-white/50">
              Still managing clients manually?
            </p>
            <h2 className="display mt-2 text-3xl uppercase sm:text-4xl md:text-5xl">
              Run your service business on autopilot.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex min-h-14 items-center gap-3 rounded-full bg-violet px-8 py-4 text-base font-bold text-white transition-all hover:bg-violet/80 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              Explore Platform <ArrowRight size={18} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex min-h-14 items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-base font-bold text-white/80 transition-all hover:bg-white/8 hover:text-white hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              See how it works <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
