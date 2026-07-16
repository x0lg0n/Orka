import { Check } from "lucide-react";

interface Step {
  num: number;
  title: string;
  subtitle: string;
}

export function StepNavigation({
  steps,
  current,
}: {
  steps: Step[];
  current: number;
}) {
  return (
    <div className="mt-6 flex items-center gap-0 overflow-x-auto">
      {steps.map((step, i) => {
        const isActive = step.num === current;
        const isCompleted = step.num < current;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition ${
                  isCompleted
                    ? "bg-[#7c3aed] text-white"
                    : isActive
                      ? "border-2 border-[#7c3aed] bg-[#7c3aed] text-white"
                      : "border-2 border-gray-200 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.num
                )}
              </div>
              <div className="hidden sm:block">
                <p
                  className={`text-sm font-semibold ${
                    isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.subtitle}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 w-8 sm:w-16 ${
                  step.num < current ? "bg-[#7c3aed]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
