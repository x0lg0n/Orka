export default function ProblemCards() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
        {[
          ["Admin tax", "Manual scope, contracts, payment chasing, invoices, and tax records eat the margin."],
          ["Global friction", "Bank wires, PayPal fees, currency delays, and trust gaps slow down international work."],
          ["ORKA shift", "AI coordinates the work lifecycle while programmable escrow executes the money layer."]
        ].map(([title, copy], index) => (
          <article key={title} className={`cut-corner border-2 border-night p-6 text-center md:text-left ${index === 1 ? "bg-coral text-white" : index === 2 ? "bg-lime text-night" : "bg-white text-night"}`}>
            <p className="display text-4xl uppercase sm:text-5xl">{title}</p>
            <p className="mt-4 text-sm font-bold leading-6">{copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
