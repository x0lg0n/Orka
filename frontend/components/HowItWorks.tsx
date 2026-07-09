import { steps } from "../lib/content";

export default function HowItWorks() {
  return (
    <section id="method" className="bg-bone px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="section-label">How We Work</p>
        <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Our working method.</h2>

        {/* Step 1 — expanded */}
        <div className="mt-8 cut-corner rounded-[20px] bg-orange p-6 text-white md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="flex items-start gap-4">
              <span className="display text-7xl">1.</span>
              <div>
                <h3 className="display text-4xl uppercase">Proposal is generated</h3>
                <p className="mt-2 max-w-md text-sm font-bold leading-6 opacity-80">
                  The service brief becomes a clear scope, timeline, agreement, and milestone schedule.
                </p>
              </div>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-ink">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6" /></svg>
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps[0][3]?.map((group, gi) => (
              <div key={gi} className="rounded-[12px] bg-white p-4 text-ink">
                <p className="text-xs font-black uppercase opacity-60">Phase {gi + 1}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {group.map((tag) => (
                    <span key={tag} className="rounded-full bg-ink/10 px-3 py-1 text-xs font-bold">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps 2–4 */}
        {steps.slice(1).map(([number, title, copy]) => (
          <div key={title} className="flex items-center gap-4 border-b-2 border-ink/12 py-7 md:gap-6">
            <span className="display text-6xl">{number}.</span>
            <div className="flex-1">
              <h3 className="display text-3xl uppercase">{title}</h3>
              <p className="mt-1 text-sm font-bold leading-6 text-ink/70">{copy}</p>
            </div>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
