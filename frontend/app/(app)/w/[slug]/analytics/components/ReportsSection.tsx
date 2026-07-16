"use client";

import { FileText, Download } from "lucide-react";
import { reports } from "./mockData";

export default function ReportsSection() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Download Reports
      </h3>
      <div className="space-y-3">
        {reports.map((report) => (
          <div
            key={report.title}
            className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{report.title}</p>
                <p className="text-xs text-gray-500">{report.type}</p>
              </div>
            </div>
            <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <button className="text-sm font-medium text-[#7c3aed] hover:text-[#6d28d9]">
          View all reports →
        </button>
      </div>
    </div>
  );
}
