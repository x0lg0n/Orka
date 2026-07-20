"use client";

import { StickyNote, Plus } from "lucide-react";
import type { ProposalNote } from "./types";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function ProposalNotesCard({ notes }: { notes: ProposalNote[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold text-gray-900">
        Proposal Notes
      </h3>
      {notes.length > 0 ? (
        <div className="space-y-3 mb-4">
          {notes.slice(0, 5).map((note) => (
            <div
              key={note.id}
              className="rounded-lg bg-gray-50 p-3"
            >
              <p className="text-sm text-gray-600">{note.content}</p>
              <div className="mt-1 text-xs text-gray-400">
                {formatRelativeTime(note.created_at)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-4">
          <div className="flex flex-col items-center py-4 text-center">
            <StickyNote className="h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-400">No notes added yet.</p>
          </div>
        </div>
      )}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" />
        Add Note
      </button>
    </div>
  );
}
