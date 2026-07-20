// frontend/app/(app)/w/[slug]/projects/[id]/components/WorkflowStepper.tsx
import type { ProjectStage } from "@/lib/workflow";

const STEPS: { key: ProjectStage | "start"; label: string }[] = [
  { key: "start", label: "Proposal" },
  { key: "contract_signed", label: "Contract" },
  { key: "escrow_funded", label: "Escrow" },
  { key: "milestones_active", label: "Milestones" },
  { key: "completed", label: "Done" },
];
const ORDER: ProjectStage[] = ["draft", "proposal_sent", "contract_signed", "escrow_funded", "milestones_active", "completed"];

export function WorkflowStepper({ stage }: { stage: ProjectStage }) {
  const currentIdx = ORDER.indexOf(stage);
  return (
    <ol className="flex items-center gap-2 text-sm">
      {STEPS.map((s, i) => {
        const target = s.key === "start" ? -1 : ORDER.indexOf(s.key as ProjectStage);
        const reached = target === -1 || target <= currentIdx;
        const active = s.key !== "start" && s.key === stage;
        return (
          <li key={s.label} className={`flex items-center gap-2 ${reached ? "text-indigo-600" : "text-gray-400"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-indigo-600" : reached ? "bg-indigo-200" : "bg-gray-200"}`} />
            {s.label}
            {i < STEPS.length - 1 && <span className="h-px w-8 bg-gray-200" />}
          </li>
        );
      })}
    </ol>
  );
}
