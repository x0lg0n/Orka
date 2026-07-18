type Contributor = {
  name: string;
  count: number;
};

export function TopContributorsCard({
  contributors,
}: {
  contributors: Contributor[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Top Contributors</h3>

      {contributors.length === 0 ? (
        <div className="mt-3 text-center text-sm text-gray-400">
          No contributors yet
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {contributors.map((c, i) => (
            <div
              key={`${c.name}-${i}`}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7c3aed]/10 text-xs font-semibold text-[#7c3aed]">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {c.name}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {c.count} {c.count === 1 ? "activity" : "activities"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
