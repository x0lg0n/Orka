export default function NewProjectLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-48 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-80 rounded bg-gray-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded-lg bg-gray-100" />
          <div className="h-9 w-9 rounded-lg bg-gray-100" />
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-100" />
            <div className="h-4 w-24 rounded bg-gray-100" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="h-6 w-32 rounded bg-gray-100" />
          <div className="mt-6 grid grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 w-20 rounded bg-gray-100" />
                <div className="mt-1.5 h-10 w-full rounded-lg bg-gray-50" />
              </div>
            ))}
          </div>
          <div className="mt-5">
            <div className="h-4 w-28 rounded bg-gray-100" />
            <div className="mt-1.5 h-24 w-full rounded-lg bg-gray-50" />
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="h-48 rounded-xl border border-gray-200 bg-white" />
          <div className="h-48 rounded-xl border border-gray-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
