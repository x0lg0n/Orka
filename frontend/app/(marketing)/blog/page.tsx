const posts = [
  {
    title: "Why on-chain escrow beats net-30 for freelancers",
    excerpt:
      "Milestone-based release means you get paid the moment work is approved — no invoices chasing you into next quarter.",
    date: "Jul 2026",
  },
  {
    title: "Designing the ORKA client portal",
    excerpt:
      "How we built a token-addressed, read-only view so clients can follow progress without a login.",
    date: "Jun 2026",
  },
  {
    title: "Stellar vs Ethereum for stablecoin payroll",
    excerpt:
      "A practical look at fees, finality, and developer ergonomics for cross-border payments.",
    date: "May 2026",
  },
];

export const metadata = { title: "Blog · ORKA" };

export default function BlogPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="display text-4xl uppercase text-night">Blog</h1>
      <p className="mt-3 text-sm font-bold text-night/70">
        Notes on escrow, payments, and building trust into software.
      </p>

      <div className="mt-12 space-y-6">
        {posts.map((p) => (
          <article
            key={p.title}
            className="rounded-[20px] border border-night/10 bg-white/60 p-6"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-night/50">
              {p.date}
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-night">{p.title}</h2>
            <p className="mt-2 text-sm font-bold text-night/70">{p.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
