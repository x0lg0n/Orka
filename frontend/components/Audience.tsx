export default function Audience() {
  return (
    <section className="px-4 py-16 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl rounded-[24px] bg-violet p-6 text-center text-white md:p-10 lg:text-left">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <h2 className="display text-4xl uppercase sm:text-5xl md:text-6xl lg:text-7xl">
            Built for the people already moving global work.
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {["Agencies managing cross-border teams", "Freelancers shipping milestone projects", "Remote startups paying contractors", "Marketplaces needing escrow APIs"].map((item) => (
              <div key={item} className="rounded-[12px] border-2 border-white/70 bg-white/12 p-4 text-sm font-black uppercase">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
