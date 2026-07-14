import { ArrowUpRight } from "lucide-react";
import { engines } from "../lib/content";

export default function Engines() {
  return (
    <section id="engines" className="px-4 py-10 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl text-center md:text-left">
        <p className="section-label text-coral">Our Engines!</p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="display max-w-2xl text-4xl uppercase sm:text-5xl md:text-6xl lg:text-7xl">Services designed to drive real results.</h2>
          <p className="mx-auto max-w-md text-base font-normal leading-7 text-night/80 sm:text-[18px] md:mx-0">
            ORKA combines AI workflow automation with Stellar settlement rails, so the work and money move together.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {engines.map((engine) => (
            <article
              key={engine.title}
              className={`cut-corner group relative min-h-[220px] rounded-[14px] border-2 border-ink p-6 text-center text-white shadow-hard transition-transform duration-300 hover:-translate-y-1.5 md:text-left ${engine.color}`}
            >
              <h3 className="display text-6xl uppercase sm:text-7xl lg:text-[80px]">{engine.title}</h3>
              <p className="mx-auto mt-4 max-w-[80%] text-sm font-bold leading-6 md:mx-0">{engine.copy}</p>
               <span className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full bg-white text-xl font-black text-night transition-transform duration-300 group-hover:scale-110">
                <ArrowUpRight size={18} strokeWidth={3} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
