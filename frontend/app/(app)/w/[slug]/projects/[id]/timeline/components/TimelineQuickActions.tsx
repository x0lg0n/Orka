import Link from "next/link";
import {
  Flag,
  Upload,
  StickyNote,
  Send,
  ChevronRight,
} from "lucide-react";

const ACTIONS = [
  { label: "Create Milestone", icon: Flag, href: "milestones" },
  { label: "Upload File", icon: Upload, href: "files" },
  { label: "Add Note", icon: StickyNote, href: "activity" },
  { label: "Send Update to Client", icon: Send, href: "activity" },
];

export function TimelineQuickActions({
  slug,
  projectId,
}: {
  slug: string;
  projectId: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
      <div className="mt-2 flex flex-col gap-0.5">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={`/w/${slug}/projects/${projectId}/${action.href}`}
            className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <action.icon className="h-4 w-4 text-gray-400" />
            <span className="flex-1">{action.label}</span>
            <ChevronRight className="h-4 w-4 text-gray-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
