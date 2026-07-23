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
            <span className="text-[10px] font-bold text-night/30">Free</span>
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
  );
}
