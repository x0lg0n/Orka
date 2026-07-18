export default function ProjectsLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-8 w-32 rounded-lg bg-gray-200" />
      <div className="mt-2 h-4 w-64 rounded bg-gray-100" />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100" />
              <div className="h-3 w-20 rounded bg-gray-100" />
            </div>
            <div className="mt-3 h-7 w-16 rounded bg-gray-100" />
            <div className="mt-2 h-3 w-24 rounded bg-gray-50" />
          </div>
        ))}
      </div>

      <div className="mt-6 h-10 w-full rounded-xl border border-gray-200 bg-white" />

      <div className="mt-6 h-64 rounded-xl border border-gray-200 bg-white" />
    </div>
  );
}
