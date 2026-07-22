import type { Metadata } from "next";
import WaitlistForm from "@/components/WaitlistForm";

export const metadata: Metadata = {
  title: "Contact · ORKA",
  description: "Get in touch with the ORKA team. Join the waitlist and we'll reach out when design partner slots open.",
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
            Tell us what you&apos;re building. Join the waitlist and we&apos;ll reach out when design partner slots open.
          </p>
        </div>
      </section>

      {/* Form section */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-[24px] border-2 border-night bg-white p-6 shadow-hard md:p-10">
            <p className="section-label text-coral">Join the waitlist</p>
            <h2 className="display mt-2 text-3xl uppercase sm:text-4xl">
              We reply within one business day.
            </h2>
            <p className="mt-4 text-sm font-bold leading-6 text-night/68">
              Share your name and email — we&apos;ll reach out personally to discuss your use case and onboard you as a design partner.
            </p>
            <div className="mt-8">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
