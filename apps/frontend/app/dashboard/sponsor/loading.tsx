export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-1 h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-200" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[--color-border] px-4 py-3">
            <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-6 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Card grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[--color-border] bg-[--color-background] p-4 shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="flex gap-1">
                <div className="h-7 w-7 animate-pulse rounded bg-gray-200" />
                <div className="h-7 w-7 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            {/* Description */}
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200" />
            {/* Status */}
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-gray-200" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
            {/* Key-value pairs */}
            <div className="mt-3 space-y-1.5 border-t border-[--color-border] pt-3">
              <div className="flex justify-between">
                <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
