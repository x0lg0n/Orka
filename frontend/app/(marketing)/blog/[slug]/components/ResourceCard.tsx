import Link from "next/link";
import { FileText } from "lucide-react";

const resources = [
  "Proposal Template",
  "Contract Template",
  "Invoice Template",
  "Agency Onboarding Checklist",
];

export default function ResourceCard() {
  return (
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
            <span className="text-2xs font-bold text-night/30">Free</span>
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
  );
}
