import {
  ChevronRight,
  FileText,
  Pen,
  ArrowUpCircle,
  CheckCircle2 as CheckBadge,
} from "lucide-react";
import type { Approval, ApprovalType } from "@/types/dashboard";

interface ActionRequiredProps {
  approvals: Approval[];
}

const actionConfig: Record<
  ApprovalType,
  {
    icon: typeof FileText;
    iconBg: string;
    buttonLabel: string;
  }
> = {
  review: {
    icon: FileText,
    iconBg: "bg-purple-100 text-purple-600",
    buttonLabel: "Review",
  },
  sign: {
    icon: Pen,
    iconBg: "bg-yellow-100 text-yellow-600",
    buttonLabel: "Sign",
  },
  release: {
    icon: ArrowUpCircle,
    iconBg: "bg-green-100 text-green-600",
    buttonLabel: "Release",
  },
};

export function ActionRequired({ approvals }: ActionRequiredProps) {
  return (
    <div className="rounded-xl border border-[#e5e8f0] bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-base font-bold text-[#11182d]">Action Required</h2>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f0f0f5] px-1.5 text-[11px] font-bold text-[#5f6b86]">
          {approvals.length}
        </span>
      </div>

      {approvals.length === 0 ? (
        <p className="py-2 text-sm font-medium text-[#8b95aa]">
          You&apos;re all caught up.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {approvals.map((approval) => {
            const config = actionConfig[approval.type];
            const Icon = config.icon;

            return (
              <div
                key={approval.id}
                className="flex items-center gap-3 rounded-lg border border-[#e5e8f0] p-3 transition-colors duration-150 hover:bg-[#f7f8fc]"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#11182d]">
                    {approval.project}
                  </p>
                  <p className="text-xs text-[#5f6b86]">{approval.description}</p>
                </div>
                <button className="flex shrink-0 items-center gap-1 rounded-lg border border-[#e5e8f0] px-3 py-1.5 text-xs font-semibold text-[#5f6b86] transition-colors duration-150 hover:border-[#7c3aed] hover:text-[#7c3aed]">
                  {config.buttonLabel}
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
