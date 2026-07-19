import {
  Folder,
  FileText,
  FileSignature,
  FileImage,
  FileSpreadsheet,
  Archive,
  MoreHorizontal,
} from "lucide-react";

type FolderItem = {
  id: string;
  name: string;
  fileCount: number;
  lastUpdated: string;
  color: string;
};

const DEFAULT_FOLDERS: FolderItem[] = [
  {
    id: "contracts",
    name: "Contracts",
    fileCount: 12,
    lastUpdated: "2 days ago",
    color: "bg-blue-50 text-blue-600",
  },
  {
    id: "proposals",
    name: "Proposals",
    fileCount: 8,
    lastUpdated: "5 days ago",
    color: "bg-purple-50 text-purple-600",
  },
  {
    id: "designs",
    name: "Designs",
    fileCount: 24,
    lastUpdated: "1 day ago",
    color: "bg-pink-50 text-pink-600",
  },
  {
    id: "deliverables",
    name: "Deliverables",
    fileCount: 15,
    lastUpdated: "3 days ago",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "invoices",
    name: "Invoices",
    fileCount: 6,
    lastUpdated: "1 week ago",
    color: "bg-amber-50 text-amber-600",
  },
];

function FolderIcon({ className }: { className?: string }) {
  return <Folder className={className} />;
}

export function FolderGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {DEFAULT_FOLDERS.map((folder) => (
        <div
          key={folder.id}
          className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-[#7c3aed]/30 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${folder.color}`}
            >
              <FolderIcon className="h-5 w-5" />
            </div>
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">
            {folder.name}
          </p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
            <span>{folder.fileCount} files</span>
            <span>&middot;</span>
            <span>{folder.lastUpdated}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
