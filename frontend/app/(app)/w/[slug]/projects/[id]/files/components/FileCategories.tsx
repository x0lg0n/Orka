import {
  FileText,
  FileImage,
  FileSpreadsheet,
  Archive,
  File,
} from "lucide-react";

type FileRow = {
  id: string;
  name: string;
};

function getFileCategory(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return "documents";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "fig", "psd", "ai"].includes(ext))
    return "images";
  if (["xlsx", "xls", "csv"].includes(ext)) return "spreadsheets";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archives";
  return "other";
}

const CATEGORIES = [
  { key: "all", label: "All Files", icon: File, color: "text-gray-500", bg: "bg-gray-50" },
  { key: "documents", label: "Documents", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
  { key: "images", label: "Images", icon: FileImage, color: "text-purple-500", bg: "bg-purple-50" },
  { key: "spreadsheets", label: "Spreadsheets", icon: FileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-50" },
  { key: "archives", label: "Archives", icon: Archive, color: "text-amber-500", bg: "bg-amber-50" },
  { key: "other", label: "Other", icon: File, color: "text-gray-400", bg: "bg-gray-50" },
];

export function FileCategories({ files }: { files: FileRow[] }) {
  const counts: Record<string, number> = { all: files.length };
  for (const f of files) {
    const cat = getFileCategory(f.name);
    counts[cat] = (counts[cat] ?? 0) + 1;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">File Categories</h3>
      <div className="mt-3 flex flex-col gap-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg ${cat.bg}`}
              >
                <cat.icon className={`h-3.5 w-3.5 ${cat.color}`} />
              </div>
              <span>{cat.label}</span>
            </div>
            <span className="text-xs text-gray-400">{counts[cat.key] ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
