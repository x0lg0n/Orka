"use client";

import { useState, useCallback } from "react";
import { X, Upload, FileText, CheckCircle2 } from "lucide-react";

export function UploadModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState<string[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setUploaded(files.map((f) => f.name));
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Upload Files</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mt-5 flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition ${
            dragOver
              ? "border-[#7c3aed] bg-[#7c3aed]/5"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7c3aed]/10">
            <Upload className="h-6 w-6 text-[#7c3aed]" />
          </div>
          <p className="mt-3 text-sm font-medium text-gray-900">
            Drop files here
          </p>
          <p className="mt-1 text-sm text-gray-500">
            or{" "}
            <button
              type="button"
              className="text-[#7c3aed] hover:underline"
            >
              browse
            </button>
          </p>
          <p className="mt-2 text-xs text-gray-400">
            PDF, DOCX, PNG, JPG, Figma, ZIP, CSV, MP4
          </p>
        </div>

        {uploaded.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {uploaded.map((name) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-700">{name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancel Upload
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#6d28d9]"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}
