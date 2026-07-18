import type { ProjectStatus } from "@/lib/orka";

export const TABS: { label: string; status: ProjectStatus | "all" }[] = [
  { label: "All Projects", status: "all" },
  { label: "In Progress", status: "active" },
  { label: "Draft", status: "draft" },
  { label: "Completed", status: "completed" },
  { label: "Archived", status: "archived" },
];

export type Tab = (typeof TABS)[number]["status"];

export function ProjectsTabs({
  activeTab,
  setActiveTab,
  setPage,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  setPage: (n: number) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1">
      {TABS.map((tab) => (
        <button
          key={tab.status}
          type="button"
          onClick={() => {
            setActiveTab(tab.status);
            setPage(1);
          }}
          className={`whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition ${
            activeTab === tab.status
              ? "bg-[#7c3aed] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
