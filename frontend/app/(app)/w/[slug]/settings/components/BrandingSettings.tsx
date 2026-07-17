"use client";

import { Upload } from "lucide-react";

export default function BrandingSettings() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Branding Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Customize how your brand appears in proposals, invoices and client portal.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Primary Color</label>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200">
                  <div className="h-6 w-6 rounded" style={{ backgroundColor: "#6366F1" }} />
                </div>
                <input
                  type="text"
                  defaultValue="#6366F1"
                  className="block h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Secondary Color</label>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200">
                  <div className="h-6 w-6 rounded" style={{ backgroundColor: "#0F172A" }} />
                </div>
                <input
                  type="text"
                  defaultValue="#0F172A"
                  className="block h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Logo for Documents</label>
            <div className="mt-2 flex items-center gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                Upload logo
              </button>
              <span className="text-xs text-gray-400">
                This logo will appear on proposals, invoices and contracts.
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Preview</label>
          <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7c3aed]/10">
                <span className="text-xl font-bold text-[#7c3aed]">A</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Acme Studio</p>
                <p className="text-xs text-gray-500">We build digital experiences that drive results.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
