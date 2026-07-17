export default function ProjectLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="h-4 w-24 rounded bg-gray-200" />
      <div className="mt-4 flex items-center gap-3">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-6 w-16 rounded-full bg-gray-100" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100" />
              <div className="h-3 w-16 rounded bg-gray-100" />
            </div>
            <div className="mt-3 h-6 w-20 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="mt-6 h-12 rounded-xl border border-gray-200 bg-white" />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-96 rounded-xl border border-gray-200 bg-white" />
        <div className="h-96 rounded-xl border border-gray-200 bg-white" />
        <div className="flex flex-col gap-5">
          <div className="h-32 rounded-xl border border-gray-200 bg-white" />
          <div className="h-40 rounded-xl border border-gray-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
