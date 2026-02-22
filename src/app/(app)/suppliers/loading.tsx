import { Skeleton } from '@/components/shared/skeleton'

export default function SuppliersLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}
