"use client";

import { FileText } from "lucide-react";

interface NotesCardProps {
  notes: string | null;
}

export default function NotesCard({ notes }: NotesCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7c3aed]/10">
          <FileText className="h-5 w-5 text-[#7c3aed]" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Notes</h4>
          <p className="mt-1 text-sm text-gray-600">
            {notes || "No notes added."}
          </p>
        </div>
      </div>
    </div>
  );
}
