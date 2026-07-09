import { engines } from "../lib/content";

export default function Engines() {
  return (
    <section id="engines" className="px-4 py-10 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="section-label text-coral">Our Engines!</p>
        <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 className="display max-w-2xl text-6xl uppercase md:text-7xl">Services designed to drive real results.</h2>
          <p className="max-w-md text-[18px] font-normal leading-7 text-ink/80">
            ORKA combines AI workflow automation with Stellar settlement rails, so the work and money move together.
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {engines.map((engine) => (
            <article
              key={engine.title}
              className={`cut-corner relative min-h-[220px] rounded-[14px] border-2 border-ink p-6 text-white shadow-hard ${engine.color}`}
            >
              <h3 className="display text-[80px] uppercase">{engine.title}</h3>
              <p className="mt-4 max-w-[80%] text-sm font-bold leading-6">{engine.copy}</p>
              <span className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full bg-white text-xl font-black text-ink">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
