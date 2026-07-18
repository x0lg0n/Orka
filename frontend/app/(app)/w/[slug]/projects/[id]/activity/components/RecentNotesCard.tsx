import Link from "next/link";
import { StickyNote } from "lucide-react";

type Note = {
  id: string;
  title: string;
  description: string | null;
  created_by_name: string | null;
  created_at: string;
};

export function RecentNotesCard({
  notes,
  slug,
  projectId,
}: {
  notes: Note[];
  slug: string;
  projectId: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Recent Notes</h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/activity`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="mt-3 text-center text-sm text-gray-400">
          No notes yet
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="cursor-pointer rounded-lg border border-gray-100 p-2.5 transition hover:border-gray-200 hover:shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-yellow-50">
                  <StickyNote className="h-3.5 w-3.5 text-yellow-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {note.title}
                  </p>
                  {note.description && (
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {note.description}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                    {note.created_by_name && <span>by {note.created_by_name}</span>}
                    <span>
                      {new Date(note.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
