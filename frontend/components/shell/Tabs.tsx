import Link from "next/link";

export type TabItem = { value: string; label: string };

export function Tabs({
  basePath,
  tabs,
  active,
}: {
  basePath: string;
  tabs: TabItem[];
  active: string;
}) {
  return (
    <nav className="flex flex-wrap gap-1 border-b border-border">
      {tabs.map((tab) => {
        const isActive = active === tab.value;
        return (
          <Link
            key={tab.value}
            href={`${basePath}?tab=${tab.value}`}
            className={`px-4 py-2 text-sm font-black uppercase tracking-[0.08em] transition ${
              isActive
                ? "border-b-2 border-cyan-200 text-white"
                : "text-slate-400 hover:text-lime"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
