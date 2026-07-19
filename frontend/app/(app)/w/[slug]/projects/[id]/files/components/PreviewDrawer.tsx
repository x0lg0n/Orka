"use client";

import {
  X,
  Download,
  Share2,
  History,
  FileText,
  FileImage,
  File,
  Calendar,
  User,
  HardDrive,
  Clock,
} from "lucide-react";

type FileRow = {
  id: string;
  name: string;
  size: number | null;
  created_at: string;
  review_status: string;
};

function fileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["fig", "sketch", "psd", "ai", "xd"].includes(ext))
    return { icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" };
  if (["pdf"].includes(ext))
    return { icon: FileText, color: "text-red-500", bg: "bg-red-50" };
  return { icon: File, color: "text-gray-500", bg: "bg-gray-50" };
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

export function PreviewDrawer({
  file,
  onClose,
}: {
  file: FileRow | null;
  onClose: () => void;
}) {
  if (!file) return null;

  const { icon: Icon, color, bg } = fileIcon(file.name);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-gray-900">File Preview</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col items-center justify-center bg-gray-50 py-16">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-2xl ${bg}`}
            >
              <Icon className={`h-10 w-10 ${color}`} />
            </div>
            <p className="mt-4 max-w-xs truncate px-4 text-center text-sm font-medium text-gray-900">
              {file.name}
            </p>
          </div>

          <div className="flex flex-col gap-4 px-5 py-4">
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Owner</span>
              <span className="ml-auto font-medium text-gray-900">You</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <History className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Version</span>
              <span className="ml-auto font-medium text-gray-900">1</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <HardDrive className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Size</span>
              <span className="ml-auto font-medium text-gray-900">
                {formatSize(file.size)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Created</span>
              <span className="ml-auto text-gray-700">
                {formatDate(file.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Updated</span>
              <span className="ml-auto text-gray-700">
                {formatDate(file.created_at)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-gray-100 px-5 py-3">
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <History className="h-4 w-4" />
            Versions
          </button>
        </div>
      </div>
    </>
  );
}
