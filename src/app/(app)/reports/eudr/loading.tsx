import { Skeleton } from '@/components/shared/skeleton'

export default function ReportLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}
