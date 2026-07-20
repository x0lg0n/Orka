import {
  Flag,
  DollarSign,
  FileText,
  FileSignature,
  Lock,
  Upload,
  MessageSquare,
  StickyNote,
  Sparkles,
  User,
  Bot,
} from "lucide-react";
import type { ActivityItem } from "./types";

function ActivityIcon({ category }: { category: string }) {
  const iconClass = "h-4 w-4";
  switch (category) {
    case "milestone":
      return <Flag className={`${iconClass} text-emerald-500`} />;
    case "payment":
      return <DollarSign className={`${iconClass} text-[#7c3aed]`} />;
    case "proposal":
      return <FileText className={`${iconClass} text-blue-500`} />;
    case "contract":
      return <FileSignature className={`${iconClass} text-indigo-500`} />;
    case "escrow":
      return <Lock className={`${iconClass} text-amber-500`} />;
    case "file":
      return <Upload className={`${iconClass} text-cyan-500`} />;
    case "comment":
      return <MessageSquare className={`${iconClass} text-gray-500`} />;
    case "note":
      return <StickyNote className={`${iconClass} text-yellow-500`} />;
    case "ai":
      return <Sparkles className={`${iconClass} text-[#7c3aed]`} />;
    case "client":
      return <User className={`${iconClass} text-blue-500`} />;
    case "system":
      return <Bot className={`${iconClass} text-gray-400`} />;
    default:
      return <Bot className={`${iconClass} text-gray-400`} />;
  }
}

function BadgeStyle({ category }: { category: string }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  switch (category) {
    case "milestone":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-600`}>Milestones</span>
      );
    case "payment":
      return (
        <span className={`${base} bg-[#7c3aed]/10 text-[#7c3aed]`}>Payments</span>
      );
    case "proposal":
      return (
        <span className={`${base} bg-blue-50 text-blue-600`}>Proposal</span>
      );
    case "contract":
      return (
        <span className={`${base} bg-indigo-50 text-indigo-600`}>Contracts</span>
      );
    case "escrow":
      return (
        <span className={`${base} bg-amber-50 text-amber-600`}>Escrow</span>
      );
    case "file":
      return (
        <span className={`${base} bg-cyan-50 text-cyan-600`}>Files</span>
      );
    case "comment":
      return (
        <span className={`${base} bg-gray-100 text-gray-600`}>Comments</span>
      );
    case "note":
      return (
        <span className={`${base} bg-yellow-50 text-yellow-600`}>Notes</span>
      );
    case "ai":
      return (
        <span className={`${base} bg-[#7c3aed]/10 text-[#7c3aed]`}>AI</span>
      );
    case "client":
      return (
        <span className={`${base} bg-blue-50 text-blue-600`}>Client</span>
      );
    case "system":
      return (
        <span className={`${base} bg-gray-100 text-gray-500`}>System</span>
      );
    default:
      return (
        <span className={`${base} bg-gray-100 text-gray-500`}>{category}</span>
      );
  }
}

export function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <div className="group rounded-xl border border-gray-100 p-3 transition hover:border-gray-200 hover:shadow-sm">
      <div className="flex items-start gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50">
          <ActivityIcon category={item.category} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {item.title}
              </p>
              <p className="mt-0.5 text-sm text-gray-500">
                {item.description}
              </p>
              {item.createdByName && (
                <p className="mt-1 text-xs text-gray-400">
                  by {item.createdByName}
                </p>
              )}
            </div>
            <BadgeStyle category={item.category} />
          </div>
          <div className="mt-1.5 text-xs text-gray-400">{item.time}</div>
        </div>
      </div>
    </div>
  );
}
