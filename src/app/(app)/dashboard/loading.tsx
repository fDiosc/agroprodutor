import { Skeleton } from '@/components/shared/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-5 w-96" />
      </div>
      {/* Semaphore skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      {/* Property cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-lg" />)}
      </div>
    </div>
  )
}
