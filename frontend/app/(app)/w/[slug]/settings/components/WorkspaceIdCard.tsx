"use client";

import { Copy } from "lucide-react";

interface WorkspaceIdCardProps {
  workspaceId: string;
}

export default function WorkspaceIdCard({ workspaceId }: WorkspaceIdCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-900">Workspace ID</h4>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <code className="text-xs text-gray-600">{workspaceId}</code>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700">
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Use this ID for API integrations and support.
      </p>
    </div>
  );
}
