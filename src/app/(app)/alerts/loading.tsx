import { Skeleton } from '@/components/shared/skeleton'

export default function AlertsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
      </div>
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-lg" />)}
    </div>
  )
}
