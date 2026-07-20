"use client";

import { useState } from "react";
import { X, FolderPlus } from "lucide-react";

const COLORS = [
  { name: "Blue", value: "bg-blue-50 text-blue-600" },
  { name: "Purple", value: "bg-purple-50 text-purple-600" },
  { name: "Green", value: "bg-emerald-50 text-emerald-600" },
  { name: "Amber", value: "bg-amber-50 text-amber-600" },
  { name: "Pink", value: "bg-pink-50 text-pink-600" },
  { name: "Gray", value: "bg-gray-100 text-gray-600" },
];

export function AddFolderModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[1].value);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Folder
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Assets"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Folder Color
            </label>
            <div className="mt-2 flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                    color === c.value
                      ? "ring-2 ring-[#7c3aed] ring-offset-2"
                      : ""
                  } ${c.value}`}
                >
                  <FolderPlus className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
