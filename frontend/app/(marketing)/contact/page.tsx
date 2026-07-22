import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact · ORKA",
  description: "Get in touch with the ORKA team. Create your account and start building.",
};

export default function ContactPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
        <div className="relative z-10 mx-auto max-w-3xl pt-16 pb-4 text-center">
          <span className="rounded-full border border-white/20 bg-white/8 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/80">
            Get in touch
          </span>
          <h1 className="display mx-auto mt-6 max-w-2xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4rem] md:text-[5rem]">
            Talk to the <span className="text-orange">ORKA</span> team
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-normal leading-7 text-white/78 sm:text-lg sm:leading-8">
            Tell us what you&apos;re building. Create your account and we&apos;ll reach out to help you get started.
          </p>
        </div>
      </section>

      {/* CTA section */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[24px] border-2 border-night bg-white p-6 shadow-hard md:p-10">
            <p className="section-label text-coral">Get started</p>
            <h2 className="display mt-2 text-3xl uppercase sm:text-4xl">
              Create your account.
            </h2>
            <p className="mt-4 text-sm font-bold leading-6 text-night/68">
              Sign up for ORKA and we&apos;ll reach out personally to discuss your use case and get you set up.
            </p>
            <div className="mt-8">
              <Link
                href="/signup"
                className="group inline-flex min-h-12 items-center gap-3 rounded-full bg-violet px-8 py-3 text-sm font-bold text-white transition-all hover:bg-night hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet"
              >
                Get started <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
