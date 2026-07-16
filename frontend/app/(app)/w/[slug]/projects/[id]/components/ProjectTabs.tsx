"use client";

import Link from "next/link";
import {
  Clock,
  FileText,
  FileSignature,
  Lock,
  Milestone,
  CircleDollarSign,
  Folder,
  Activity,
} from "lucide-react";

const TABS = [
  { value: "timeline", label: "Timeline", icon: Clock },
  { value: "proposal", label: "Proposal", icon: FileText },
  { value: "contract", label: "Contract", icon: FileSignature },
  { value: "escrow", label: "Escrow", icon: Lock },
  { value: "milestones", label: "Milestones", icon: Milestone },
  { value: "payments", label: "Payments", icon: CircleDollarSign },
  { value: "files", label: "Files", icon: Folder },
  { value: "activity", label: "Activity", icon: Activity },
];

export function ProjectTabs({
  slug,
  projectId,
  active,
}: {
  slug: string;
  projectId: string;
  active: string;
}) {
  return (
    <div className="mt-6 border-b border-gray-200">
      <nav className="flex gap-1 overflow-x-auto" aria-label="Project tabs">
        {TABS.map((tab) => {
          const isActive = active === tab.value;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.value}
              href={`/w/${slug}/projects/${projectId}?tab=${tab.value}`}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "border-[#7c3aed] text-[#7c3aed]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
