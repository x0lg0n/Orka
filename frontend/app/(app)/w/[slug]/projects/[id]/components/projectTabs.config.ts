import {
  Home,
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
  { label: "Proposal", href: "proposal", icon: FileText },
  { label: "Contract", href: "contract", icon: FileSignature },
  { label: "Escrow", href: "escrow", icon: Lock },
  { label: "Milestones", href: "milestones", icon: Flag },
  { label: "Payments", href: "payments", icon: CreditCard },
  { label: "Files", href: "files", icon: Folder },
  { label: "Activity", href: "activity", icon: Activity },
] as const;

export type ProjectTabHref = (typeof PROJECT_TABS)[number]["href"];
