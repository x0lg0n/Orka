import Link from "next/link";
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
          <h3 className="text-xs font-black uppercase tracking-wider text-night/50">
            Free Resources
          </h3>
          <div className="mt-3 space-y-2.5">
            {resources.map((r) => (
              <div
                key={r}
                className="flex items-center justify-between text-sm font-bold text-night/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50"
              >
                <span className="flex items-center gap-2">
                  <FileText size={13} className="text-violet" />
                  {r}
                </span>
                <span className="text-2xs font-bold text-night/30">
                  Free
                </span>
              </div>
            ))}
          </div>
          <Link
            href="/resources"
            className="mt-3 block text-center text-xs font-black text-violet hover:underline"
          >
            View all resources →
          </Link>
        </div>

        <div className="rounded-2xl border border-violet/20 bg-violet/5 p-5">
          <h3 className="text-md font-black text-night">
            See Orka in Action
          </h3>
          <p className="mt-1 text-sm font-bold leading-5 text-night/50">
            Book a 15-min demo and see how Orka can streamline your operations.
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/demo"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet px-3 py-2 text-sm font-black text-white transition-colors hover:bg-violet/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Book a Demo <ArrowRight size={12} />
            </Link>
            <a
              href="https://forms.gle/MucRjiXUXS9soq37A"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-night/20 px-3 py-2 text-sm font-bold text-night/60 transition-colors hover:border-violet/30 hover:text-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50"
            >
              Feedback
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-night/10 bg-white p-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-night/50">
            Recommended Reads
          </h3>
          <div className="mt-3 space-y-3">
            {recommended.map((r) => (
              <Link
                key={r.title}
                href="/blog"
                className="group block text-sm font-bold text-night/70 transition-colors hover:text-violet focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet/50 rounded"
              >
                {r.title}
                <span className="mt-0.5 block text-2xs font-bold text-night/35">
                  {r.readingTime}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/blog"
            className="mt-3 block text-center text-xs font-black text-violet hover:underline"
          >
            View all articles →
          </Link>
        </div>
      </div>
    </aside>
  );
}
