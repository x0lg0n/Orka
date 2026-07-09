import { Plus } from "lucide-react";
import { faqs } from "../lib/content";

export default function Faq() {
  return (
    <section id="faq" className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        {/* Left — heading + related */}
        <div className="lg:sticky lg:top-10 lg:self-start">
          <p className="section-label text-violet">FAQ</p>
          <h2 className="display mt-2 text-5xl uppercase md:text-[80px]">
            Your questions answered.
          </h2>
          <p className="mt-5 max-w-sm text-[18px] font-normal leading-7 text-ink/80">
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
                <span className="display text-[28px] font-normal uppercase leading-[39px] text-ink transition-colors duration-200 group-open:text-violet">
                  {question}
                </span>
              </summary>
              <p className="mt-4 max-w-2xl text-[18px] leading-[31px] text-ink/70">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
