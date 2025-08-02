export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-6 animate-pulse rounded bg-gray-200" />
      <div className="h-8 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded bg-gray-200"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded bg-gray-200" />
    </div>
  );
}
