import {
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";

type CalloutVariant = "insight" | "best-practice" | "tip" | "warning" | "example";

const variants: Record<
  CalloutVariant,
  { bg: string; border: string; icon: typeof Lightbulb; iconColor: string; label: string; labelColor: string }
> = {
  insight: {
    bg: "bg-violet/5",
    border: "border-violet/20",
    icon: Info,
    iconColor: "text-violet",
    label: "Insight",
    labelColor: "text-violet",
  },
  "best-practice": {
    bg: "bg-teal/5",
    border: "border-teal/20",
    icon: CheckCircle,
    iconColor: "text-teal",
    label: "Best Practice",
    labelColor: "text-teal",
  },
  tip: {
    bg: "bg-orange/5",
    border: "border-orange/20",
    icon: Lightbulb,
    iconColor: "text-orange",
    label: "Tip",
    labelColor: "text-orange",
  },
  warning: {
    bg: "bg-coral/5",
    border: "border-coral/20",
    icon: AlertTriangle,
    iconColor: "text-coral",
    label: "Warning",
    labelColor: "text-coral",
  },
  example: {
    bg: "bg-violet/5",
    border: "border-violet/20",
    icon: AlertCircle,
    iconColor: "text-violet",
    label: "Example",
    labelColor: "text-violet",
  },
};

export default function Callout({
  variant = "insight",
  children,
}: {
  variant?: CalloutVariant;
  children: React.ReactNode;
}) {
  const v = variants[variant];
  const Icon = v.icon;

  return (
    <div className={`my-8 rounded-2xl border ${v.border} ${v.bg} p-5`}>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} className={v.iconColor} />
        <span className={`text-xs font-black uppercase tracking-wider ${v.labelColor}`}>
          {v.label}
        </span>
      </div>
      <div className="text-base font-bold leading-6 text-night/70">
        {children}
      </div>
    </div>
  );
}
