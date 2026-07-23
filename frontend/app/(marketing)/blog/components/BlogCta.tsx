import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function BlogCta() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-[24px] bg-night p-8 text-white md:rounded-[36px] md:p-12">
        <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-[13px] font-bold text-white/50">
              Still managing clients manually?
            </p>
            <h2 className="display mt-2 text-3xl uppercase sm:text-4xl md:text-5xl">
              Run your service business on autopilot.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-4">
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
              See how it works <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
