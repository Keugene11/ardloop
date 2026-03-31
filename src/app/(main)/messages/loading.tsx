export default function MessagesLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-28 bg-bg-input rounded-lg mb-6" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 py-3.5 border-b border-border">
          <div className="w-12 h-12 rounded-full bg-bg-input shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-28 bg-bg-input rounded" />
              <div className="h-3 w-10 bg-bg-input rounded" />
            </div>
            <div className="h-3.5 w-44 bg-bg-input rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
