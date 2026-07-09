import Navbar from "./Navbar";
import WaitlistForm from "./WaitlistForm";

export default function Hero() {
  return (
    <section className="noise relative overflow-hidden rounded-b-[42px] bg-ink px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
      {/* Floating decorations */}
      <span className="absolute left-[8%] top-[18%] text-3xl text-lime opacity-60 select-none">+</span>
      <span className="absolute right-[12%] top-[10%] text-2xl text-orange opacity-50 select-none">✦</span>
      <span className="absolute left-[4%] bottom-[30%] text-xl text-violet opacity-40 select-none">★</span>
      <span className="absolute right-[6%] bottom-[20%] text-3xl text-coral opacity-40 select-none">+</span>

      {/* Nav */}
      <Navbar />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-7xl pt-16 pb-8">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <span className="rounded-full bg-coral/20 border border-coral/40 px-4 py-1.5 text-xs font-black uppercase text-coral">
            AI operations + programmable finance
          </span>
          <span className="sticker rounded-full bg-lime px-4 py-1.5 text-xs font-black uppercase text-ink shadow-hard">
            #1 Financial OS for Service Work
          </span>
        </div>

        <h1 className="display mx-auto max-w-5xl text-center text-[4.2rem] uppercase text-white sm:text-[6.4rem] lg:text-[7.3rem]">
          Autonomous financial{" "}
          <span className="text-orange">OS</span> for{" "}
          <span className="text-violet">global</span> service work.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-semibold leading-8 text-white/78">
          ORKA eliminates the admin tax of proposals, escrow, milestone verification, payouts,
          invoices, and financial records for agencies and freelancers working across borders.
        </p>

        <div className="mt-8 flex justify-center ">
          <div className="rounded-[18px] bg-white p-5 text-ink md:p-6">
            <WaitlistForm compact />
          </div>
        </div>
      </div>

      {/* Stats + tag cloud row */}
      <div className="relative z-10 mx-auto mt-12 flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        {/* Tag cloud */}
        <div className="flex flex-wrap gap-2 max-w-md">
          {["Business Growth", "Success", "Performance Metrics", "Global Payments", "AI Automation"].map((tag, i) => (
            <span
              key={tag}
              className={`sticker rounded-full px-4 py-1.5 text-xs font-black uppercase shadow-hard ${
                i === 0 ? "bg-orange text-white rotate-[-3deg]" :
                i === 1 ? "bg-coral text-white rotate-[2deg]" :
                i === 2 ? "bg-lime text-ink rotate-[-1deg]" :
                i === 3 ? "bg-violet text-white rotate-[3deg]" :
                "bg-teal text-white rotate-[-2deg]"
              }`}
            >
              {tag}
            </span>
          ))}
          <p className="w-full mt-3 display text-3xl uppercase text-white/90 leading-tight">
            5X achieved ROI on ad spend consistently! Average increase in ROI for our clients.
          </p>
        </div>

        {/* Stat cards */}
        <div className="flex gap-4">
          <div className="cut-corner rounded-[14px] bg-teal p-5 text-white shadow-hard min-w-[160px]">
            <div className="flex items-start justify-between">
              <p className="display text-4xl">50+</p>
              <span className="grid size-8 place-items-center rounded-full bg-white text-ink">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
              </span>
            </div>
            <p className="mt-2 text-xs font-bold opacity-80">Design partners<br />on the waitlist</p>
          </div>
          <div className="cut-corner rounded-[14px] bg-lime p-5 text-ink shadow-hard min-w-[160px]">
            <div className="flex items-start justify-between">
              <p className="display text-4xl">99%</p>
              <span className="grid size-8 place-items-center rounded-full bg-white text-ink">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7" /><path d="M7 7h10v10" /></svg>
              </span>
            </div>
            <p className="mt-2 text-xs font-bold opacity-80">Admin tasks<br />eliminated</p>
          </div>
        </div>
      </div>

      {/* Sticker decorations */}
      <div className="sticker absolute -left-4 top-[40%] rounded-full bg-coral px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block">
        No wallet drama
      </div>
      <div className="sticker absolute -right-4 top-[25%] rounded-full bg-violet px-4 py-2 text-xs font-black uppercase text-white shadow-hard hidden lg:block" style={{ transform: "rotate(6deg)" }}>
        Soroban powered
      </div>
    </section>
  );
}
