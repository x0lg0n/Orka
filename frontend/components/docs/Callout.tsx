"use client";

import { Info, Lightbulb, AlertTriangle, XCircle } from "lucide-react";

type CalloutType = "info" | "tip" | "warning" | "error";

const calloutConfig: Record<
  CalloutType,
  { icon: typeof Info; borderColor: string; bgColor: string; iconColor: string; title: string }
> = {
  info: {
    icon: Info,
    borderColor: "border-l-[#3b82f6]",
    bgColor: "bg-blue-50",
    iconColor: "text-[#3b82f6]",
    title: "Info",
  },
  tip: {
    icon: Lightbulb,
    borderColor: "border-l-[#22bd93]",
    bgColor: "bg-green-50",
    iconColor: "text-[#22bd93]",
    title: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-l-[#ff8a22]",
    bgColor: "bg-orange-50",
    iconColor: "text-[#ff8a22]",
    title: "Warning",
  },
  error: {
    icon: XCircle,
    borderColor: "border-l-[#ff4f42]",
    bgColor: "bg-red-50",
    iconColor: "text-[#ff4f42]",
    title: "Error",
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

export function Callout({ type = "info", title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`mb-6 rounded-xl border-l-4 ${config.borderColor} ${config.bgColor} p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={18} className={config.iconColor} />
        <span className={`text-sm font-black uppercase ${config.iconColor}`}>
          {title || config.title}
        </span>
      </div>
      <div className="text-sm font-bold leading-6 text-night/80">
        {children}
      </div>
    </div>
  );
}
