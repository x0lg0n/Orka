import Link from "next/link";
import {
  Upload,
  Download,
  FolderPlus,
  FileText,
  ExternalLink,
} from "lucide-react";

type ActivityItem = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

function activityIcon(type: string) {
  const map: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
    file_uploaded: { icon: Upload, color: "text-blue-500", bg: "bg-blue-50" },
    file_downloaded: {
      icon: Download,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    folder_created: {
      icon: FolderPlus,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
  };
  return (
    map[type] ?? {
      icon: FileText,
      color: "text-gray-500",
      bg: "bg-gray-50",
    }
  );
}

function activityLabel(type: string) {
  const map: Record<string, string> = {
    file_uploaded: "File uploaded",
    file_downloaded: "File downloaded",
    folder_created: "New folder created",
  };
  return map[type] ?? "Activity recorded";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function RecentActivity({
  activity,
  slug,
  projectId,
}: {
  activity: ActivityItem[];
  slug: string;
  projectId: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Recent Activity
        </h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/activity`}
          className="text-xs font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {activity.length === 0 ? (
        <div className="mt-4 py-4 text-center text-sm text-gray-400">
          No recent activity
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {activity.map((item) => {
            const { icon: Icon, color, bg } = activityIcon(item.type);
            const fileName =
              typeof item.payload?.name === "string"
                ? item.payload.name
                : typeof item.payload?.file_name === "string"
                  ? item.payload.file_name
                  : null;
            return (
              <div key={item.id} className="flex items-start gap-2.5">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${bg}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activityLabel(item.type)}
                  </p>
                  {fileName && (
                    <p className="truncate text-xs text-gray-400">{fileName}</p>
                  )}
                  <p className="text-[11px] text-gray-400">
                    {timeAgo(item.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
