import { FolderOpen, Upload } from "lucide-react";

export function FilesEmptyState({
  onUpload,
}: {
  onUpload: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7c3aed]/10">
        <FolderOpen className="h-8 w-8 text-[#7c3aed]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        No files uploaded yet
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Upload documents, designs, contracts and deliverables to keep everything
        organized in one place.
      </p>
      <button
        type="button"
        onClick={onUpload}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
      >
        <Upload className="h-4 w-4" />
        Upload First File
      </button>
    </div>
  );
}
