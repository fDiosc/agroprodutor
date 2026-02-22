import { Skeleton } from '@/components/shared/skeleton'

export default function ESGReportLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}
