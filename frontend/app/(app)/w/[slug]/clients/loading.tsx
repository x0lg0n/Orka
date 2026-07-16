export default function ClientsLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-24 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-64 rounded bg-gray-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-56 rounded-lg bg-gray-100" />
          <div className="h-9 w-28 rounded-lg bg-gray-100" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100" />
              <div className="h-3 w-20 rounded bg-gray-100" />
            </div>
            <div className="mt-3 h-7 w-12 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="h-96 rounded-xl border border-gray-200 bg-white" />
        <div className="flex flex-col gap-5">
          <div className="h-48 rounded-xl border border-gray-200 bg-white" />
          <div className="h-40 rounded-xl border border-gray-200 bg-white" />
          <div className="h-48 rounded-xl border border-gray-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
