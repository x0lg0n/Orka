"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutList,
  LayoutGrid,
  FolderPlus,
  Upload,
  ChevronDown,
} from "lucide-react";

export function FilesToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  onUpload,
  onNewFolder,
  fileCount,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  filter: string;
  onFilterChange: (v: string) => void;
  sort: string;
  onSortChange: (v: string) => void;
  view: "list" | "grid";
  onViewChange: (v: "list" | "grid") => void;
  onUpload: () => void;
  onNewFolder: () => void;
  fileCount: number;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search files and folders..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          Type
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          Sort
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={`rounded-md p-1.5 transition ${
              view === "list"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutList className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            className={`rounded-md p-1.5 transition ${
              view === "grid"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onNewFolder}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
        >
          <FolderPlus className="h-3.5 w-3.5" />
          New Folder
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setUploadOpen(!uploadOpen)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
          >
            <Upload className="h-4 w-4" />
            Upload File
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {uploadOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUploadOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setUploadOpen(false);
                    onUpload();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
                >
                  <FolderPlus className="h-4 w-4" />
                  Upload Folder
                </button>
                <div className="border-t border-gray-100" />
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-gray-400"
                  disabled
                >
                  Import from Google Drive
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-gray-400"
                  disabled
                >
                  Import from Dropbox
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
