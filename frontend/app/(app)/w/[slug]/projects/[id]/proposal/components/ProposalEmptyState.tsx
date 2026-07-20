"use client";

import { FileText, Plus } from "lucide-react";
import Link from "next/link";

export function ProposalEmptyState({
  slug,
  projectId,
}: {
  slug: string;
  projectId: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-50">
        <FileText className="h-10 w-10 text-[#7c3aed]" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-gray-900">
        No proposal has been created yet
      </h3>
      <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
        Create a proposal to send to your client for this project.
      </p>
      <Link
        href={`/w/${slug}/projects/${projectId}/proposal/new`}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
      >
        <Plus className="h-4 w-4" />
        Create Proposal
      </Link>
    </div>
  );
}
