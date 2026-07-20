"use client";

export function ProposalSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Overview card skeleton */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="h-3 w-24 rounded bg-gray-100" />
                      <div className="h-3 w-32 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-4 w-36 rounded bg-gray-200" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-gray-100" />
                      <div className="h-3 flex-1 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Content card skeleton */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex gap-6">
              <div className="w-40 space-y-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-3 w-full rounded bg-gray-100" />
                ))}
              </div>
              <div className="flex-1 space-y-4">
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-3 w-full rounded bg-gray-100" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="h-4 w-28 rounded bg-gray-200 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-3 w-full rounded bg-gray-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
