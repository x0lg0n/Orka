import Link from "next/link";
import { Plus, FolderKanban, Users, ArrowRight } from "lucide-react";

interface GettingStartedProps {
  slug: string;
}

export function GettingStarted({ slug }: GettingStartedProps) {
  const steps = [
    {
      label: "Create your first project",
      desc: "Set up milestones and escrow for a client engagement.",
      href: `/w/${slug}/projects/new`,
      icon: FolderKanban,
      cta: "New Project",
    },
    {
      label: "Add a client",
      desc: "Keep your client contacts organized in one place.",
      href: `/w/${slug}/clients`,
      icon: Users,
      cta: "Add Client",
    },
  ];

  return (
    <div className="rounded-xl border border-dashed border-[#c9d2e8] bg-[#faf9ff] p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7c3aed] text-white">
          <Plus className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-bold text-[#11182d]">
            Get started with ORKA
          </h2>
          <p className="text-xs text-[#8b95aa]">
            Your workspace is empty — here&apos;s how to set it up.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.label}
              href={step.href}
              className="group flex items-center gap-3 rounded-lg border border-[#e5e8f0] bg-white p-4 transition-all duration-150 hover:border-[#7c3aed] hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#11182d]">
                  {step.label}
                </p>
                <p className="text-xs text-[#8b95aa]">{step.desc}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#7c3aed]">
                {step.cta}
                <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
