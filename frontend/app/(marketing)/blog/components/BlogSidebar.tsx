import { FileText, ArrowRight } from "lucide-react";
import NewsletterWidget from "./NewsletterWidget";

const resources = [
  "Proposal Template",
  "Contract Template",
  "Invoice Template",
  "Agency Onboarding Checklist",
];

const recommended = [
  {
    title: "5 Pricing Strategies for Agencies That Actually Work",
    readingTime: "7 min read",
  },
  {
    title: "How Milestone Payments Improve Client Relationships",
    readingTime: "6 min read",
  },
  {
    title: "From Freelancer to Agency Owner: A Complete Guide",
    readingTime: "9 min read",
  },
];

export default function BlogSidebar() {
  return (
    <aside className="hidden w-full shrink-0 lg:block lg:w-[300px]">
      <div className="sticky top-24 space-y-5">
        <NewsletterWidget />

        <div className="rounded-2xl border border-night/10 bg-white p-5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-night/50">
            Free Resources
          </h3>
          <div className="mt-3 space-y-2.5">
            {resources.map((r) => (
              <div
                key={r}
                className="flex items-center justify-between text-[12px] font-bold text-night/70"
              >
                <span className="flex items-center gap-2">
                  <FileText size={13} className="text-violet" />
                  {r}
                </span>
                <span className="text-[10px] font-bold text-night/30">
                  Free
                </span>
              </div>
            ))}
          </div>
          <a
            href="#"
            className="mt-3 block text-center text-[11px] font-black text-violet hover:underline"
          >
            View all resources →
          </a>
        </div>

        <div className="rounded-2xl border border-violet/20 bg-violet/5 p-5">
          <h3 className="text-[15px] font-black text-night">
            See Orka in Action
          </h3>
          <p className="mt-1 text-[12px] font-bold leading-5 text-night/50">
            Book a 15-min demo and see how Orka can streamline your operations.
          </p>
          <a
            href="#"
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-violet px-4 py-2 text-[12px] font-black text-white transition-colors hover:bg-violet/90"
          >
            Book a Demo <ArrowRight size={12} />
          </a>
        </div>

        <div className="rounded-2xl border border-night/10 bg-white p-5">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-night/50">
            Recommended Reads
          </h3>
          <div className="mt-3 space-y-3">
            {recommended.map((r) => (
              <a
                key={r.title}
                href="#"
                className="group block text-[12px] font-bold text-night/70 transition-colors hover:text-violet"
              >
                {r.title}
                <span className="mt-0.5 block text-[10px] font-bold text-night/35">
                  {r.readingTime}
                </span>
              </a>
            ))}
          </div>
          <a
            href="#"
            className="mt-3 block text-center text-[11px] font-black text-violet hover:underline"
          >
            View all articles →
          </a>
        </div>
      </div>
    </aside>
  );
}
