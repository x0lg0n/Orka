import Link from "next/link";
import { FileImage, FileText, File, Archive } from "lucide-react";

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["fig", "sketch", "psd", "ai", "xd"].includes(ext))
    return { icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" };
  if (["pdf"].includes(ext))
    return { icon: FileText, color: "text-red-500", bg: "bg-red-50" };
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
    return { icon: Archive, color: "text-amber-500", bg: "bg-amber-50" };
  if (["doc", "docx", "txt", "md"].includes(ext))
    return { icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
  return { icon: File, color: "text-gray-500", bg: "bg-gray-50" };
}

function fileTypeLabel(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    fig: "Figma File",
    pdf: "PDF Document",
    docx: "Word Document",
    doc: "Word Document",
    zip: "ZIP Archive",
    png: "PNG Image",
    jpg: "JPEG Image",
    jpeg: "JPEG Image",
  };
  return map[ext] ?? ext.toUpperCase();
}

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectFilesCard({
  slug,
  projectId,
  files,
}: {
  slug: string;
  projectId: string;
  files: Array<{
    id: string;
    name: string;
    size: number | null;
    created_at: string;
  }>;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Project Files</h3>
        <Link
          href={`/w/${slug}/projects/${projectId}/files`}
          className="text-sm font-medium text-[#7c3aed] hover:underline"
        >
          View All
        </Link>
      </div>

      {files.length === 0 ? (
        <div className="mt-4 text-center text-sm text-gray-400">
          No files uploaded
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {files.slice(0, 4).map((file) => {
            const { icon: Icon, color, bg } = fileIcon(file.name);
            return (
              <div
                key={file.id}
                className="flex items-center gap-2.5 rounded-lg border border-gray-100 p-2.5"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {fileTypeLabel(file.name)}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{formatDate(file.created_at)}</span>
                    <span>·</span>
                    <span>{formatSize(file.size)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
