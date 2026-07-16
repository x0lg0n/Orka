export function SummaryCard({
  createdAt,
  owner,
}: {
  createdAt: string;
  owner: string;
}) {
  const created = new Date(createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Project Summary</h3>
      <div className="mt-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Created</span>
          <span className="text-xs font-medium text-gray-700">{created}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Owner</span>
          <span className="text-xs font-medium text-gray-700">{owner}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Team Members</span>
          <div className="flex -space-x-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[9px] font-bold text-gray-500"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[9px] font-bold text-gray-400">
              +2
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Last Updated</span>
          <span className="text-xs font-medium text-gray-700">
            2 hours ago
          </span>
        </div>
      </div>
    </div>
  );
}
