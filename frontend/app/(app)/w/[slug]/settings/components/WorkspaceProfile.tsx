"use client";

import { Upload, Check } from "lucide-react";

interface WorkspaceProfileProps {
  workspace: {
    name: string;
    slug: string;
    logo_url?: string | null;
  };
}

export default function WorkspaceProfile({ workspace }: WorkspaceProfileProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Workspace Profile</h3>
          <p className="mt-1 text-sm text-gray-500">
            Update your workspace information and branding.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Check className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Workspace Logo</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#7c3aed]/10">
              <span className="text-2xl font-bold text-[#7c3aed]">
                {workspace.name.charAt(0)}
              </span>
            </div>
            <div>
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Upload className="h-4 w-4" />
                Upload New
              </button>
              <p className="mt-1 text-xs text-gray-400">PNG, JPG or SVG. Max size 2MB.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Workspace Name</label>
          <input
            type="text"
            defaultValue={workspace.name}
            className="mt-2 block h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Tagline <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="We build digital experiences that drive results."
            className="mt-2 block h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Workspace Website <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="url"
            placeholder="https://acmestudio.com"
            className="mt-2 block h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Default Currency</label>
            <select className="mt-2 block h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]">
              <option>XLM (Stellar Lumens)</option>
              <option>USD (US Dollar)</option>
              <option>EUR (Euro)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Time Zone</label>
            <select className="mt-2 block h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-900 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]">
              <option>(GMT +05:30) Asia/Kolkata</option>
              <option>(GMT +00:00) UTC</option>
              <option>(GMT -05:00) America/New_York</option>
              <option>(GMT -08:00) America/Los_Angeles</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Workspace Description</label>
          <textarea
            rows={4}
            placeholder="Tell us about your workspace..."
            className="mt-2 block w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-1 focus:ring-[#7c3aed]"
          />
        </div>

        <div className="flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Check className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
