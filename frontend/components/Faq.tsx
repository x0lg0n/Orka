import { Plus } from "lucide-react";
import { faqs } from "../lib/content";

export default function Faq() {
  return (
    <section id="faq" className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        {/* Left — heading + related */}
        <div className="text-center lg:sticky lg:top-10 lg:self-start lg:text-left">
          <p className="section-label text-violet">FAQ</p>
          <h2 className="display mt-2 text-4xl uppercase sm:text-5xl md:text-6xl lg:text-[80px]">
            Your questions answered.
          </h2>
          <p className="mx-auto mt-5 max-w-sm text-base font-normal leading-7 text-ink/80 sm:text-[18px] lg:mx-0">
            Everything you need to know about ORKA. We have answers to your
            questions about our services and approach.
          </p>
        </div>

        {/* Right — questions + answers */}
        <div className="flex flex-col">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group py-6">
              <summary className="flex cursor-pointer gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-all duration-300 group-open:rotate-45 group-open:bg-violet">
                  <Plus size={24} />
                </span>
                <span className="display text-[22px] font-normal uppercase leading-[30px] text-ink transition-colors duration-200 group-open:text-violet sm:text-[28px] sm:leading-[39px]">
                  {question}
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70 sm:text-[18px] sm:leading-[31px]">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
