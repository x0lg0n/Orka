"use client";

import { useState } from "react";
import { ArrowRight, Briefcase, Check, ChevronDown, Coins, Sparkles, User, X } from "lucide-react";
import { steps, type FlowActor } from "../lib/content";

const actorIcon: Record<FlowActor, typeof User> = {
  Client: User,
  Freelancer: Briefcase,
  "ORKA AI": Sparkles,
  Stellar: Coins,
};

const actorColor: Record<FlowActor, string> = {
  Client: "bg-violet text-white",
  Freelancer: "bg-teal text-white",
  "ORKA AI": "bg-orange text-white",
  Stellar: "bg-night text-white",
};

export default function HowItWorks() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="method" className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl text-center md:text-left">
        <p className="section-label text-coral">How It Works</p>
        <h2 className="display mt-2 text-4xl uppercase sm:text-5xl md:text-6xl lg:text-7xl">
          Our working method.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-7 text-night/80 sm:text-[18px] md:mx-0">
          Four steps take a project from a rough brief to paid and reconciled.
          Tap any step to see exactly what happens, who does it, and how ORKA
          compares to doing it the old way.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {steps.map((step, i) => {
            const isOpen = open === i;
            return (
              <div
                key={step.title}
                className={`cut-corner overflow-hidden rounded-[20px] border-2 border-night shadow-hard transition-colors duration-300 ${
                  isOpen ? "bg-orange text-white" : "bg-white text-night"
                }`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 px-6 py-5 text-left md:gap-6">
                  <span className="display text-4xl sm:text-6xl">{step.number}.</span>
                  <div className="flex-1">
                    <h3 className="display text-2xl uppercase sm:text-3xl">{step.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-night/70 md:hidden">
                      {step.summary}
                    </p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-night text-white transition-transform duration-300 hover:scale-110">
                    <ChevronDown
                      size={18}
                      strokeWidth={3}
                      className={`transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}>
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 text-left">
                      <p className="max-w-2xl text-sm font-bold leading-6 opacity-80">
                        {step.summary}
                      </p>

                      {step.phases && (
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                          {step.phases.map((group, gi) => (
                            <div
                              key={gi}
                              className="rounded-[12px] bg-white p-4 text-night">
                              <p className="text-xs font-black uppercase opacity-60">
                                Phase {gi + 1}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {group.map((tag) => (
                                  <span
                                    key={tag}
                                    className="rounded-full bg-night/10 px-3 py-1 text-xs font-bold">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* How it flows */}
                      <p className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-wide opacity-80">
                        <ArrowRight size={14} /> How it flows
                      </p>
                      <ol className="mt-3 flex flex-col gap-3">
                        {step.flow.map((item, fi) => {
                          const Icon = actorIcon[item.actor];
                          return (
                            <li
                              key={fi}
                              className="flex items-start gap-3 rounded-[12px] bg-white p-3 text-night">
                              <span
                                className={`grid size-8 shrink-0 place-items-center rounded-full ${actorColor[item.actor]}`}>
                                <Icon size={16} />
                              </span>
                              <div>
                                <p className="text-xs font-black uppercase opacity-60">
                                  {item.actor}
                                </p>
                                <p className="text-sm font-bold leading-6">{item.text}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ol>

                      {/* Before / After */}
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-[12px] bg-night/15 p-4 text-white">
                          <div className="flex items-center gap-2 text-sm font-black uppercase">
                            <X size={16} className="text-white/70" /> Before ORKA
                          </div>
                          <p className="mt-2 text-sm font-medium leading-6 text-white/85">
                            {step.traditional}
                          </p>
                        </div>
                        <div className="rounded-[12px] bg-white p-4 text-night">
                          <div className="flex items-center gap-2 text-sm font-black uppercase text-teal">
                            <Check size={16} /> With ORKA
                          </div>
                          <p className="mt-2 text-sm font-bold leading-6">{step.orka}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
