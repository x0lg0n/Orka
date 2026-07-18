export function ActivitySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-4 w-56 rounded bg-gray-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-48 rounded-lg bg-gray-200" />
          <div className="h-9 w-24 rounded-lg bg-gray-200" />
          <div className="h-9 w-28 rounded-lg bg-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-5 w-5 rounded-full bg-gray-200" />
                    {i < 4 && <div className="my-0.5 h-6 w-0.5 bg-gray-200" />}
                  </div>
                  <div className="flex-1 space-y-2 rounded-xl border border-gray-100 p-3">
                    <div className="flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 rounded bg-gray-200" />
                        <div className="h-3 w-48 rounded bg-gray-200" />
                        <div className="h-3 w-24 rounded bg-gray-200" />
                      </div>
                      <div className="h-5 w-16 rounded-full bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg border border-gray-100 bg-gray-50" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg border border-gray-100 bg-gray-50" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-32 rounded bg-gray-200" />
            <div className="mt-3 h-32 rounded-lg border border-gray-100 bg-gray-50" />
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="mt-3 space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg border border-gray-100 bg-gray-50" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
