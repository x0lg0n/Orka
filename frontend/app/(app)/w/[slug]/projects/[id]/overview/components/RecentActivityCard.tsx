import Link from "next/link";
import {
  CheckCircle,
  ArrowUpCircle,
  FileText,
  FileSignature,
  Upload,
  MessageSquare,
} from "lucide-react";

function activityIcon(type: string) {
  switch (type) {
    case "milestone_completed":
      return {
        icon: CheckCircle,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
      };
    case "payment_released":
      return {
        icon: ArrowUpCircle,
        color: "text-blue-500",
        bg: "bg-blue-50",
      };
    case "proposal_accepted":
      return {
        icon: FileText,
        color: "text-purple-500",
        bg: "bg-purple-50",
      };
    case "contract_signed":
      return {
        icon: FileSignature,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
      };
    case "files_uploaded":
      return {
        icon: Upload,
        color: "text-amber-500",
        bg: "bg-amber-50",
      };
    case "client_commented":
      return {
        icon: MessageSquare,
        color: "text-pink-500",
        bg: "bg-pink-50",
      };
    default:
      return {
        icon: CheckCircle,
        color: "text-gray-400",
        bg: "bg-gray-50",
      };
  }
}

function activityTitle(type: string, payload: Record<string, unknown>) {
  switch (type) {
    case "milestone_completed":
      return `Milestone ${payload.milestone_title ?? ""} completed`;
    case "payment_released":
      return `Payment released`;
    case "proposal_accepted":
      return "Proposal accepted";
    case "contract_signed":
      return "Contract signed by both parties";
    case "files_uploaded":
      return `Client uploaded ${payload.file_count ?? ""} files`;
    case "client_commented":
      return "Client commented";
    default:
      return type.replace(/_/g, " ");
  }
}

function formatTimestamp(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecentActivityCard({
  slug,
  projectId,
  activity,
}: {
  slug: string;
  projectId: string;
  activity: Array<{
    id: string;
    type: string;
    payload: Record<string, unknown>;
    created_at: string;
    actor_id: string | null;
  }>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/activity`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {activity.length === 0 ? (
        <div className="mt-4 text-center text-sm text-gray-400">
          No recent activity
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {activity.slice(0, 5).map((item) => {
            const { icon: Icon, color, bg } = activityIcon(item.type);
            return (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${bg}`}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {activityTitle(item.type, item.payload)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimestamp(item.created_at)}
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
