"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Save, Plus } from "lucide-react";
import { createProject } from "@/app/actions";
import { AICopilotCard } from "./AICopilotCard";
import { PreviewCard } from "./PreviewCard";

export interface ProjectFormData {
  name: string;
  client: string;
  clientId: string;
  category: string;
  timeline: string;
  description: string;
}

export interface ClientOption {
  id: string;
  name: string;
  email: string | null;
}

export function NewProjectForm({
  slug,
  clients,
}: {
  slug: string;
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: "",
    client: "",
    clientId: "",
    category: "",
    timeline: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submit = async (mode: "draft" | "project") => {
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.append("slug", slug);
    fd.append("title", formData.name);
    fd.append("description", formData.description);
    fd.append("clientId", formData.clientId);
    fd.append("clientName", formData.client);
    fd.append("category", formData.category);
    fd.append("timeline", formData.timeline);
    fd.append("mode", mode);

    try {
      await createProject(fd);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("error=")) {
        setError(decodeURIComponent(msg.split("error=")[1]));
        setSubmitting(false);
        return;
      }
      router.push(`/w/${slug}/projects`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          <p className="mt-1 text-sm text-gray-500">
            Start a new project and streamline your client collaboration from
            proposal to payment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => submit("draft")}
            disabled={submitting}
            title="Save Draft"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
          </button>
          <Link
            href={`/w/${slug}/projects`}
            title="Cancel"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Project name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="e.g. Brand Identity Refresh"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Client
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => {
                  const id = e.target.value;
                  const c = clients.find((x) => x.id === id);
                  updateField("clientId", id);
                  updateField("client", c?.name ?? "");
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-gray-400">
                Client not listed? Add one on the{" "}
                <Link
                  href={`/w/${slug}/clients`}
                  className="font-medium text-[#7c3aed] hover:underline"
                >
                  Clients page
                </Link>
                .
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Project category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => updateField("category", e.target.value)}
                placeholder="e.g. Design, Development, Marketing"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Estimated timeline
              </label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => updateField("timeline", e.target.value)}
                placeholder="e.g. 4 weeks, 2 months"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Project description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                placeholder="What is this project about?"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20"
              />
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            <Link
              href={`/w/${slug}/projects`}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              Cancel
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => submit("draft")}
                disabled={submitting || !formData.name.trim()}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => submit("project")}
                disabled={submitting || !formData.name.trim() || !formData.clientId}
                className="flex items-center gap-2 rounded-lg bg-[#7c3aed] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save Project →
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-5">
          <AICopilotCard formData={formData} />
          <PreviewCard formData={formData} />
        </div>
      </div>
    </div>
  );
}
