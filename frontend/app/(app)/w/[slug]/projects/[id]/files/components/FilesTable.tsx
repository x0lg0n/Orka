import {
  FileText,
  FileImage,
  File,
  Archive,
  FileSpreadsheet,
  Film,
  Music,
  MoreHorizontal,
  Eye,
  Download,
  Pencil,
  Move,
  Link2,
  Share2,
  History,
  Trash2,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

type FileRow = {
  id: string;
  name: string;
  size: number | null;
  folder: string | null;
  mime_type: string;
  review_status: string;
  version: number;
  created_at: string;
  created_by: string | null;
  metadata?: Record<string, unknown>;
};

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
  if (["xlsx", "xls", "csv"].includes(ext))
    return {
      icon: FileSpreadsheet,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    };
  if (["mp4", "mov", "avi", "mkv"].includes(ext))
    return { icon: Film, color: "text-pink-500", bg: "bg-pink-50" };
  if (["mp3", "wav", "ogg", "flac"].includes(ext))
    return { icon: Music, color: "text-indigo-500", bg: "bg-indigo-50" };
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return { icon: FileImage, color: "text-cyan-500", bg: "bg-cyan-50" };
  return { icon: File, color: "text-gray-500", bg: "bg-gray-50" };
}

function fileTypeLabel(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    fig: "Figma",
    pdf: "PDF",
    docx: "DOCX",
    doc: "DOC",
    zip: "Archive",
    png: "PNG",
    jpg: "JPEG",
    jpeg: "JPEG",
    xlsx: "Excel",
    xls: "Excel",
    csv: "CSV",
    mp4: "Video",
    mov: "Video",
    mp3: "Audio",
    psd: "Photoshop",
    ai: "Illustrator",
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

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
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
  return formatDate(dateStr);
}

function ActionsDropdown({ onPreview }: { onPreview: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const items = [
    { label: "Preview", icon: Eye, action: () => { onPreview(); setOpen(false); } },
    { label: "Download", icon: Download },
    { label: "Rename", icon: Pencil },
    { label: "Move", icon: Move },
    { label: "Copy Link", icon: Link2 },
    { label: "Share", icon: Share2 },
    { label: "Version History", icon: History },
    { label: "Delete", icon: Trash2, danger: true },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.action ?? (() => setOpen(false))}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-600"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FileGridCard({
  file,
  onPreview,
}: {
  file: FileRow;
  onPreview: () => void;
}) {
  const { icon: Icon, color, bg } = fileIcon(file.name);

  return (
    <div className="group relative cursor-pointer rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-gray-200 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}
        >
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <ActionsDropdown onPreview={onPreview} />
      </div>
      <p className="mt-2 truncate text-sm font-medium text-gray-900">
        {file.name}
      </p>
      <p className="text-xs text-gray-400">{fileTypeLabel(file.name)}</p>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-400">
        <span>{formatSize(file.size)}</span>
        <span>&middot;</span>
        <span>{timeAgo(file.created_at)}</span>
      </div>
    </div>
  );
}

export function FilesTable({
  files,
  onPreview,
}: {
  files: FileRow[];
  onPreview: (file: FileRow) => void;
}) {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const totalPages = Math.max(1, Math.ceil(files.length / perPage));
  const paginated = files.slice((page - 1) * perPage, page * perPage);
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, files.length);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Size</th>
              <th className="px-4 py-2.5 font-medium">Uploaded By</th>
              <th className="px-4 py-2.5 font-medium">Last Updated</th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((file) => {
              const { icon: Icon, color, bg } = fileIcon(file.name);
              return (
                <tr
                  key={file.id}
                  className="group cursor-pointer border-b border-gray-50 transition hover:bg-gray-50/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}
                      >
                        <Icon className={`h-4.5 w-4.5 ${color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <span className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                          {fileTypeLabel(file.name)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {fileTypeLabel(file.name)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatSize(file.size)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-500">You</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700">
                        {formatDate(file.created_at)}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {timeAgo(file.created_at)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ActionsDropdown onPreview={() => onPreview(file)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {files.length > 0 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
          <span className="text-xs text-gray-500">
            Showing {start}–{end} of {files.length} files
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="rounded-md px-2.5 py-1 text-xs text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
              )
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      page === p
                        ? "bg-[#7c3aed] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="rounded-md px-2.5 py-1 text-xs text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
