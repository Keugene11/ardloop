export default function ProfileLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-bg-input shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-36 bg-bg-input rounded" />
          <div className="h-3.5 w-44 bg-bg-input rounded" />
        </div>
      </div>
      <div className="h-20 bg-bg-input rounded-xl mb-8" />
      <div className="h-4 w-16 bg-bg-input rounded mb-3" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-bg-input rounded-2xl h-28 mb-3" />
      ))}
    </div>
  );
}
