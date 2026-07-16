const TABS = ["All Projects", "In Progress", "Completed", "On Hold"] as const;
export type Tab = (typeof TABS)[number];

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
    <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => {
            setActiveTab(tab);
            setPage(1);
          }}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
            activeTab === tab
              ? "bg-[#7c3aed] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
