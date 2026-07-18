import { Globe, Building2, Calendar, DollarSign, Lock } from "lucide-react";
import type { ProjectFormData } from "./NewProjectForm";

export function PreviewCard({ formData }: { formData: ProjectFormData }) {
  const hasData =
    formData.name.trim() ||
    formData.client.trim() ||
    formData.category.trim() ||
    formData.timeline.trim() ||
    formData.description.trim();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Project Preview</h3>

      {!hasData ? (
        <p className="mt-4 text-center text-xs text-gray-400">
          Start filling in the form to see a live preview
        </p>
      ) : (
        <div className="mt-4">
          {/* Project Icon & Name */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50">
              <Globe className="h-5 w-5 text-[#7c3aed]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {formData.name || "Untitled Project"}
              </p>
              {formData.category && (
                <span className="mt-0.5 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600">
                  {formData.category}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="mt-4 flex flex-col gap-3">
            {formData.client && (
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">{formData.client}</span>
              </div>
            )}
            {formData.timeline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">
                  {formData.timeline}
                </span>
              </div>
            )}
            {formData.category && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-600">{formData.category}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">Private</span>
            </div>
          </div>

          {formData.description && (
            <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500 line-clamp-3">
              {formData.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
