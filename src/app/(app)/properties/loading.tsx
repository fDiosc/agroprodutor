import { Skeleton } from '@/components/shared/skeleton'

export default function PropertiesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
      </div>
    </div>
  )
}
