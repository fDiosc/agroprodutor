export default function MeteorologiaLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="h-10 w-64 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
    </div>
  )
}
