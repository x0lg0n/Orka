"use client";

import { useState } from "react";
import { Upload, FolderPlus, LayoutGrid, List } from "lucide-react";
import { FilesToolbar } from "./FilesToolbar";
import { FolderGrid } from "./FolderGrid";
import { FilesTable } from "./FilesTable";
import { StorageOverview } from "./StorageOverview";
import { RecentActivity } from "./RecentActivity";
import { FileCategories } from "./FileCategories";
import { UploadModal } from "./UploadModal";
import { AddFolderModal } from "./AddFolderModal";
import { FilesEmptyState } from "./FilesEmptyState";
import { PreviewDrawer } from "./PreviewDrawer";

type Project = {
  id: string;
  name: string;
  status: string;
};

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
};

type Activity = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
  actor_id: string | null;
};

type Uploader = {
  full_name: string | null;
  avatar_url: string | null;
} | null;

export function ProjectFilesView({
  slug,
  projectId,
  project,
  files,
  recentActivity,
  uploader,
}: {
  slug: string;
  projectId: string;
  project: Project;
  files: FileRow[];
  recentActivity: Activity[];
  uploader: Uploader;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileRow | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const filteredFiles = files.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (filter === "documents" && !f.mime_type.includes("pdf") && !f.mime_type.includes("document"))
      return false;
    if (filter === "images" && !f.mime_type.includes("image"))
      return false;
    if (filter === "other" && (f.mime_type.includes("pdf") || f.mime_type.includes("document") || f.mime_type.includes("image")))
      return false;
    return true;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "size") return (b.size ?? 0) - (a.size ?? 0);
    return 0;
  });

  return (
    <div className="flex h-full flex-col gap-0 lg:flex-row">
      <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-4 pb-4 lg:px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Files</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddFolder(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <FolderPlus className="h-4 w-4" />
              Add Folder
            </button>
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
          </div>
        </div>

        <FilesToolbar
          search={search}
          onSearchChange={setSearch}
          filter={filter}
          onFilterChange={setFilter}
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
          onUpload={() => setShowUpload(true)}
          onNewFolder={() => setShowAddFolder(true)}
          fileCount={filteredFiles.length}
        />

        <div className="mt-4">
          <FolderGrid />
        </div>

        <div className="mt-4">
          {files.length === 0 ? (
            <FilesEmptyState onUpload={() => setShowUpload(true)} />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setPreviewFile(file)}
                  className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-center transition hover:border-[#7c3aed]/30 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                    <span className="text-lg font-bold text-gray-400">
                      {file.name.split(".").pop()?.toUpperCase().slice(0, 3)}
                    </span>
                  </div>
                  <p className="mt-2 w-full truncate text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {file.size
                      ? file.size < 1024
                        ? `${file.size} B`
                        : file.size < 1024 * 1024
                          ? `${(file.size / 1024).toFixed(1)} KB`
                          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                      : "—"}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <FilesTable
              files={sortedFiles}
              onPreview={(file) => setPreviewFile(file)}
            />
          )}
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-4 border-t border-gray-100 px-4 py-4 lg:w-72 lg:border-l lg:border-t-0 lg:px-0 lg:pl-4 lg:pr-4 lg:pt-4">
        <StorageOverview />
        <RecentActivity activity={recentActivity} slug={slug} projectId={projectId} />
        <FileCategories files={files} />
      </div>

      <UploadModal open={showUpload} onClose={() => setShowUpload(false)} />
      <AddFolderModal open={showAddFolder} onClose={() => setShowAddFolder(false)} />
      <PreviewDrawer file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}
