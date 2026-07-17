"use client";

import type { ClientStatus } from "./client-types";

export function ClientFilters({
  activeTab,
  setActiveTab,
}: {
  activeTab: "all" | ClientStatus;
  setActiveTab: (t: "all" | ClientStatus) => void;
}) {
  const tabs: { key: "all" | ClientStatus; label: string }[] = [
    { key: "all", label: "All Clients" },
    { key: "active", label: "Active" },
    { key: "lead", label: "Leads" },
    { key: "inactive", label: "Inactive" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <div className="mb-4 border-b border-gray-200">
      <nav className="flex gap-1" aria-label="Client tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              activeTab === tab.key
                ? "border-[#7c3aed] text-[#7c3aed]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
