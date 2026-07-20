import { FileText, Eye, CheckCircle2, Banknote } from "lucide-react";

const STEPS = [
  {
    icon: FileText,
    title: "Work Submitted",
    description: "Contractor submits deliverables for review",
  },
  {
    icon: Eye,
    title: "Client Review",
    description: "Client reviews and provides feedback",
  },
  {
    icon: CheckCircle2,
    title: "Milestone Approved",
    description: "Client approves the completed work",
  },
  {
    icon: Banknote,
    title: "Payment Released",
    description: "Escrow funds are released to contractor",
  },
];

export function MilestonePaymentFlow() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">
        Milestone Payment Flow
      </h3>
      <p className="mt-0.5 text-xs text-gray-500">
        How milestone payments work
      </p>

      <div className="mt-4 flex items-start gap-0">
        {STEPS.map((step, i) => {
          const isLast = i === STEPS.length - 1;
          const isCompleted = i < 2;

          return (
            <div key={step.title} className="flex flex-1 items-start">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isCompleted
                      ? "bg-[#7c3aed] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-900">
                  {step.title}
                </p>
                <p className="mt-0.5 max-w-[120px] text-[10px] text-gray-400">
                  {step.description}
                </p>
              </div>
              {!isLast && (
                <div className="mx-1 mt-5 flex-1">
                  <div
                    className={`h-0.5 w-full ${
                      isCompleted ? "bg-[#7c3aed]" : "bg-gray-200"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
