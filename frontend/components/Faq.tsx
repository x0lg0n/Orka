import { faqs } from "../lib/content";

export default function Faq() {
  return (
    <section id="faq" className="bg-white px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="section-label">FAQ</p>
          <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Your questions answered.</h2>
          <p className="mt-5 text-sm font-bold leading-6 text-ink/70">
            Everything you need to know about ORKA. We have answers to your questions about our services and approach.
          </p>
        </div>
        <div className="grid gap-4">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group border-b-2 border-ink/12 pb-4">
              <summary className="flex cursor-pointer list-none items-center gap-4 text-base font-black uppercase">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink text-white">
                  <span className="group-open:hidden text-lg leading-none">+</span>
                  <span className="hidden group-open:inline text-lg leading-none">−</span>
                </span>
                <span>{question}</span>
              </summary>
              <p className="mt-3 ml-12 max-w-3xl text-sm font-bold leading-6 text-ink/70">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
