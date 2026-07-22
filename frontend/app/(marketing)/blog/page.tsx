import type { Metadata } from "next";

const posts = [
  {
    title: "Why on-chain escrow beats net-30 for freelancers",
    excerpt:
      "Milestone-based release means you get paid the moment work is approved — no invoices chasing you into next quarter.",
    date: "Jul 2026",
    tag: "Payments",
  },
  {
    title: "Designing the ORKA client portal",
    excerpt:
      "How we built a token-addressed, read-only view so clients can follow progress without a login.",
    date: "Jun 2026",
    tag: "Design",
  },
  {
    title: "Stellar vs Ethereum for stablecoin payroll",
    excerpt:
      "A practical look at fees, finality, and developer ergonomics for cross-border payments.",
    date: "May 2026",
    tag: "Tech",
  },
];

export const metadata: Metadata = {
  title: "Blog · ORKA",
  description: "Notes on escrow, payments, and building trust into software.",
};

export default function BlogPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-b-[42px] bg-night px-4 pb-16 pt-5 text-white md:rounded-b-[72px] md:px-8 lg:px-12">
        <div className="relative z-10 mx-auto max-w-4xl pt-16 pb-4 text-center">
          <span className="rounded-full border border-white/20 bg-white/8 px-4 py-1.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/80">
            Insights & engineering
          </span>
          <h1 className="display mx-auto mt-6 max-w-3xl text-[2.6rem] uppercase leading-[1.05] text-white sm:text-[4rem] md:text-[5.5rem]">
            The <span className="text-orange">ORKA</span> blog
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base font-normal leading-7 text-white/78 sm:text-lg sm:leading-8">
            Notes on escrow, payments, and building trust into software.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="px-4 py-16 md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            {posts.map((p) => (
              <article
                key={p.title}
                className="cut-corner relative rounded-[20px] border-2 border-night bg-white p-6 shadow-hard md:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="sticker rounded-full bg-violet px-3 py-1 text-xs font-black uppercase text-white shadow-hard">
                    {p.tag}
                  </span>
                  <p className="font-mono text-sm font-bold text-night/50">
                    {p.date}
                  </p>
                </div>
                <h2 className="display mt-4 text-2xl uppercase text-night sm:text-3xl">
                  {p.title}
                </h2>
                <p className="mt-3 text-sm font-bold leading-6 text-night/68">
                  {p.excerpt}
                </p>
                <div className="mt-6 flex justify-end">
                  <span className="rounded-full border border-night/20 bg-bone px-4 py-1 text-[11px] font-black uppercase text-night/60">
                    Full article coming soon
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
