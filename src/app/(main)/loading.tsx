export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-bg-input rounded-lg" />
          <div className="h-6 w-20 bg-bg-input rounded-full" />
        </div>
      </div>

      {/* Composer skeleton */}
      <div className="border-b border-border pb-3 mb-3">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-bg-input shrink-0" />
          <div className="flex-1">
            <div className="h-5 w-48 bg-bg-input rounded-lg" />
          </div>
        </div>
      </div>

      {/* Search skeleton */}
      <div className="h-9 bg-bg-input rounded-full mb-3" />

      {/* Post skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-3 py-4 border-b border-border">
          <div className="w-9 h-9 rounded-full bg-bg-input shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="h-4 w-24 bg-bg-input rounded" />
              <div className="h-3 w-12 bg-bg-input rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-bg-input rounded" />
              <div className="h-4 w-3/4 bg-bg-input rounded" />
            </div>
            <div className="flex gap-5 pt-1">
              <div className="h-4 w-10 bg-bg-input rounded" />
              <div className="h-4 w-10 bg-bg-input rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
