import {
  Home,
  Clock,
  FileText,
  FileSignature,
  Lock,
  Flag,
  CreditCard,
  Folder,
  Activity,
} from "lucide-react";

export const PROJECT_TABS = [
  { label: "Overview", href: "overview", icon: Home },
  { label: "Timeline", href: "timeline", icon: Clock },
  { label: "Proposals", href: "proposal", icon: FileText },
  { label: "Contracts", href: "contract", icon: FileSignature },
  { label: "Milestones", href: "milestones", icon: Flag },
  { label: "Escrow", href: "escrow", icon: Lock },
  { label: "Payments", href: "payments", icon: CreditCard },
  { label: "Files", href: "files", icon: Folder },
  { label: "Activity", href: "activity", icon: Activity },
] as const;

export type ProjectTabHref = (typeof PROJECT_TABS)[number]["href"];
