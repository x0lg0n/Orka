"use client";

import { Trash2 } from "lucide-react";

export default function DangerZoneCard() {
  return (
    <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-rose-600">Danger Zone</h4>
      <p className="mt-1 text-xs text-gray-500">Once you do this, there is no going back.</p>
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50">
        <Trash2 className="h-4 w-4" />
        Delete Workspace
      </button>
    </div>
  );
}
