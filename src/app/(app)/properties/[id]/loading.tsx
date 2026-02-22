import { Skeleton } from '@/components/shared/skeleton'

export default function PropertyDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
      <Skeleton className="h-96 rounded-lg" />
    </div>
  )
}
