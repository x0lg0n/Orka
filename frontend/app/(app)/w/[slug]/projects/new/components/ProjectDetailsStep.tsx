import type { ProjectFormData } from "../page";

function OptionCard({
  icon,
  label,
  description,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#7c3aed] bg-[#7c3aed]/5"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="mt-0.5 text-xs text-gray-500">{description}</p>
      </div>
      {selected && (
        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#7c3aed]">
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}

export function ProjectDetailsStep({
  formData,
  updateField,
}: {
  formData: ProjectFormData;
  updateField: (field: keyof ProjectFormData, value: string) => void;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        1. Project Details
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Tell us about your project
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Nike Website Redesign"
            className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
          />
        </div>

        {/* Client */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Client <span className="text-red-500">*</span>
          </label>
          <div className="mt-1.5 flex gap-2">
            <select
              value={formData.client}
              onChange={(e) => updateField("client", e.target.value)}
              className="h-10 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
            >
              <option value="">Select client</option>
              <option value="Nike Inc.">Nike Inc.</option>
              <option value="Acme Corp">Acme Corp</option>
              <option value="TechStart Inc.">TechStart Inc.</option>
              <option value="DesignHub">DesignHub</option>
              <option value="GrowthLabs">GrowthLabs</option>
            </select>
            <button
              type="button"
              className="flex h-10 items-center gap-1 whitespace-nowrap rounded-lg border border-[#7c3aed] px-3 text-sm font-medium text-[#7c3aed] transition hover:bg-[#7c3aed]/5"
            >
              + Add New Client
            </button>
          </div>
        </div>

        {/* Project Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
          >
            <option value="">Select category</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile Development">Mobile Development</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Branding">Branding</option>
            <option value="Marketing">Marketing</option>
            <option value="Data Analytics">Data Analytics</option>
          </select>
        </div>

        {/* Estimated Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estimated Timeline <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.timeline}
            onChange={(e) => updateField("timeline", e.target.value)}
            placeholder="Jul 15, 2025 – Aug 30, 2025"
            className="mt-1.5 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
          />
        </div>
      </div>

      {/* Project Description */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-gray-700">
          Project Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Describe your project..."
          rows={4}
          maxLength={1000}
          className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
        />
        <p className="mt-1 text-right text-xs text-gray-400">
          {formData.description.length}/1000
        </p>
      </div>

      {/* Engagement Type */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">
          Engagement Type
        </label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <OptionCard
            icon="💰"
            label="Fixed Price"
            description="Set budget with milestones"
            selected={formData.engagementType === "fixed"}
            onClick={() => updateField("engagementType", "fixed")}
          />
          <OptionCard
            icon="⏱️"
            label="Hourly"
            description="Pay for time and materials"
            selected={formData.engagementType === "hourly"}
            onClick={() => updateField("engagementType", "hourly")}
          />
          <OptionCard
            icon="📅"
            label="Retainer"
            description="Ongoing monthly work"
            selected={formData.engagementType === "retainer"}
            onClick={() => updateField("engagementType", "retainer")}
          />
        </div>
      </div>

      {/* Project Visibility */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">
          Project Visibility
        </label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <OptionCard
            icon="🔒"
            label="Private"
            description="Only invited team members and client can view"
            selected={formData.visibility === "private"}
            onClick={() => updateField("visibility", "private")}
          />
          <OptionCard
            icon="🌐"
            label="Public (Client Portal)"
            description="Share via secure client portal link"
            selected={formData.visibility === "public"}
            onClick={() => updateField("visibility", "public")}
          />
        </div>
      </div>
    </div>
  );
}
