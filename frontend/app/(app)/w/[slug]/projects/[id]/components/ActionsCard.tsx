import Link from "next/link";
import {
  Pencil,
  Users,
  RefreshCw,
  Copy,
  Archive,
} from "lucide-react";

const ACTIONS = [
  { label: "Edit Project", icon: Pencil, href: "edit" },
  { label: "Manage Members", icon: Users, href: "members" },
  { label: "Change Status", icon: RefreshCw, href: "status" },
  { label: "Duplicate Project", icon: Copy, href: "duplicate" },
  { label: "Archive Project", icon: Archive, href: "archive" },
];

export function ActionsCard({
  slug,
  projectId,
}: {
  slug: string;
  projectId: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Project Actions</h3>
      <div className="mt-3 flex flex-col gap-1">
        {ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={`/w/${slug}/projects/${projectId}/${action.href}`}
            className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <action.icon className="h-4 w-4 text-gray-400" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
