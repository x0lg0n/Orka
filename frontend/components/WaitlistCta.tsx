import WaitlistForm from "./WaitlistForm";

export default function WaitlistCta() {
  return (
    <section id="waitlist" className="px-4 py-16 md:px-8 lg:px-12">
      <div className=" relative overflow-hidden mx-auto max-w-7xl rounded-[28px] bg-ink p-6 text-white md:p-10 lg:rounded-[36px]">
        {/* Floating stickers */}
        <span className="sticker absolute right-[5%] top-[35%] rounded-full bg-coral px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block">
          Brand Strategy
        </span>
        <span className="sticker absolute right-[3%] top-[45%] rounded-full bg-lime px-4 py-2 text-xs font-black uppercase text-ink shadow-hard hidden lg:block" style={{ transform: "rotate(5deg)" }}>
          Performance Metrics
        </span>
        <span className="sticker absolute right-[5%] top-[55%] rounded-full bg-violet px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block" style={{ transform: "rotate(-3deg)" }}>
          Business Growth
        </span>
        <span className="absolute right-[58%] bottom-[30%] text-4xl text-orange select-none hidden lg:block">*</span>
        <span className="absolute left-[10%] top-[20%] text-2xl text-lime select-none hidden lg:block">+</span>

        <div className="grid col-auto gap-20">
          <div className=" text-center">
            <h2 className="display mt-2 mr-4 text-5xl uppercase md:text-6xl lg:text-[80px] leading-[80px]">
              Ready to partner with ORKA & unlock the{" "}
              <span className="text-orange">full</span> potential?
            </h2>
          </div>
          <div className="rounded-[18px] bg-white p-5 text-ink md:p-6">
            <WaitlistForm />
          </div>
        </div>
      </div>
    </section>
  );
}
