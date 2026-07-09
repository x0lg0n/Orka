export default function WhyChooseUs() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="section-label text-coral">Why Choose Us!</p>
          <h2 className="display mt-2 text-6xl uppercase md:text-7xl">Why ORKA is the trusted choice.</h2>
          <p className="mt-5 text-[18px] font-normal leading-7 text-ink/80">
            Clients get familiar links, email access, and simple approvals. Under the hood, ORKA manages
            smart-contract escrow, sponsored transactions, path payments, verification trails, and ledgers.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Guaranteed trust", "Funds are locked before work starts and released against milestone rules."],
            ["Zero-touch ops", "AI handles project administration that usually needs managers and accountants."],
            ["Borderless payouts", "Stellar routing supports fast, low-cost settlement across currencies."],
            ["Data flywheel", "Every verified delivery teaches ORKA what good work looks like."]
          ].map(([title, copy]) => (
            <div key={title} className="cut-corner rounded-[14px] border-2 border-ink bg-white p-6">
              <h3 className="display text-3xl uppercase">{title}</h3>
              <p className="mt-3 text-sm font-bold leading-6 text-ink/68">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
